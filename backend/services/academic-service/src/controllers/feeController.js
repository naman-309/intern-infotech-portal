const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
} = require('@portal/shared');

const updateFeeSchema = z.object({
  paidAmount: z.number().nonnegative(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']),
  notes: z.string().optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
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
