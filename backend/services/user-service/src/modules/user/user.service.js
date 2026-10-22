const {
  prisma,
  uploadBuffer,
  comparePassword,
  hashPassword,
  logAudit,
  invalidateCache,
  getCache,
  setCache,
  delCache,
  redisClient,
} = require('@portal/shared');

/**
 * Update Profile (Self user)
 */
const updateProfile = async ({ userId, role, data, file, req }) => {
  const userUpdateData = {};
  if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
  if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;

  // Handle passport photo / avatar
  if (file) {
    try {
      const uploadRes = await uploadBuffer(file.buffer, file.mimetype, 'infotech-portal/profiles');
      if (uploadRes?.secure_url) {
        userUpdateData.avatarUrl = uploadRes.secure_url;
      }
    } catch (uploadErr) {
      userUpdateData.avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }
  } else if (data.avatarUrl !== undefined && data.avatarUrl !== null) {
    userUpdateData.avatarUrl = data.avatarUrl;
  }

  // Update base user info
  if (Object.keys(userUpdateData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });
  }

  // Student profile fields
  if (role === 'STUDENT') {
    const studentData = {};
    if (data.address !== undefined) studentData.address = data.address;
    if (data.guardianName !== undefined) studentData.guardianName = data.guardianName;
    if (data.guardianPhone !== undefined) studentData.guardianPhone = data.guardianPhone;

    if (Object.keys(studentData).length > 0) {
      await prisma.studentProfile.upsert({
        where: { userId },
        update: studentData,
        create: {
          userId,
          ...studentData,
          enrollmentNumber: `IIT-S${Date.now().toString().slice(-6)}`,
          rollNumber: `R-${Date.now().toString().slice(-4)}`,
        },
      });
    }
  }

  // Teacher profile fields
  if (role === 'TEACHER') {
    const teacherData = {};
    if (data.bio !== undefined) teacherData.bio = data.bio;
    if (data.specialization !== undefined) teacherData.specialization = data.specialization;

    if (Object.keys(teacherData).length > 0) {
      await prisma.teacherProfile.upsert({
        where: { userId },
        update: teacherData,
        create: {
          userId,
          ...teacherData,
          employeeId: `IIT-T${Date.now().toString().slice(-4)}`,
        },
      });
    }
  }

  // Query updated user with associated profiles
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          enrollments: { include: { batch: true, course: true } },
        },
      },
      teacherProfile: {
        include: {
          assignments: { include: { batch: true } },
        },
      },
    },
  });

  // Log audit event
  await logAudit({
    userId,
    action: 'PROFILE_UPDATED',
    entity: 'User',
    entityId: userId,
    details: { fields: Object.keys(data) },
    req,
  });

  // Explicit Redis cache invalidation on profile update
  await redisClient.del(`student:profile:${userId}`, `user:profile:${userId}`, 'users');
  await invalidateCache(['users', 'teachers_public']);

  return updatedUser;
};

/**
 * Change Password
 */
const changePassword = async ({ userId, currentPassword, newPassword, req }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  const newHash = await hashPassword(newPassword);

  // Update password and revoke existing refresh tokens
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    }),
  ]);

  // Log audit event
  await logAudit({
    userId,
    action: 'PASSWORD_CHANGED',
    entity: 'User',
    entityId: userId,
    req,
  });

  return { message: 'Password changed successfully' };
};

/**
 * List Students (Admin & Teacher)
 */
