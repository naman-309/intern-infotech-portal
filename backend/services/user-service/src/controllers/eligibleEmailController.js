const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const createEligibleSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(2, 'Full name is required'),
  offlineRegNumber: z.string().optional(),
  phone: z.string().optional(),
  courseHint: z.string().optional(),
});

const bulkImportSchema = z.object({
  students: z.array(createEligibleSchema).min(1, 'Provide at least one student record'),
});

class EligibleEmailController {
  /**
   * List Authorized Eligible Emails
   */
  async getEligibleEmails(req, res, next) {
    try {
      const { search = '', isRegistered, page = 1, limit = 15 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        ...(isRegistered !== undefined && { isRegistered: isRegistered === 'true' }),
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { offlineRegNumber: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [total, records] = await prisma.$transaction([
        prisma.eligibleStudentEmail.count({ where }),
        prisma.eligibleStudentEmail.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            addedByAdmin: {
              select: { id: true, firstName: true, lastName: true },
            },
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
   * Add a single eligible student record
   */
  async addEligibleEmail(req, res, next) {
    try {
      const data = createEligibleSchema.parse(req.body);
      const normalizedEmail = data.email.toLowerCase().trim();

      const existing = await prisma.eligibleStudentEmail.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'An eligible record for this email already exists.',
        });
      }

      const record = await prisma.eligibleStudentEmail.create({
        data: {
          email: normalizedEmail,
          fullName: data.fullName,
          offlineRegNumber: data.offlineRegNumber || `OFFLINE-${Date.now().toString().slice(-6)}`,
          phone: data.phone,
          courseHint: data.courseHint,
          addedByAdminId: req.user.id,
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'ELIGIBLE_EMAIL_ADDED',
        entity: 'EligibleStudentEmail',
        entityId: record.id,
        details: { email: normalizedEmail, fullName: data.fullName },
        req,
      });

      await invalidateCache(['eligible_emails']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Eligible student email record created successfully.',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk import eligible students (e.g. from CSV / batch enrollment)
   */
  async bulkImport(req, res, next) {
    try {
      const { students } = bulkImportSchema.parse(req.body);

      let createdCount = 0;
      let skippedCount = 0;

      for (const item of students) {
        const normalizedEmail = item.email.toLowerCase().trim();
        const existing = await prisma.eligibleStudentEmail.findUnique({
          where: { email: normalizedEmail },
        });

        if (!existing) {
          await prisma.eligibleStudentEmail.create({
            data: {
              email: normalizedEmail,
              fullName: item.fullName,
              offlineRegNumber: item.offlineRegNumber || `OFFLINE-${Date.now().toString().slice(-6)}-${createdCount}`,
              phone: item.phone,
              courseHint: item.courseHint,
              addedByAdminId: req.user.id,
            },
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      await logAudit({
        userId: req.user.id,
        action: 'ELIGIBLE_EMAILS_BULK_IMPORTED',
        entity: 'EligibleStudentEmail',
        details: { imported: createdCount, skipped: skippedCount },
        req,
      });

      await invalidateCache(['eligible_emails']);

      return successResponse(res, {
        message: `Bulk import completed: ${createdCount} added, ${skippedCount} skipped (already existed).`,
        data: { createdCount, skippedCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove an eligible record
   */
  async deleteEligibleEmail(req, res, next) {
    try {
      const { id } = req.params;
      const record = await prisma.eligibleStudentEmail.findUnique({ where: { id } });
      if (!record) {
        return errorResponse(res, { statusCode: 404, message: 'Record not found' });
      }

      await prisma.eligibleStudentEmail.delete({ where: { id } });

      await logAudit({
        userId: req.user.id,
        action: 'ELIGIBLE_EMAIL_DELETED',
        entity: 'EligibleStudentEmail',
        entityId: id,
        details: { email: record.email },
        req,
      });

      await invalidateCache(['eligible_emails']);

      return successResponse(res, { message: 'Eligible student record removed.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EligibleEmailController();
