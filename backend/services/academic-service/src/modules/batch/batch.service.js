const {
  prisma,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * List Batches
 */
const getBatches = async ({ courseId, status, search = '', page = 1, limit = 15, user }) => {
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
  if (user && user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });
    if (teacherProfile) {
      where.teachers = {
        some: { teacherId: teacherProfile.id },
      };
    }
  }

  // If user is STUDENT, show batches enrolled by this student
  if (user && user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });
    if (studentProfile) {
      where.enrollments = {
        some: { studentId: studentProfile.id },
      };
    }
  }

  // Query database in transaction
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

  return { batches, total, page: Number(page), limit: Number(limit) };
};

/**
 * Get Batch Details with Roster
 */
const getBatchById = async (id, user) => {
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
    const error = new Error('Batch not found');
    error.statusCode = 404;
    throw error;
  }

  // Teacher authorization check: teacher can only see batches they are assigned to
  if (user && user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });
    const isAssigned = batch.teachers.some((t) => t.teacherId === teacherProfile?.id);
    if (!isAssigned) {
      const error = new Error('Forbidden. You are not assigned to instruct this batch.');
      error.statusCode = 403;
      throw error;
    }
  }

  return batch;
};

/**
 * Admin: Create Batch
 */
const createBatch = async (data, user, req) => {
  const existingCode = await prisma.batch.findUnique({
    where: { batchCode: data.batchCode },
  });
  if (existingCode) {
    const error = new Error('A batch with this code already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Create batch in database
  const batch = await prisma.batch.create({
    data,
    include: { course: true },
  });

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'BATCH_CREATED',
    entity: 'Batch',
    entityId: batch.id,
    details: { batchCode: batch.batchCode, name: batch.name },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('batches', 'courses');
  await invalidateCache(['batches', 'courses']);

  return batch;
};

/**
 * Admin: Update Batch
 */
const updateBatch = async (id, data, user, req) => {
  const batch = await prisma.batch.update({
    where: { id },
    data,
  });

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'BATCH_UPDATED',
    entity: 'Batch',
    entityId: batch.id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('batches', 'courses');
  await invalidateCache(['batches', 'courses']);

  return batch;
};

/**
 * Admin: Assign Teacher to Batch
 */
const assignTeacher = async (batchId, { teacherId, roleTitle }, user, req) => {
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

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'TEACHER_ASSIGNED_TO_BATCH',
    entity: 'Batch',
    entityId: batchId,
    details: { teacherId, roleTitle },
    req,
  });

  // Invalidate cache
  await redisClient.del('batches');
  await invalidateCache(['batches']);

  return assignment;
};

/**
 * Admin: Remove Teacher from Batch
 */
const removeTeacherAssignment = async (batchId, teacherId, user, req) => {
  await prisma.teacherAssignment.deleteMany({
    where: { batchId, teacherId },
  });

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'TEACHER_REMOVED_FROM_BATCH',
    entity: 'Batch',
    entityId: batchId,
    details: { teacherId },
    req,
  });

  // Invalidate cache
  await redisClient.del('batches');
  await invalidateCache(['batches']);

  return { message: 'Teacher assignment removed' };
};

/**
 * Admin: Enroll Student into Batch
 */
const enrollStudent = async (batchId, { studentId, discountAmount = 0 }, user, req) => {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { course: true },
  });
  if (!batch) {
    const error = new Error('Batch not found');
    error.statusCode = 404;
    throw error;
  }

  // Resolve StudentProfile ID (supports both StudentProfile.id and User.id)
  let resolvedStudentId = studentId;
  const studentProfile = await prisma.studentProfile.findFirst({
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
  });
  if (studentProfile) {
    resolvedStudentId = studentProfile.id;
  } else {
    const error = new Error('Student profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate active enrollments in the same course
  const existingActiveCourseEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: resolvedStudentId,
      courseId: batch.courseId,
      status: 'ACTIVE',
    },
    include: { batch: true },
  });
  if (existingActiveCourseEnrollment) {
    const error = new Error(`Student is already actively enrolled in this course (${batch.course.title}) under batch "${existingActiveCourseEnrollment.batch?.name || existingActiveCourseEnrollment.batchId}".`);
    error.statusCode = 409;
    throw error;
  }

  // Create enrollment record
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: resolvedStudentId,
      batchId,
      courseId: batch.courseId,
      status: 'ACTIVE',
    },
  });

  // Automatically set joiningDate and journeyStatus on student profile if first course enrollment
  const totalEnrollments = await prisma.enrollment.count({
    where: { studentId: resolvedStudentId },
  });
  if (totalEnrollments === 1) {
    await prisma.studentProfile.update({
      where: { id: resolvedStudentId },
      data: {
        joiningDate: new Date(),
        journeyStatus: 'ACTIVE',
      },
    }).catch(() => {});
  }

  // Calculate fee with individual enrollment discount
  const originalFee = Number(batch.course.advertisedFee || 0);
  const discount = Math.min(originalFee, Math.max(0, Number(discountAmount || 0)));
  const finalPayable = Math.max(0, originalFee - discount);

  // Create fee record linked to this enrollment if not already present
  let createdFeeRecord = null;
  const existingFee = await prisma.feeRecord.findFirst({
    where: { studentId: resolvedStudentId, batchId, courseId: batch.courseId },
  });
  if (!existingFee && originalFee > 0) {
    createdFeeRecord = await prisma.feeRecord.create({
      data: {
        studentId: resolvedStudentId,
        courseId: batch.courseId,
        batchId: batch.id,
        originalFee,
        discountAmount: discount,
        totalFee: finalPayable,
        paidAmount: 0.0,
        balanceAmount: finalPayable,
        paymentStatus: finalPayable === 0 ? 'PAID' : 'PENDING',
      },
    });
  } else {
    createdFeeRecord = existingFee;
  }

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'STUDENT_ENROLLED_IN_BATCH',
    entity: 'Batch',
    entityId: batchId,
    details: { studentId: resolvedStudentId, courseId: batch.courseId, originalFee, discountAmount: discount, finalPayable },
    req,
  });

  // Invalidate batches, fees, and users so student dashboard and course list update immediately
  await redisClient.del('batches', 'fees', 'users', `student:profile:${resolvedStudentId}`);
  await invalidateCache(['batches', 'fees', 'users']);

  return {
    enrollment,
    feeConfig: { originalFee, discountAmount: discount, finalPayable },
    feeRecord: createdFeeRecord,
  };
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  assignTeacher,
  removeTeacherAssignment,
  enrollStudent,
};
