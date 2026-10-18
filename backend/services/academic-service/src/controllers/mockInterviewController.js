const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const saveMockInterviewSchema = z.object({
  id: z.string().optional(),
  title: z.string().default('Mock Interview Session'),
  date: z.string().transform((val) => new Date(val)),
  courseId: z.string().min(1, 'Course is required'),
  batchId: z.string().optional().nullable(),
  totalMarks: z.number().default(35),
  description: z.string().optional().nullable(),
  results: z.array(
    z.object({
      studentId: z.string().min(1),
      marksObtained: z.number().min(0).max(35, 'Marks cannot exceed 35'),
      feedback: z.string().optional().nullable(),
    })
  ),
});

class MockInterviewController {
  /**
   * Admin: List all Mock Interview sessions
   */
  async getAll(req, res, next) {
    try {
      const { courseId, search = '', page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        ...(courseId && { courseId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { course: { title: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      const [total, interviews] = await prisma.$transaction([
        prisma.mockInterview.count({ where }),
        prisma.mockInterview.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: {
            course: { select: { id: true, title: true, slug: true } },
            batch: { select: { id: true, name: true, batchCode: true } },
            _count: { select: { results: true } },
          },
        }),
      ]);

      return paginatedResponse(res, {
        data: interviews,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Load Session by Date & Course
   * Auto-loads enrolled students and any existing scores for that day
   */
  async getSession(req, res, next) {
    try {
      const { courseId, date, id } = req.query;

      if (!courseId) {
        return errorResponse(res, { statusCode: 400, message: 'courseId is required' });
      }

      // 1. Fetch course details
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true, slug: true },
      });

      if (!course) {
        return errorResponse(res, { statusCode: 404, message: 'Course not found' });
      }

      // 2. Fetch all active enrolled students in this course
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          status: 'ACTIVE',
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatarUrl: true,
                },
              },
            },
          },
          batch: { select: { id: true, name: true, batchCode: true } },
        },
        orderBy: {
          student: {
            enrollmentNumber: 'asc',
          },
        },
      });

      // 3. Check for existing mock interview
      let mockInterview = null;

      if (id) {
        mockInterview = await prisma.mockInterview.findUnique({
          where: { id },
          include: {
            results: true,
          },
        });
      } else if (date) {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        mockInterview = await prisma.mockInterview.findFirst({
          where: {
            courseId,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            results: true,
          },
        });
      }

      // 4. Map results by studentId for quick lookup
      const resultsMap = {};
      if (mockInterview?.results) {
        mockInterview.results.forEach((r) => {
          resultsMap[r.studentId] = r;
        });
      }

      // 5. Structure student roster with any existing marks
      const students = enrollments.map((enr) => {
        const existingResult = resultsMap[enr.studentId];
        return {
          studentId: enr.studentId,
          enrollmentId: enr.id,
          enrollmentNumber: enr.student.enrollmentNumber,
          rollNumber: enr.student.rollNumber,
          user: enr.student.user,
          batch: enr.batch,
          marksObtained: existingResult ? existingResult.marksObtained : null,
          feedback: existingResult ? existingResult.feedback : '',
          resultId: existingResult ? existingResult.id : null,
        };
      });

      return successResponse(res, {
        data: {
          course,
          mockInterview: mockInterview
            ? {
                id: mockInterview.id,
                title: mockInterview.title,
                date: mockInterview.date,
                totalMarks: mockInterview.totalMarks,
                description: mockInterview.description,
              }
            : null,
          students,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Submit & Publish / Update Mock Interview and Marks
   */
  async saveSession(req, res, next) {
    try {
      const data = saveMockInterviewSchema.parse(req.body);

      // Verify course exists
      const course = await prisma.course.findUnique({ where: { id: data.courseId } });
      if (!course) {
        return errorResponse(res, { statusCode: 404, message: 'Course not found' });
      }

      let mockInterviewId = data.id;

      // If no ID provided, check if one already exists for this date and course
      if (!mockInterviewId) {
        const queryDate = new Date(data.date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        const existing = await prisma.mockInterview.findFirst({
          where: {
            courseId: data.courseId,
            date: { gte: startOfDay, lte: endOfDay },
          },
        });

        if (existing) {
          mockInterviewId = existing.id;
        }
      }

      // Upsert mock interview header
      let interview;
      if (mockInterviewId) {
        interview = await prisma.mockInterview.update({
          where: { id: mockInterviewId },
          data: {
            title: data.title || `${course.title} Mock Interview`,
            date: data.date,
            totalMarks: 35.0,
            description: data.description,
            conductedById: req.user.id,
          },
        });
      } else {
        interview = await prisma.mockInterview.create({
          data: {
            title: data.title || `${course.title} Mock Interview`,
            date: data.date,
            courseId: data.courseId,
            batchId: data.batchId || null,
            totalMarks: 35.0,
            description: data.description,
            conductedById: req.user.id,
          },
        });
      }

      // Save / update each student result
      const savedResults = [];
      for (const item of data.results) {
        const marks = Number(item.marksObtained);
        const percentage = Math.min(100, Math.max(0, Math.round((marks / 35.0) * 100 * 10) / 10));

        const result = await prisma.mockResult.upsert({
          where: {
            mockInterviewId_studentId: {
              mockInterviewId: interview.id,
              studentId: item.studentId,
            },
          },
          update: {
            marksObtained: marks,
            percentage,
            feedback: item.feedback || null,
            status: 'PUBLISHED',
            enteredById: req.user.id,
          },
          create: {
            mockInterviewId: interview.id,
            studentId: item.studentId,
            marksObtained: marks,
            percentage,
            feedback: item.feedback || null,
            status: 'PUBLISHED',
            enteredById: req.user.id,
          },
        });
        savedResults.push(result);
      }

      await logAudit({
        userId: req.user.id,
        action: 'MOCK_INTERVIEW_SAVED',
        entity: 'MockInterview',
        entityId: interview.id,
        details: {
          courseId: data.courseId,
          date: data.date,
          resultsCount: savedResults.length,
        },
        req,
      });

      await invalidateCache(['mock_interviews']);

      return successResponse(res, {
        statusCode: 200,
        message: 'Mock Interview marks submitted and published successfully',
        data: {
          mockInterview: interview,
          resultsCount: savedResults.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get single mock interview by ID with results
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const interview = await prisma.mockInterview.findUnique({
        where: { id },
        include: {
          course: { select: { id: true, title: true, slug: true } },
          batch: { select: { id: true, name: true, batchCode: true } },
          results: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
            orderBy: { student: { enrollmentNumber: 'asc' } },
          },
        },
      });

      if (!interview) {
        return errorResponse(res, { statusCode: 404, message: 'Mock interview not found' });
      }

      return successResponse(res, { data: { interview } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete mock interview
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.mockInterview.delete({ where: { id } });

      await logAudit({
        userId: req.user.id,
        action: 'MOCK_INTERVIEW_DELETED',
        entity: 'MockInterview',
        entityId: id,
        details: {},
        req,
      });

      await invalidateCache(['mock_interviews']);

      return successResponse(res, { message: 'Mock interview deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Student: Month-by-month Progress Report of Mock Interview scores (out of 35)
   */
  async getMyProgressReport(req, res, next) {
    try {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!studentProfile) {
        return errorResponse(res, { statusCode: 404, message: 'Student profile not found' });
      }

      const results = await prisma.mockResult.findMany({
        where: {
          studentId: studentProfile.id,
          status: 'PUBLISHED',
        },
        include: {
          mockInterview: {
            include: {
              course: { select: { id: true, title: true, slug: true } },
              batch: { select: { id: true, name: true, batchCode: true } },
            },
          },
        },
        orderBy: {
          mockInterview: {
            date: 'desc',
          },
        },
      });

      // Calculate statistics
      const totalTests = results.length;
      let totalMarksSum = 0;
      let highestMarks = 0;
      let lowestMarks = totalTests > 0 ? 35 : 0;

      // Group chronologically by Month-Year (e.g. "October 2026")
      const monthlyGroups = {};

      results.forEach((r) => {
        const marks = r.marksObtained;
        totalMarksSum += marks;
        if (marks > highestMarks) highestMarks = marks;
        if (marks < lowestMarks) lowestMarks = marks;

        const d = new Date(r.mockInterview.date);
        const monthKey = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = {
            month: monthKey,
            tests: [],
            totalMonthMarks: 0,
            averagePercentage: 0,
          };
        }

        monthlyGroups[monthKey].tests.push({
          id: r.id,
          interviewId: r.mockInterview.id,
          title: r.mockInterview.title,
          date: r.mockInterview.date,
          course: r.mockInterview.course?.title || 'Course',
          marksObtained: r.marksObtained,
          totalMarks: 35.0,
          percentage: r.percentage,
          feedback: r.feedback,
        });

        monthlyGroups[monthKey].totalMonthMarks += marks;
      });

      // Compute averages per month
      const monthlyReport = Object.values(monthlyGroups).map((group) => {
        const count = group.tests.length;
        const avgMarks = count > 0 ? (group.totalMonthMarks / count) : 0;
        const avgPercentage = Math.round((avgMarks / 35.0) * 100 * 10) / 10;
        return {
          ...group,
          averageMarks: Math.round(avgMarks * 10) / 10,
          averagePercentage: avgPercentage,
        };
      });

      const averageScore = totalTests > 0 ? Math.round((totalMarksSum / totalTests) * 10) / 10 : 0;
      const averagePercentage = Math.round((averageScore / 35.0) * 100 * 10) / 10;

      return successResponse(res, {
        data: {
          summary: {
            totalTests,
            averageScore,
            totalMarks: 35.0,
            averagePercentage,
            highestMarks: totalTests > 0 ? highestMarks : 0,
            lowestMarks: totalTests > 0 ? lowestMarks : 0,
          },
          monthlyReport,
          recentTests: results.slice(0, 5).map((r) => ({
            id: r.id,
            title: r.mockInterview.title,
            date: r.mockInterview.date,
            course: r.mockInterview.course?.title || 'Course',
            marksObtained: r.marksObtained,
            totalMarks: 35.0,
            percentage: r.percentage,
            feedback: r.feedback,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MockInterviewController();
