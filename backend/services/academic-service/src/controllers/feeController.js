const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  queueEmail,
} = require('@portal/shared');

const updateFeeSchema = z.object({
  paidAmount: z.number().nonnegative(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']),
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
   * Admin: Update Fee Record
   */
  async updateFeeRecord(req, res, next) {
    try {
      const { id } = req.params;
      const data = updateFeeSchema.parse(req.body);

      const existing = await prisma.feeRecord.findUnique({ where: { id } });
      if (!existing) {
        return errorResponse(res, { statusCode: 404, message: 'Fee record not found' });
      }

      const balanceAmount = Math.max(0, existing.totalFee - data.paidAmount);

      const updated = await prisma.feeRecord.update({
        where: { id },
        data: {
          paidAmount: data.paidAmount,
          balanceAmount,
          paymentStatus: balanceAmount === 0 ? 'PAID' : data.paymentStatus,
          notes: data.notes,
          dueDate: data.dueDate !== undefined ? data.dueDate : existing.dueDate,
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'FEE_RECORD_UPDATED',
        entity: 'FeeRecord',
        entityId: id,
        details: { paidAmount: data.paidAmount, balanceAmount },
        req,
      });

      return successResponse(res, {
        message: 'Fee record updated successfully',
        data: { feeRecord: updated },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeeController();
