const {
  prisma,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * Teacher / Admin: Enter or Edit Marks
 */
const recordMarks = async ({ examId, entries }, user, req) => {
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
    const error = new Error('Examination record not found');
    error.statusCode = 404;
    throw error;
  }

  // Teacher authorization check
  if (user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    const isAssigned = exam.batch.teachers.some((t) => t.teacherId === teacherProfile?.id);
    if (!isAssigned) {
      const error = new Error('Forbidden. You are not authorized to enter marks for this batch.');
      error.statusCode = 403;
      throw error;
    }
  }

  const enrolledStudentIds = new Set(exam.batch.enrollments.map((e) => e.studentId));

  // Validate each mark entry
  for (const entry of entries) {
    if (!enrolledStudentIds.has(entry.studentId)) {
      const error = new Error(`Student with ID ${entry.studentId} is not enrolled in this batch.`);
      error.statusCode = 400;
      throw error;
    }
    if (entry.marksObtained > exam.maxMarks) {
      const error = new Error(`Marks entered (${entry.marksObtained}) cannot exceed examination maximum marks (${exam.maxMarks}).`);
      error.statusCode = 400;
      throw error;
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
        if (existingResult.marksObtained !== entry.marksObtained) {
          // Record change in history
          await tx.examResultHistory.create({
            data: {
              resultId: existingResult.id,
              previousMarks: existingResult.marksObtained,
              newMarks: entry.marksObtained,
              reason: entry.reasonForChange || 'Academic revision by instructor',
              changedById: user.id,
            },
          });
        }

        await tx.examResult.update({
          where: { id: existingResult.id },
          data: {
            marksObtained: entry.marksObtained,
            percentage,
            remarks: entry.remarks,
            updatedById: user.id,
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
            enteredById: user.id,
          },
        });
      }
    }
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'MARKS_RECORDED',
    entity: 'OfflineExam',
    entityId: examId,
    details: { count: entries.length, examTitle: exam.title },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('exams', 'users', 'batches');
  await invalidateCache(['exams', 'users', 'batches']);

  return { message: 'Marks recorded successfully.' };
};

/**
 * Student: Get Own Published Examination Results
 */
const getMyResults = async (user) => {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!studentProfile) {
    const error = new Error('Student profile not found');
    error.statusCode = 404;
    throw error;
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

  // Compute statistics summary
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

  return {
    results,
    summary: {
      totalExams,
      totalMarksObtained,
      totalMaxMarks,
      overallPercentage,
    },
  };
};

module.exports = {
  recordMarks,
  getMyResults,
};
