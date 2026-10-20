const { z } = require('zod');
const {
  prisma,
  config,
  successResponse,
  errorResponse,
  paginatedResponse,
  queueEmail,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reviewNote: z.string().optional(),
  assignedBatchId: z.string().optional(),
  assignedCourseId: z.string().optional(),
});

class RegistrationController {
  /**
   * List Pending Registration Requests
   * Admins see all; Teachers see student requests within their course scope
   */
  async getRequests(req, res, next) {
    try {
      const { role, status = 'PENDING', search = '', page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        ...(status && { status }),
        ...(role && { role }),
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // If reviewer is a TEACHER, restrict to STUDENT requests only
      if (req.user.role === 'TEACHER') {
        where.role = 'STUDENT';
      }

      const [total, requests] = await prisma.$transaction([
        prisma.registrationRequest.count({ where }),
        prisma.registrationRequest.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
        }),
      ]);

      return paginatedResponse(res, {
        data: requests,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Review Request (APPROVE or REJECT)
   */
  async reviewRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { action, reviewNote, assignedBatchId, assignedCourseId } = reviewSchema.parse(req.body);

      const request = await prisma.registrationRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return errorResponse(res, { statusCode: 404, message: 'Registration request not found' });
      }

      if (request.status !== 'PENDING') {
        return errorResponse(res, {
          statusCode: 400,
          message: `This request has already been ${request.status.toLowerCase()}.`,
        });
      }

      // Teachers cannot approve teacher requests
      if (req.user.role === 'TEACHER' && request.role === 'TEACHER') {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Only institute administrators can approve or reject teacher registrations.',
        });
      }

      // Rejection Flow
      if (action === 'REJECT') {
        const updated = await prisma.registrationRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewNote: reviewNote || 'Application details did not match institute offline enrollment criteria.',
            reviewerId: req.user.id,
            reviewedAt: new Date(),
          },
        });

        await queueEmail('REJECTION', {
          to: request.email,
          fullName: request.fullName,
          role: request.role,
          reviewNote: updated.reviewNote,
        });

        await logAudit({
          userId: req.user.id,
          action: `${request.role}_REGISTRATION_REJECTED`,
          entity: 'RegistrationRequest',
          entityId: id,
          details: { email: request.email, note: updated.reviewNote },
          req,
        });

        await invalidateCache(['registrations']);

        return successResponse(res, {
          message: `${request.role} registration request rejected.`,
          data: { request: updated },
        });
      }

      // Approval Flow
      // Check if user account was created while request was pending
      const existingUser = await prisma.user.findUnique({
        where: { email: request.email },
      });
      if (existingUser) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'A user account with this email already exists in the system.',
        });
      }

      const nameParts = request.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Account';

      if (request.role === 'STUDENT') {
        // Generate enrollment number
        const currentYear = new Date().getFullYear();
        const studentCount = await prisma.studentProfile.count();
        const enrollmentNumber = `IIT-${currentYear}-S${1001 + studentCount}`;
        const rollNumber = `R-${1001 + studentCount}`;

        // Create User, StudentProfile, Enrollment, update Request in single transaction
        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: request.email,
              passwordHash: request.passwordHash,
              role: 'STUDENT',
              status: 'ACTIVE',
              firstName,
              lastName,
              phone: request.phone,
            },
          });

          const profile = await tx.studentProfile.create({
            data: {
              userId: newUser.id,
              enrollmentNumber,
              rollNumber,
            },
          });

          // Mark eligible email as registered
          await tx.eligibleStudentEmail.updateMany({
            where: { email: request.email },
            data: { isRegistered: true },
          });

          // If a batch is assigned upon approval, enroll immediately
          if (assignedBatchId) {
            const batch = await tx.batch.findUnique({
              where: { id: assignedBatchId },
            });
            if (batch) {
              await tx.enrollment.create({
                data: {
                  studentId: profile.id,
                  batchId: batch.id,
                  courseId: batch.courseId,
                  status: 'ACTIVE',
                },
              });

              const course = await tx.course.findUnique({ where: { id: batch.courseId } });
              if (course && course.advertisedFee > 0) {
                await tx.feeRecord.create({
                  data: {
                    studentId: profile.id,
                    courseId: course.id,
                    batchId: batch.id,
                    originalFee: course.advertisedFee,
                    discountAmount: 0.0,
                    totalFee: course.advertisedFee,
                    paidAmount: 0.0,
                    balanceAmount: course.advertisedFee,
                    paymentStatus: 'PENDING',
                  },
                });
              }
            }
          }

          // Mark request as approved
          await tx.registrationRequest.update({
            where: { id },
            data: {
              status: 'APPROVED',
              reviewNote: reviewNote || 'Offline enrollment verified and approved.',
              reviewerId: req.user.id,
              reviewedAt: new Date(),
            },
          });
        });

        // Queue Approval Email
        const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
        const loginUrl = `${clientOrigin}/login`;
        await queueEmail('APPROVAL', {
          to: request.email,
          fullName: request.fullName,
          role: 'Student',
          loginUrl,
        });

        await logAudit({
          userId: req.user.id,
          action: 'STUDENT_REGISTRATION_APPROVED',
          entity: 'RegistrationRequest',
          entityId: id,
          details: { email: request.email, enrollmentNumber },
          req,
        });

        await invalidateCache(['registrations', 'users', 'batches', 'fees', 'eligible_emails']);

        return successResponse(res, {
          message: 'Student registration approved successfully and portal account activated.',
          data: { email: request.email, enrollmentNumber },
        });
      }

      if (request.role === 'TEACHER') {
        const teacherCount = await prisma.teacherProfile.count();
        const employeeId = `IIT-T${101 + teacherCount}`;

        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: request.email,
              passwordHash: request.passwordHash,
              role: 'TEACHER',
              status: 'ACTIVE',
              firstName,
              lastName,
              phone: request.phone,
            },
          });

          await tx.teacherProfile.create({
            data: {
              userId: newUser.id,
              employeeId,
              bio: request.reviewNote || undefined,
            },
          });

          await tx.registrationRequest.update({
            where: { id },
            data: {
              status: 'APPROVED',
              reviewNote: reviewNote || 'Teacher credentials verified and approved by admin.',
              reviewerId: req.user.id,
              reviewedAt: new Date(),
            },
          });
        });

        const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
        const loginUrl = `${clientOrigin}/login`;
        await queueEmail('APPROVAL', {
          to: request.email,
          fullName: request.fullName,
          role: 'Teacher',
          loginUrl,
        });

        await logAudit({
          userId: req.user.id,
          action: 'TEACHER_REGISTRATION_APPROVED',
          entity: 'RegistrationRequest',
          entityId: id,
          details: { email: request.email, employeeId },
          req,
        });

        await invalidateCache(['registrations', 'users', 'teachers_public']);

        return successResponse(res, {
          message: 'Teacher registration approved successfully and portal account activated.',
          data: { email: request.email, employeeId },
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RegistrationController();
