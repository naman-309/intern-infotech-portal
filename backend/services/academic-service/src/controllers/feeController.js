const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  queueEmail,
  invalidateCache,
} = require('@portal/shared');

const updateFeeSchema = z.object({
  originalFee: z.number().nonnegative('Original course fee cannot be negative').optional(),
  discountAmount: z.number().nonnegative('Discount amount cannot be negative').optional(),
  paidAmount: z.number().nonnegative('Paid amount cannot be negative').optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD']).default('UPI'),
  transactionRef: z.string().optional(),
  receiptNumber: z.string().optional(),
  remarks: z.string().optional(),
  paidAt: z.string().optional().transform((val) => (val ? new Date(val) : new Date())),
});

class FeeController {
  /**
   * Student: Get Own Fee Records
   */
  async getMyFees(req, res, next) {
    try {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!studentProfile) {
        return errorResponse(res, { statusCode: 404, message: 'Student profile not found' });
      }

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

      return successResponse(res, {
        data: {
          feeRecords,
          summary: {
            totalCourseFees,
            totalPaid,
            totalBalance,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List All Student Fee Records
   */
  async getAllFees(req, res, next) {
    try {
      const { batchId, courseId, paymentStatus, search = '', page = 1, limit = 15 } = req.query;
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

      return paginatedResponse(res, {
        data: records,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Record Partial or Full Payment with Transaction Log & Email Alert
   */
  async recordPayment(req, res, next) {
    try {
      const { id } = req.params;
      const data = recordPaymentSchema.parse(req.body);

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
        return errorResponse(res, { statusCode: 404, message: 'Fee record not found' });
      }

      const newPaidAmount = feeRecord.paidAmount + data.amount;
      const newBalanceAmount = Math.max(0, feeRecord.totalFee - newPaidAmount);
      const newPaymentStatus = newBalanceAmount === 0 ? 'PAID' : 'PARTIAL';
      const receiptNumber = data.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`;

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
            recordedById: req.user.id,
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

      // Trigger Redis Pub/Sub email event to instantly notify student
      try {
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
          });
          console.log(`[FeeController] Successfully queued FEE_PAYMENT receipt email to ${studentEmail}`);
        } else {
          console.warn('[FeeController] Fee record student user email not found');
        }
      } catch (emailErr) {
        console.warn('[FeeController] Failed to queue fee payment email:', emailErr.message);
      }

      await logAudit({
        userId: req.user.id,
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

      // Invalidate fees AND users so student dashboard/360 view update immediately
      await invalidateCache(['fees', 'users']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Payment recorded and student notified successfully',
        data: {
          payment,
          feeRecord: updatedFeeRecord,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Fee Record (Configure Discount, Final Payable, or Payment Details)
   */
  async updateFeeRecord(req, res, next) {
    try {
      const { id } = req.params;
      const data = updateFeeSchema.parse(req.body);

      const existing = await prisma.feeRecord.findUnique({
        where: { id },
        include: { course: true },
      });
      if (!existing) {
        return errorResponse(res, { statusCode: 404, message: 'Fee record not found' });
      }

      // Determine originalFee (fall back to existing.originalFee, or course advertisedFee if 0)
      const originalFee = data.originalFee !== undefined
        ? data.originalFee
        : (existing.originalFee > 0 ? existing.originalFee : (existing.course?.advertisedFee || existing.totalFee));

      // Determine discountAmount
      const discountAmount = data.discountAmount !== undefined
        ? data.discountAmount
        : existing.discountAmount;

      // Validate: discount cannot exceed original course fee or create negative balance
      if (discountAmount > originalFee) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Discount (₹${discountAmount.toLocaleString()}) cannot exceed original published course fee (₹${originalFee.toLocaleString()}).`,
        });
      }

      // Final payable amount = Original course fee - Discount amount
      const totalFee = Math.max(0, originalFee - discountAmount);

      // Paid amount
      const paidAmount = data.paidAmount !== undefined ? data.paidAmount : existing.paidAmount;

      // Remaining balance = Final payable amount - Total amount paid
      const balanceAmount = Math.max(0, totalFee - paidAmount);

      // Determine payment status
      let paymentStatus = data.paymentStatus;
      if (!paymentStatus) {
        paymentStatus = balanceAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING');
      } else if (balanceAmount === 0) {
        paymentStatus = 'PAID';
      }

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

      await logAudit({
        userId: req.user.id,
        action: 'FEE_RECORD_UPDATED',
        entity: 'FeeRecord',
        entityId: id,
        details: { originalFee, discountAmount, totalFee, paidAmount, balanceAmount, paymentStatus },
        req,
      });

      // Invalidate fees and users so student profile/dashboard reflects updated discount and dues immediately
      await invalidateCache(['fees', 'users']);

      return successResponse(res, {
        message: 'Fee record and discount updated successfully',
        data: { feeRecord: updated },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeeController();
