const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const saveMarksSchema = z.object({
  examId: z.string().uuid(),
  entries: z.array(
    z.object({
      studentId: z.string().uuid(),
      marksObtained: z.number().nonnegative('Marks cannot be negative'),
      remarks: z.string().optional(),
      reasonForChange: z.string().optional(),
    })
  ).min(1, 'At least one student mark entry is required'),
});

class ResultController {
  /**
   * Teacher / Admin: Enter or Edit Marks
   */
  async recordMarks(req, res, next) {
    try {
      const { examId, entries } = saveMarksSchema.parse(req.body);

      const exam = await prisma.offlineExam.findUnique({
        where: { id: examId },
        include: {
          batch: {
            include: {
              enrollments: true,
              teachers: true,
            },
          },
        },
      });

      if (!exam) {
        return errorResponse(res, { statusCode: 404, message: 'Examination record not found' });
      }

      // Teacher authorization check
      if (req.user.role === 'TEACHER') {
        const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: req.user.id } });
        const isAssigned = exam.batch.teachers.some((t) => t.teacherId === teacherProfile?.id);
        if (!isAssigned) {
          return errorResponse(res, {
            statusCode: 403,
            message: 'Forbidden. You are not authorized to enter marks for this batch.',
          });
        }
      }

      const enrolledStudentIds = new Set(exam.batch.enrollments.map((e) => e.studentId));

      // Validate each mark
      for (const entry of entries) {
        if (!enrolledStudentIds.has(entry.studentId)) {
          return errorResponse(res, {
            statusCode: 400,
            message: `Student with ID ${entry.studentId} is not enrolled in this batch.`,
          });
        }
        if (entry.marksObtained > exam.maxMarks) {
          return errorResponse(res, {
            statusCode: 400,
            message: `Marks entered (${entry.marksObtained}) cannot exceed examination maximum marks (${exam.maxMarks}).`,
          });
        }
      }

      // Upsert marks in transaction
      await prisma.$transaction(async (tx) => {
        for (const entry of entries) {
          const percentage = parseFloat(((entry.marksObtained / exam.maxMarks) * 100).toFixed(2));

          const existingResult = await tx.examResult.findUnique({
            where: {
              examId_studentId: {
                examId,
                studentId: entry.studentId,
              },
            },
          });

          if (existingResult) {
            // Check if marks changed
            if (existingResult.marksObtained !== entry.marksObtained) {
              // Record in ExamResultHistory
              await tx.examResultHistory.create({
                data: {
                  resultId: existingResult.id,
                  previousMarks: existingResult.marksObtained,
                  newMarks: entry.marksObtained,
                  reason: entry.reasonForChange || 'Academic revision by instructor',
                  changedById: req.user.id,
                },
              });
            }

            await tx.examResult.update({
              where: { id: existingResult.id },
              data: {
                marksObtained: entry.marksObtained,
                percentage,
                remarks: entry.remarks,
                updatedById: req.user.id,
                // Result retains exam status
                status: exam.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
              },
            });
          } else {
            await tx.examResult.create({
              data: {
                examId,
                studentId: entry.studentId,
                marksObtained: entry.marksObtained,
                percentage,
                remarks: entry.remarks,
                status: exam.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
                enteredById: req.user.id,
              },
            });
          }
        }
      });

      await logAudit({
        userId: req.user.id,
        action: 'MARKS_RECORDED',
        entity: 'OfflineExam',
        entityId: examId,
        details: { count: entries.length, examTitle: exam.title },
        req,
      });

      await invalidateCache(['exams', 'users', 'batches']);

      return successResponse(res, {
        message: 'Marks recorded successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Student: Get Own Published Examination Results
   */
  async getMyResults(req, res, next) {
    try {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!studentProfile) {
        return errorResponse(res, { statusCode: 404, message: 'Student profile not found' });
      }

      // Filter: ONLY published results for this student
      const results = await prisma.examResult.findMany({
        where: {
          studentId: studentProfile.id,
          status: 'PUBLISHED',
          exam: {
            status: 'PUBLISHED',
          },
        },
        orderBy: {
          exam: {
            examDate: 'desc',
          },
        },
        include: {
          exam: {
            include: {
              course: { select: { id: true, title: true } },
              batch: { select: { id: true, name: true, batchCode: true } },
            },
          },
        },
      });

      // Calculate overall statistics
      const totalExams = results.length;
      let totalMarksObtained = 0;
      let totalMaxMarks = 0;

      results.forEach((r) => {
        totalMarksObtained += r.marksObtained;
        totalMaxMarks += r.exam.maxMarks;
      });

      const overallPercentage = totalMaxMarks > 0
        ? parseFloat(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2))
        : 0;

      return successResponse(res, {
        data: {
          results,
          summary: {
            totalExams,
            totalMarksObtained,
            totalMaxMarks,
            overallPercentage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResultController();
