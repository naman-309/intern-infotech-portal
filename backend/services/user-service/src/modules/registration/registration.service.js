const {
  prisma,
  config,
  queueEmail,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * List Registration Requests
 */
const getRequests = async ({ role, status = 'PENDING', search = '', page = 1, limit = 10, user }) => {
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

  // Teachers can only view student registration requests
  if (user && user.role === 'TEACHER') {
    where.role = 'STUDENT';
  }

  // Count and fetch records
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

  return { total, requests, page: Number(page), limit: Number(limit) };
};

/**
 * Review Request (APPROVE or REJECT)
 */
const reviewRequest = async ({ id, action, reviewNote, assignedBatchId, assignedCourseId, user, req }) => {
  // Fetch pending request
  const request = await prisma.registrationRequest.findUnique({
    where: { id },
  });

  if (!request) {
    const error = new Error('Registration request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error(`This request has already been ${request.status.toLowerCase()}.`);
    error.statusCode = 400;
    throw error;
  }

  if (user.role === 'TEACHER' && request.role === 'TEACHER') {
    const error = new Error('Only institute administrators can approve or reject teacher registrations.');
    error.statusCode = 403;
    throw error;
  }

  // ==========================================
  // 1. REJECT FLOW
  // ==========================================
  if (action === 'REJECT') {
    const updated = await prisma.registrationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewNote: reviewNote || 'Application details did not match institute offline enrollment criteria.',
        reviewerId: user.id,
        reviewedAt: new Date(),
      },
    });

    // Notify applicant by email
    await queueEmail('REJECTION', {
      to: request.email,
      fullName: request.fullName,
      role: request.role,
      reviewNote: updated.reviewNote,
    });

    // Log audit event
    await logAudit({
      userId: user.id,
      action: `${request.role}_REGISTRATION_REJECTED`,
      entity: 'RegistrationRequest',
      entityId: id,
      details: { email: request.email, note: updated.reviewNote },
      req,
    });

    // Explicit Redis cache invalidation on mutation
    await redisClient.del('admin:registration_requests', 'registrations');
    await invalidateCache(['registrations']);

    return {
      message: `${request.role} registration request rejected.`,
      request: updated,
    };
  }

  // ==========================================
  // 2. APPROVE FLOW
  // ==========================================
  const existingUser = await prisma.user.findUnique({
    where: { email: request.email },
  });
  if (existingUser) {
    const error = new Error('A user account with this email already exists in the system.');
    error.statusCode = 409;
    throw error;
  }

  const nameParts = request.fullName.trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || 'Account';

  // --- Student Approval ---
  if (request.role === 'STUDENT') {
    const currentYear = new Date().getFullYear();
    const studentCount = await prisma.studentProfile.count();
    const enrollmentNumber = `IIT-${currentYear}-S${1001 + studentCount}`;
    const rollNumber = `R-${1001 + studentCount}`;

    await prisma.$transaction(async (tx) => {
      // Create user account
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

      // Create student profile
      const profile = await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          enrollmentNumber,
          rollNumber,
        },
      });

      // Mark offline whitelist record as registered
      await tx.eligibleStudentEmail.updateMany({
        where: { email: request.email },
        data: { isRegistered: true },
      });

      // If batch assigned upon approval, enroll immediately
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

          // Create initial fee record if course has fee
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

      // Update registration request status
      await tx.registrationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewNote: reviewNote || 'Offline enrollment verified and approved.',
          reviewerId: user.id,
          reviewedAt: new Date(),
        },
      });
    });

    // Send approval email with login link
    const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
    const loginUrl = `${clientOrigin}/login`;
    await queueEmail('APPROVAL', {
      to: request.email,
      fullName: request.fullName,
      role: 'Student',
      loginUrl,
    });

    // Log audit event
    await logAudit({
      userId: user.id,
      action: 'STUDENT_REGISTRATION_APPROVED',
      entity: 'RegistrationRequest',
      entityId: id,
      details: { email: request.email, enrollmentNumber },
      req,
    });

    // Explicit Redis cache invalidation on mutation so admin dashboard immediately reflects change
    await redisClient.del('admin:registration_requests', 'registrations');
    await invalidateCache(['registrations', 'users', 'batches', 'fees', 'eligible_emails']);

    return {
      message: 'Student registration approved successfully and portal account activated.',
      email: request.email,
      enrollmentNumber,
    };
  }

  // --- Teacher Approval ---
  if (request.role === 'TEACHER') {
    const teacherCount = await prisma.teacherProfile.count();
    const employeeId = `IIT-T${101 + teacherCount}`;

    await prisma.$transaction(async (tx) => {
      // Create user account
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

      // Create teacher profile
      await tx.teacherProfile.create({
        data: {
          userId: newUser.id,
          employeeId,
          bio: request.reviewNote || undefined,
        },
      });

      // Update registration request
      await tx.registrationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewNote: reviewNote || 'Teacher credentials verified and approved by admin.',
          reviewerId: user.id,
          reviewedAt: new Date(),
        },
      });
    });

    // Send approval email
    const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
    const loginUrl = `${clientOrigin}/login`;
    await queueEmail('APPROVAL', {
      to: request.email,
      fullName: request.fullName,
      role: 'Teacher',
      loginUrl,
    });

    // Log audit event
    await logAudit({
      userId: user.id,
      action: 'TEACHER_REGISTRATION_APPROVED',
      entity: 'RegistrationRequest',
      entityId: id,
      details: { email: request.email, employeeId },
      req,
    });

    // Explicit Redis cache invalidation on mutation
    await redisClient.del('admin:registration_requests', 'registrations');
    await invalidateCache(['registrations', 'users', 'teachers_public']);

    return {
      message: 'Teacher registration approved successfully and portal account activated.',
      email: request.email,
      employeeId,
    };
  }
};

module.exports = {
  getRequests,
  reviewRequest,
};
