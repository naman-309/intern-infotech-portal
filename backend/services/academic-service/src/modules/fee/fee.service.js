const {
  prisma,
  logAudit,
  queueEmail,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * Student: Get Own Fee Records
 */
const getMyFees = async (user) => {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!studentProfile) {
    const error = new Error('Student profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Find fee records with associated courses and payments
  const feeRecords = await prisma.feeRecord.findMany({
    where: { studentId: studentProfile.id },
    include: {
      course: { select: { id: true, title: true, advertisedFee: true, duration: true } },
      batch: { select: { id: true, name: true, batchCode: true, startDate: true } },
      payments: { orderBy: { paidAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals
  let totalCourseFees = 0;
  let totalPaid = 0;
  let totalBalance = 0;

  feeRecords.forEach((f) => {
    totalCourseFees += f.totalFee;
    totalPaid += f.paidAmount;
    totalBalance += f.balanceAmount;
  });

  return {
    feeRecords,
    summary: {
      totalCourseFees,
      totalPaid,
      totalBalance,
    },
  };
};

/**
 * Admin: List All Student Fee Records
 */
const getAllFees = async ({ batchId, courseId, paymentStatus, search = '', page = 1, limit = 15 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    ...(batchId && { batchId }),
    ...(courseId && { courseId }),
    ...(paymentStatus && { paymentStatus }),
    ...(search && {
      student: {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    }),
  };

  // Run count and query in transaction
  const [total, records] = await prisma.$transaction([
    prisma.feeRecord.count({ where }),
    prisma.feeRecord.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true, batchCode: true } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    }),
  ]);

  return { records, total, page: Number(page), limit: Number(limit) };
};

/**
 * Admin: Record Payment
 */
const recordPayment = async (id, data, user, req) => {
  const feeRecord = await prisma.feeRecord.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      student: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  if (!feeRecord) {
    const error = new Error('Fee record not found');
    error.statusCode = 404;
    throw error;
  }

  const newPaidAmount = feeRecord.paidAmount + data.amount;
  const newBalanceAmount = Math.max(0, feeRecord.totalFee - newPaidAmount);
  const newPaymentStatus = newBalanceAmount === 0 ? 'PAID' : 'PARTIAL';
  const receiptNumber = data.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`;

  // Save payment and update fee record in transaction
  const [payment, updatedFeeRecord] = await prisma.$transaction([
    prisma.feePayment.create({
      data: {
        feeRecordId: id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef || null,
        receiptNumber,
        remarks: data.remarks || null,
        paidAt: data.paidAt || new Date(),
        recordedById: user.id,
      },
    }),
    prisma.feeRecord.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newPaymentStatus,
      },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true, batchCode: true } },
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    }),
  ]);

  // Queue receipt email to student
  const studentEmail = feeRecord.student?.user?.email;
  if (studentEmail) {
    await queueEmail('FEE_PAYMENT', {
      to: studentEmail,
      email: studentEmail,
      studentName: `${feeRecord.student.user.firstName} ${feeRecord.student.user.lastName}`,
      courseTitle: feeRecord.course?.title || 'Enrolled Course',
      courseName: feeRecord.course?.title || 'Enrolled Course',
      amount: data.amount,
      amountPaid: data.amount,
      totalFee: feeRecord.totalFee,
      totalPaid: newPaidAmount,
      balanceAmount: newBalanceAmount,
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef || 'N/A',
      receiptNumber,
      paidAt: payment.paidAt,
    }).catch(() => {});
  }

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'FEE_PAYMENT_RECORDED',
    entity: 'FeePayment',
    entityId: payment.id,
    details: {
      feeRecordId: id,
      amountPaid: data.amount,
      newPaidAmount,
      newBalanceAmount,
      paymentMethod: data.paymentMethod,
    },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  const studentUserId = feeRecord.student?.user?.id;
  await redisClient.del('fees', 'users', studentUserId ? `cache:fees:student:${studentUserId}` : '');
  await invalidateCache(['fees', 'users']);

  return { payment, feeRecord: updatedFeeRecord };
};

/**
 * Admin: Update Fee Record
 */
const updateFeeRecord = async (id, data, user, req) => {
  const existing = await prisma.feeRecord.findUnique({
    where: { id },
    include: {
      course: true,
      student: { include: { user: true } },
    },
  });
  if (!existing) {
    const error = new Error('Fee record not found');
    error.statusCode = 404;
    throw error;
  }

  const originalFee = data.originalFee !== undefined
    ? data.originalFee
    : (existing.originalFee > 0 ? existing.originalFee : (existing.course?.advertisedFee || existing.totalFee));

  const discountAmount = data.discountAmount !== undefined
    ? data.discountAmount
    : existing.discountAmount;

  if (discountAmount > originalFee) {
    const error = new Error(`Discount (₹${discountAmount.toLocaleString()}) cannot exceed original published course fee (₹${originalFee.toLocaleString()}).`);
    error.statusCode = 400;
    throw error;
  }

  const totalFee = Math.max(0, originalFee - discountAmount);
  const paidAmount = data.paidAmount !== undefined ? data.paidAmount : existing.paidAmount;
  const balanceAmount = Math.max(0, totalFee - paidAmount);

  let paymentStatus = data.paymentStatus;
  if (!paymentStatus) {
    paymentStatus = balanceAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING');
  } else if (balanceAmount === 0) {
    paymentStatus = 'PAID';
  }

  // Update in database
  const updated = await prisma.feeRecord.update({
    where: { id },
    data: {
      originalFee,
      discountAmount,
      totalFee,
      paidAmount,
      balanceAmount,
      paymentStatus,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      dueDate: data.dueDate !== undefined ? data.dueDate : existing.dueDate,
    },
    include: {
      course: { select: { id: true, title: true, advertisedFee: true } },
      batch: { select: { id: true, name: true, batchCode: true } },
      student: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      payments: { orderBy: { paidAt: 'desc' } },
    },
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'FEE_RECORD_UPDATED',
    entity: 'FeeRecord',
    entityId: id,
    details: { originalFee, discountAmount, totalFee, paidAmount, balanceAmount, paymentStatus },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  const studentUserId = existing.student?.user?.id;
  await redisClient.del('fees', 'users', studentUserId ? `cache:fees:student:${studentUserId}` : '');
  await invalidateCache(['fees', 'users']);

  return updated;
};

module.exports = {
  getMyFees,
  getAllFees,
  recordPayment,
  updateFeeRecord,
};
