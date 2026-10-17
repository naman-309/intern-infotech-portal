const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  queueEmail,
} = require('@portal/shared');

const createExamSchema = z.object({
  title: z.string().min(3, 'Test title is required'),
  subject: z.string().min(2, 'Subject is required'),
  courseId: z.string().uuid(),
  batchId: z.string().uuid(),
  examDate: z.string().transform((val) => new Date(val)),
  maxMarks: z.number().positive('Maximum marks must be greater than zero'),
  description: z.string().optional(),
});

class ExamController {
  /**
   * List Offline Examinations
   * Filtered by role:
   * - Students: only published exams for their enrolled batches
   * - Teachers: exams for their assigned batches
   * - Admins: all exams
   */
  async getExams(req, res, next) {
    try {
      const { batchId, courseId, status, page = 1, limit = 15 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        ...(batchId && { batchId }),
        ...(courseId && { courseId }),
        ...(status && { status }),
      };

      if (req.user.role === 'STUDENT') {
        // Students can only see published exams
        where.status = 'PUBLISHED';
        const profile = await prisma.studentProfile.findUnique({
          where: { userId: req.user.id },
        });
        if (profile) {
          where.batch = {
            enrollments: {
              some: { studentId: profile.id },
            },
          };
        }
      } else if (req.user.role === 'TEACHER') {
        const profile = await prisma.teacherProfile.findUnique({
          where: { userId: req.user.id },
        });
        if (profile) {
          where.batch = {
            teachers: {
              some: { teacherId: profile.id },
            },
          };
        }
      }

      const [total, exams] = await prisma.$transaction([
        prisma.offlineExam.count({ where }),
        prisma.offlineExam.findMany({
          where,
          skip,
          take,
          orderBy: { examDate: 'desc' },
          include: {
            course: { select: { id: true, title: true } },
            batch: { select: { id: true, name: true, batchCode: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
            publishedBy: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { results: true } },
          },
        }),
      ]);

      return paginatedResponse(res, {
        data: exams,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Exam Details with Results
   */
  async getExamById(req, res, next) {
    try {
      const { id } = req.params;

      const exam = await prisma.offlineExam.findUnique({
        where: { id },
        include: {
          course: true,
          batch: {
            include: {
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                      },
                    },
                  },
                },
              },
            },
          },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          publishedBy: { select: { id: true, firstName: true, lastName: true } },
          results: {
            include: {
              student: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                  },
                },
              },
              history: {
                include: {
                  changedBy: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { changedAt: 'desc' },
              },
            },
          },
        },
      });

      if (!exam) {
        return errorResponse(res, { statusCode: 404, message: 'Offline examination not found' });
      }

      // If student is viewing, filter results to ONLY the student's own published result
      if (req.user.role === 'STUDENT') {
        if (exam.status !== 'PUBLISHED') {
          return errorResponse(res, { statusCode: 403, message: 'This examination result is not yet published.' });
        }
        const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
        const studentResult = exam.results.find((r) => r.studentId === profile?.id && r.status === 'PUBLISHED');
        return successResponse(res, {
          data: {
            exam: {
              ...exam,
              batch: { id: exam.batch.id, name: exam.batch.name, batchCode: exam.batch.batchCode },
              results: studentResult ? [studentResult] : [],
            },
          },
        });
      }

      return successResponse(res, { data: { exam } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Teacher / Admin: Create Offline Examination Record
   */
  async createExam(req, res, next) {
    try {
      const data = createExamSchema.parse(req.body);

      // Verify authorization if teacher
      if (req.user.role === 'TEACHER') {
        const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: req.user.id } });
        const isAssigned = await prisma.teacherAssignment.findFirst({
          where: { teacherId: teacherProfile.id, batchId: data.batchId },
        });
        if (!isAssigned) {
          return errorResponse(res, {
            statusCode: 403,
            message: 'Forbidden. You are not assigned to instruct this batch.',
          });
        }
      }

      const exam = await prisma.offlineExam.create({
        data: {
          ...data,
          createdById: req.user.id,
          status: 'DRAFT',
        },
        include: {
          course: true,
          batch: true,
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'OFFLINE_EXAM_CREATED',
        entity: 'OfflineExam',
        entityId: exam.id,
        details: { title: exam.title, batchId: exam.batchId, maxMarks: exam.maxMarks },
        req,
      });

      return successResponse(res, {
        statusCode: 201,
        message: 'Offline exam record created successfully. Marks can now be entered.',
        data: { exam },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Teacher / Admin: Publish Offline Exam Results
   */
  async publishExam(req, res, next) {
    try {
      const { id } = req.params;

      const exam = await prisma.offlineExam.findUnique({
        where: { id },
        include: {
          batch: {
            include: {
              enrollments: {
                include: {
                  student: {
                    include: { user: true },
                  },
                },
              },
            },
          },
          results: {
            include: {
              student: { include: { user: true } },
            },
          },
        },
      });

      if (!exam) {
        return errorResponse(res, { statusCode: 404, message: 'Exam record not found' });
      }

      if (exam.results.length === 0) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Cannot publish results. No marks have been recorded for this examination yet.',
        });
      }

      // Update exam status and all its marks to PUBLISHED
      await prisma.$transaction([
        prisma.offlineExam.update({
          where: { id },
          data: {
            status: 'PUBLISHED',
            publishedById: req.user.id,
            publishedAt: new Date(),
          },
        }),
        prisma.examResult.updateMany({
          where: { examId: id },
          data: { status: 'PUBLISHED' },
        }),
      ]);

      // Queue email notification to all students who received marks
      for (const resItem of exam.results) {
        if (resItem.student?.user?.email) {
          await queueEmail('EXAM_RESULT', {
            to: resItem.student.user.email,
            fullName: `${resItem.student.user.firstName} ${resItem.student.user.lastName}`,
            testTitle: exam.title,
            subject: exam.subject,
            marks: resItem.marksObtained,
            maxMarks: exam.maxMarks,
            percentage: resItem.percentage,
          });
        }
      }

      await logAudit({
        userId: req.user.id,
        action: 'EXAM_RESULTS_PUBLISHED',
        entity: 'OfflineExam',
        entityId: id,
        details: { examTitle: exam.title, studentCount: exam.results.length },
        req,
      });

      return successResponse(res, {
        message: `Offline exam results published successfully. Notifications dispatched to ${exam.results.length} students.`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Unpublish Exam Results (e.g. for rectification)
   */
  async unpublishExam(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.$transaction([
        prisma.offlineExam.update({
          where: { id },
          data: {
            status: 'DRAFT',
            publishedAt: null,
          },
        }),
        prisma.examResult.updateMany({
          where: { examId: id },
          data: { status: 'DRAFT' },
        }),
      ]);

      await logAudit({
        userId: req.user.id,
        action: 'EXAM_RESULTS_UNPUBLISHED',
        entity: 'OfflineExam',
        entityId: id,
        req,
      });

      return successResponse(res, {
        message: 'Exam results unpublished and reverted to Draft mode for corrections.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExamController();