const getStudents = async ({ batchId, journeyStatus, status, search = '', page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    role: 'STUDENT',
    ...(status && { status }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        {
          studentProfile: {
            OR: [
              { rollNumber: { contains: search, mode: 'insensitive' } },
              { enrollmentNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ],
    }),
    studentProfile: {
      ...(journeyStatus && { journeyStatus }),
      ...(batchId && {
        enrollments: {
          some: { batchId, status: 'ACTIVE' },
        },
      }),
    },
  };

  // Run count and query in transaction
  const [total, students] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        studentProfile: {
          include: {
            enrollments: {
              where: { status: 'ACTIVE' },
              include: {
                batch: {
                  select: { id: true, batchCode: true, name: true, timing: true },
                },
                course: {
                  select: { id: true, title: true, slug: true, duration: true, advertisedFee: true },
                },
              },
            },
            feeRecords: {
              select: {
                id: true,
                courseId: true,
                originalFee: true,
                discountAmount: true,
                totalFee: true,
                paidAmount: true,
                balanceAmount: true,
                paymentStatus: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return { total, students, page: Number(page), limit: Number(limit) };
};

/**
 * Get Student By ID (Student 360 View)
 */
const getStudentById = async (id) => {
  const student = await prisma.user.findFirst({
    where: {
      id,
      role: 'STUDENT',
    },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: {
              batch: true,
              course: true,
            },
          },
          feeRecords: {
            include: {
              course: true,
              payments: {
                orderBy: { paymentDate: 'desc' },
              },
            },
          },
          mockResults: {
            include: {
              mockInterview: {
                include: { course: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          examResults: {
            include: {
              offlineExam: {
                include: { course: true, batch: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  return student;
};

/**
 * Admin: Update Student Details
 */
const updateStudentByAdmin = async (id, data, adminUser, req) => {
  const user = await prisma.user.findFirst({
    where: { id, role: 'STUDENT' },
    include: { studentProfile: true },
  });

  if (!user) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Update user fields
  const userUpdate = {};
  if (data.firstName) userUpdate.firstName = data.firstName;
  if (data.lastName) userUpdate.lastName = data.lastName;
  if (data.email) userUpdate.email = data.email.toLowerCase().trim();
  if (data.phone) userUpdate.phone = data.phone;

  // 2. Update profile fields
  const profileUpdate = {};
  if (data.rollNumber !== undefined) profileUpdate.rollNumber = data.rollNumber;
  if (data.guardianName !== undefined) profileUpdate.guardianName = data.guardianName;
  if (data.guardianPhone !== undefined) profileUpdate.guardianPhone = data.guardianPhone;
  if (data.address !== undefined) profileUpdate.address = data.address;
  if (data.joiningDate) profileUpdate.joiningDate = new Date(data.joiningDate);

  // Write changes to database
  await prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id }, data: userUpdate });
    }
    if (user.studentProfile && Object.keys(profileUpdate).length > 0) {
      await tx.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: profileUpdate,
      });
    }
  });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'STUDENT_DETAILS_UPDATED',
    entity: 'StudentProfile',
    entityId: id,
    details: { ...userUpdate, ...profileUpdate },
    req,
  });

  // Invalidate Redis caches immediately
  await redisClient.del(`student:profile:${id}`, 'users');
  await invalidateCache(['users', 'batches']);

  return { message: 'Student details updated successfully' };
};

/**
 * Admin: Update Student Journey Status
 */
const updateStudentJourneyStatus = async (id, data, adminUser, req) => {
  const user = await prisma.user.findFirst({
    where: { id, role: 'STUDENT' },
    include: { studentProfile: true },
  });

  if (!user || !user.studentProfile) {
    const error = new Error('Student profile not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {
    journeyStatus: data.journeyStatus,
    exitDate: data.exitDate ? new Date(data.exitDate) : null,
    dropOutReason: data.dropOutReason || null,
  };

  if (data.journeyStatus === 'ACTIVE') {
    updateData.exitDate = null;
    updateData.dropOutReason = null;
  }

  // Update student profile status
  await prisma.studentProfile.update({
    where: { id: user.studentProfile.id },
    data: updateData,
  });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'STUDENT_JOURNEY_STATUS_UPDATED',
    entity: 'StudentProfile',
    entityId: user.studentProfile.id,
    details: updateData,
    req,
  });

  // Invalidate Redis cache
  await redisClient.del(`student:profile:${id}`, 'users');
  await invalidateCache(['users']);

  return { message: 'Student journey status updated successfully' };
};

/**
 * List Teachers (Admin view)
 */
const getTeachers = async ({ search = '', page = 1, limit = 50 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    role: 'TEACHER',
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Transaction count and find
  const [total, teachers] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        teacherProfile: {
          include: {
            assignments: {
              include: {
                batch: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return { total, teachers, page: Number(page), limit: Number(limit) };
};

/**
 * Public Teachers: Active instructors visible on public website landing page
 */
const getPublicTeachers = async () => {
  // Check Redis cache first
  const cacheKey = 'cache:teachers_public:all';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Fetch active instructors with showOnWebsite: true
  const teachers = await prisma.user.findMany({
    where: {
      role: 'TEACHER',
      status: 'ACTIVE',
      teacherProfile: {
        showOnWebsite: true,
      },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      teacherProfile: {
        select: {
          employeeId: true,
          specialization: true,
          qualifications: true,
          bio: true,
          showOnWebsite: true,
          assignments: {
            include: {
              batch: {
                include: { course: true },
              },
            },
          },
        },
      },
    },
  });

  // Store in Redis with safe TTL (30 min / 1800s)
  await setCache(cacheKey, teachers, 1800);
  return teachers;
};

/**
 * Admin: Create Teacher Faculty Account
 */
const createTeacher = async (data, adminUser, req) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    const error = new Error('A user account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const count = await prisma.teacherProfile.count();
  const employeeId = data.employeeId || `IIT-T${101 + count}`;
  const passwordHash = await hashPassword(data.password || 'SecurePass@2026');

  const newTeacher = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: 'TEACHER',
        status: 'ACTIVE',
      },
    });

    const profile = await tx.teacherProfile.create({
      data: {
        userId: user.id,
        employeeId,
        specialization: data.specialization || null,
        qualifications: data.qualifications || null,
        bio: data.bio || null,
        showOnWebsite: data.showOnWebsite !== undefined ? Boolean(data.showOnWebsite) : true,
      },
    });

    return { ...user, teacherProfile: profile };
  });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'TEACHER_FACULTY_CREATED',
    entity: 'TeacherProfile',
    entityId: newTeacher.id,
    details: { email: normalizedEmail, employeeId },
    req,
  });

  // Invalidate teacher caches
  await redisClient.del('teachers_public', 'users');
  await invalidateCache(['users', 'teachers_public']);
  await delCache('cache:teachers_public:all');

  return newTeacher;
};

/**
 * Admin: Update Teacher Details
 */
const updateTeacher = async (id, data, adminUser, req) => {
  const user = await prisma.user.findFirst({
    where: { id, role: 'TEACHER' },
    include: { teacherProfile: true },
  });

  if (!user || !user.teacherProfile) {
    const error = new Error('Teacher record not found');
    error.statusCode = 404;
    throw error;
  }

  const userUpdate = {};
  if (data.firstName) userUpdate.firstName = data.firstName;
  if (data.lastName) userUpdate.lastName = data.lastName;
  if (data.email) userUpdate.email = data.email.toLowerCase().trim();
  if (data.phone !== undefined) userUpdate.phone = data.phone;

  const profileUpdate = {};
  if (data.specialization !== undefined) profileUpdate.specialization = data.specialization;
  if (data.qualifications !== undefined) profileUpdate.qualifications = data.qualifications;
  if (data.bio !== undefined) profileUpdate.bio = data.bio;
  if (data.showOnWebsite !== undefined) profileUpdate.showOnWebsite = Boolean(data.showOnWebsite);

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id }, data: userUpdate });
    }
    if (Object.keys(profileUpdate).length > 0) {
      await tx.teacherProfile.update({
        where: { id: user.teacherProfile.id },
        data: profileUpdate,
      });
    }
  });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'TEACHER_DETAILS_UPDATED',
    entity: 'TeacherProfile',
    entityId: id,
    details: { ...userUpdate, ...profileUpdate },
    req,
  });

  // Invalidate caches
  await redisClient.del(`teacher:profile:${id}`, 'teachers_public', 'users');
  await invalidateCache(['users', 'teachers_public']);
  await delCache('cache:teachers_public:all');

  return { message: 'Teacher updated successfully' };
};

