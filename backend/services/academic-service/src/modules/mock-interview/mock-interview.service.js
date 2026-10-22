const {
  prisma,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * List all Mock Interview sessions
 */
const getAll = async ({ courseId, search = '', page = 1, limit = 20 }) => {
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

  return { interviews, total, page: Number(page), limit: Number(limit) };
};

/**
 * Load Session by Date & Course
 */
const getSession = async ({ courseId, date, id }) => {
  if (!courseId) {
    const error = new Error('courseId is required');
    error.statusCode = 400;
    throw error;
  }

  // Fetch course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, slug: true },
  });

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch active enrolled students
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

  // Check for existing mock interview
  let mockInterview = null;

  if (id) {
    mockInterview = await prisma.mockInterview.findUnique({
      where: { id },
      include: { results: true },
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
      include: { results: true },
    });
  }

  const resultsMap = {};
  if (mockInterview?.results) {
    mockInterview.results.forEach((r) => {
      resultsMap[r.studentId] = r;
    });
  }

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

  return {
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
  };
};

/**
 * Submit & Publish / Update Mock Interview and Marks
 */
const saveSession = async (data, user, req) => {
  const course = await prisma.course.findUnique({ where: { id: data.courseId } });
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  let mockInterviewId = data.id;

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

  let interview;
  if (mockInterviewId) {
    interview = await prisma.mockInterview.update({
      where: { id: mockInterviewId },
      data: {
        title: data.title || `${course.title} Mock Interview`,
        date: data.date,
        totalMarks: 35.0,
        description: data.description,
        conductedById: user.id,
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
        conductedById: user.id,
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
        enteredById: user.id,
      },
      create: {
        mockInterviewId: interview.id,
        studentId: item.studentId,
        marksObtained: marks,
        percentage,
        feedback: item.feedback || null,
        status: 'PUBLISHED',
        enteredById: user.id,
      },
    });
    savedResults.push(result);
  }

  // Log audit event
  await logAudit({
    userId: user.id,
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

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('mock_interviews', 'users');
  await invalidateCache(['mock_interviews', 'users']);

  return {
    mockInterview: interview,
    resultsCount: savedResults.length,
  };
};

/**
 * Get single mock interview by ID with results
 */
const getById = async (id) => {
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
    const error = new Error('Mock interview not found');
    error.statusCode = 404;
    throw error;
  }

  return interview;
};

/**
 * Delete mock interview
 */
const deleteInterview = async (id, user, req) => {
  await prisma.mockInterview.delete({ where: { id } });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'MOCK_INTERVIEW_DELETED',
    entity: 'MockInterview',
    entityId: id,
    details: {},
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('mock_interviews', 'users');
  await invalidateCache(['mock_interviews', 'users']);

  return { message: 'Mock interview deleted successfully' };
};

/**
 * Student: Progress Report of Mock Interview scores
 */
const getMyProgressReport = async (user) => {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!studentProfile) {
    const error = new Error('Student profile not found');
    error.statusCode = 404;
    throw error;
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

  const totalTests = results.length;
  let totalMarksSum = 0;
  let highestMarks = 0;
  let lowestMarks = totalTests > 0 ? 35 : 0;

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

  return {
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
  };
};

module.exports = {
  getAll,
  getSession,
  saveSession,
  getById,
  deleteInterview,
  getMyProgressReport,
};
