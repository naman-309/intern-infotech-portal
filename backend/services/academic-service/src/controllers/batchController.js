const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const createBatchSchema = z.object({
  name: z.string().min(3, 'Batch name is required'),
  batchCode: z.string().min(2, 'Unique batch code is required (e.g. BATCH-2026-FSD1)'),
  courseId: z.string().uuid('Valid course ID is required'),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  timing: z.string().optional(),
  capacity: z.number().int().positive().default(30),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED']).default('UPCOMING'),
});

const assignTeacherSchema = z.object({
  teacherId: z.string().uuid(),
  roleTitle: z.string().optional(),
});

const enrollStudentSchema = z.object({
  studentId: z.string().uuid(),
});

class BatchController {
  /**
   * List Batches
   */
  async getBatches(req, res, next) {
    try {
      const { courseId, status, search = '', page = 1, limit = 15 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        ...(courseId && { courseId }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { batchCode: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // If user is TEACHER, show batches assigned to this teacher
      if (req.user.role === 'TEACHER') {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId: req.user.id },
        });
        if (teacherProfile) {
          where.teachers = {
            some: { teacherId: teacherProfile.id },
          };
        }
      }

      // If user is STUDENT, show batches enrolled by this student
      if (req.user.role === 'STUDENT') {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: req.user.id },
        });
        if (studentProfile) {
          where.enrollments = {
            some: { studentId: studentProfile.id },
          };
        }
      }

      const [total, batches] = await prisma.$transaction([
        prisma.batch.count({ where }),
        prisma.batch.findMany({
          where,
          skip,
          take,
          orderBy: { startDate: 'desc' },
          include: {
            course: {
              select: { id: true, title: true, slug: true, duration: true, advertisedFee: true },
            },
            teachers: {
              include: {
                teacher: {
                  include: {
                    user: {
                      select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
            _count: {
              select: { enrollments: true, offlineExams: true },
            },
          },
        }),
      ]);

      return paginatedResponse(res, {
        data: batches,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Batch Details with Roster
   */
  async getBatchById(req, res, next) {
    try {
      const { id } = req.params;

      const batch = await prisma.batch.findUnique({
        where: { id },
        include: {
          course: true,
          teachers: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
                  },
                },
              },
            },
          },
          enrollments: {
            include: {
              student: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, status: true },
                  },
                },
              },
            },
          },
          offlineExams: {
            orderBy: { examDate: 'desc' },
          },
        },
      });

      if (!batch) {
        return errorResponse(res, { statusCode: 404, message: 'Batch not found' });
      }

      // Teacher authorization check: teacher can only see batches they are assigned to
      if (req.user.role === 'TEACHER') {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId: req.user.id },
        });
        const isAssigned = batch.teachers.some((t) => t.teacherId === teacherProfile?.id);
        if (!isAssigned) {
          return errorResponse(res, {
            statusCode: 403,
            message: 'Forbidden. You are not assigned to instruct this batch.',
          });
        }
      }

      return successResponse(res, { data: { batch } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create Batch
   */
  async createBatch(req, res, next) {
    try {
      const data = createBatchSchema.parse(req.body);

      const existingCode = await prisma.batch.findUnique({
        where: { batchCode: data.batchCode },
      });
      if (existingCode) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'A batch with this code already exists.',
        });
      }

      const batch = await prisma.batch.create({
        data,
        include: { course: true },
      });

      await logAudit({
        userId: req.user.id,
        action: 'BATCH_CREATED',
        entity: 'Batch',
        entityId: batch.id,
        details: { batchCode: batch.batchCode, name: batch.name },
        req,
      });

      await invalidateCache(['batches', 'courses']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Batch created successfully',
        data: { batch },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Batch
   */
  async updateBatch(req, res, next) {
    try {
      const { id } = req.params;
      const data = createBatchSchema.partial().parse(req.body);

      const batch = await prisma.batch.update({
        where: { id },
        data,
      });

      await logAudit({
        userId: req.user.id,
        action: 'BATCH_UPDATED',
        entity: 'Batch',
        entityId: batch.id,
        req,
      });

      await invalidateCache(['batches', 'courses']);

      return successResponse(res, {
        message: 'Batch updated successfully',
        data: { batch },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Assign Teacher to Batch
   */
  async assignTeacher(req, res, next) {
    try {
      const { id: batchId } = req.params;
      const { teacherId, roleTitle } = assignTeacherSchema.parse(req.body);

      const assignment = await prisma.teacherAssignment.upsert({
        where: {
          teacherId_batchId: {
            teacherId,
            batchId,
          },
        },
        update: { roleTitle },
        create: {
          teacherId,
          batchId,
          roleTitle: roleTitle || 'Primary Instructor',
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'TEACHER_ASSIGNED_TO_BATCH',
        entity: 'Batch',
        entityId: batchId,
        details: { teacherId, roleTitle },
        req,
      });

      await invalidateCache(['batches']);

      return successResponse(res, {
        message: 'Teacher assigned to batch successfully',
        data: { assignment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Remove Teacher from Batch
   */
  async removeTeacherAssignment(req, res, next) {
    try {
      const { id: batchId, teacherId } = req.params;

      await prisma.teacherAssignment.deleteMany({
        where: { batchId, teacherId },
      });

      await logAudit({
        userId: req.user.id,
        action: 'TEACHER_REMOVED_FROM_BATCH',
        entity: 'Batch',
        entityId: batchId,
        details: { teacherId },
        req,
      });

      await invalidateCache(['batches']);

      return successResponse(res, { message: 'Teacher assignment removed' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Enroll Student into Batch
   */
  async enrollStudent(req, res, next) {
    try {
      const { id: batchId } = req.params;
      const { studentId } = enrollStudentSchema.parse(req.body);

      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: { course: true },
      });
      if (!batch) {
        return errorResponse(res, { statusCode: 404, message: 'Batch not found' });
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId,
          batchId,
          courseId: batch.courseId,
          status: 'ACTIVE',
        },
      });

      // Automatically set joiningDate and journeyStatus on student profile if first course enrollment
      const totalEnrollments = await prisma.enrollment.count({
        where: { studentId },
      });
      if (totalEnrollments === 1) {
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            joiningDate: new Date(),
            journeyStatus: 'ACTIVE',
          },
        }).catch((err) => {
          console.error('[BatchController] Error setting first enrollment joiningDate:', err.message);
        });
      }

      // Create fee record if not already present
      const existingFee = await prisma.feeRecord.findFirst({
        where: { studentId, batchId },
      });
      if (!existingFee && batch.course.advertisedFee > 0) {
        await prisma.feeRecord.create({
          data: {
            studentId,
            courseId: batch.courseId,
            batchId: batch.id,
            totalFee: batch.course.advertisedFee,
            paidAmount: 0,
            balanceAmount: batch.course.advertisedFee,
            paymentStatus: 'PENDING',
          },
        });
      }

      await logAudit({
        userId: req.user.id,
        action: 'STUDENT_ENROLLED_IN_BATCH',
        entity: 'Batch',
        entityId: batchId,
        details: { studentId, courseId: batch.courseId },
        req,
      });

      await invalidateCache(['batches', 'fees']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Student enrolled successfully',
        data: { enrollment },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BatchController();