/**
 * Admin: Toggle Teacher Public Website Visibility
 */
const toggleTeacherVisibility = async (id, showOnWebsite, adminUser, req) => {
  const user = await prisma.user.findFirst({
    where: { id, role: 'TEACHER' },
    include: { teacherProfile: true },
  });

  if (!user || !user.teacherProfile) {
    const error = new Error('Teacher profile not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedProfile = await prisma.teacherProfile.update({
    where: { id: user.teacherProfile.id },
    data: { showOnWebsite: Boolean(showOnWebsite) },
  });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'TEACHER_VISIBILITY_TOGGLED',
    entity: 'TeacherProfile',
    entityId: user.teacherProfile.id,
    details: { showOnWebsite: updatedProfile.showOnWebsite },
    req,
  });

  // Invalidate caches immediately
  await redisClient.del('teachers_public', 'users');
  await invalidateCache(['users', 'teachers_public']);
  await delCache('cache:teachers_public:all');

  return {
    message: `Teacher public website visibility updated to ${updatedProfile.showOnWebsite ? 'ON (Public)' : 'OFF (Hidden)'}.`,
    showOnWebsite: updatedProfile.showOnWebsite,
  };
};

/**
 * Admin: Update User Status (ACTIVE / INACTIVE / SUSPENDED)
 */
const updateUserStatus = async (id, status, adminUser, req) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status },
  });

  if (status !== 'ACTIVE') {
    await prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { revoked: true },
    });
  }

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'USER_STATUS_UPDATED',
    entity: 'User',
    entityId: id,
    details: { oldStatus: user.status, newStatus: status },
    req,
  });

  // Invalidate caches
  await redisClient.del(`student:profile:${id}`, `user:profile:${id}`, 'users');
  await invalidateCache(['users', 'teachers_public']);

  return { message: `User status updated to ${status}` };
};

module.exports = {
  updateProfile,
  changePassword,
  getStudents,
  getStudentById,
  updateStudentByAdmin,
  updateStudentJourneyStatus,
  getTeachers,
  getPublicTeachers,
  createTeacher,
  updateTeacher,
  toggleTeacherVisibility,
  updateUserStatus,
};
