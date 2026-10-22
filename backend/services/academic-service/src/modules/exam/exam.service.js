const {
  prisma,
  logAudit,
  queueEmail,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * List Offline Examinations
 */
const getExams = async ({ batchId, courseId, status, page = 1, limit = 15, user }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    ...(batchId && { batchId }),
    ...(courseId && { courseId }),
    ...(status && { status }),
  };

  if (user.role === 'STUDENT') {
    where.status = 'PUBLISHED';
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      where.batch = {
        enrollments: {
          some: { studentId: profile.id },
        },
      };
    }
  } else if (user.role === 'TEACHER') {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      where.batch = {
        teachers: {
          some: { teacherId: profile.id },
        },
      };
    }
  }

  // Count and fetch offline exams
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

  return { exams, total, page: Number(page), limit: Number(limit) };
};

/**
 * Get Exam Details with Results
 */
const getExamById = async (id, user) => {
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
    const error = new Error('Offline examination not found');
    error.statusCode = 404;
    throw error;
  }

  // If student is viewing, filter results to ONLY the student's own published result
  if (user.role === 'STUDENT') {
    if (exam.status !== 'PUBLISHED') {
      const error = new Error('This examination result is not yet published.');
      error.statusCode = 403;
      throw error;
    }
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    const studentResult = exam.results.find((r) => r.studentId === profile?.id && r.status === 'PUBLISHED');
    return {
      ...exam,
      batch: { id: exam.batch.id, name: exam.batch.name, batchCode: exam.batch.batchCode },
      results: studentResult ? [studentResult] : [],
    };
  }

  return exam;
};

/**
 * Teacher / Admin: Create Offline Examination Record
 */
const createExam = async (data, user, req) => {
  // Verify authorization if teacher
  if (user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    const isAssigned = await prisma.teacherAssignment.findFirst({
      where: { teacherId: teacherProfile.id, batchId: data.batchId },
    });
    if (!isAssigned) {
      const error = new Error('Forbidden. You are not assigned to instruct this batch.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Create exam in database
  const exam = await prisma.offlineExam.create({
    data: {
      ...data,
      createdById: user.id,
      status: 'DRAFT',
    },
    include: {
      course: true,
      batch: true,
    },
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'OFFLINE_EXAM_CREATED',
    entity: 'OfflineExam',
    entityId: exam.id,
    details: { title: exam.title, batchId: exam.batchId, maxMarks: exam.maxMarks },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('exams', 'batches');
  await invalidateCache(['exams', 'batches']);

  return exam;
};

/**
 * Teacher / Admin: Publish Offline Exam Results
 */
const publishExam = async (id, user, req) => {
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
    const error = new Error('Exam record not found');
    error.statusCode = 404;
    throw error;
  }

  if (exam.results.length === 0) {
    const error = new Error('Cannot publish results. No marks have been recorded for this examination yet.');
    error.statusCode = 400;
    throw error;
  }

  // Update exam status and all its marks to PUBLISHED
  await prisma.$transaction([
    prisma.offlineExam.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedById: user.id,
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
      }).catch(() => {});
    }
  }

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'EXAM_RESULTS_PUBLISHED',
    entity: 'OfflineExam',
    entityId: id,
    details: { examTitle: exam.title, studentCount: exam.results.length },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('exams', 'batches', 'users');
  await invalidateCache(['exams', 'batches', 'users']);

  return { studentCount: exam.results.length };
};

/**
 * Admin: Unpublish Exam Results
 */
const unpublishExam = async (id, user, req) => {
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

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'EXAM_RESULTS_UNPUBLISHED',
    entity: 'OfflineExam',
    entityId: id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('exams', 'batches', 'users');
  await invalidateCache(['exams', 'batches', 'users']);

  return { message: 'Exam results unpublished and reverted to Draft mode for corrections.' };
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  publishExam,
  unpublishExam,
};
