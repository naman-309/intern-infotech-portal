const {
  prisma,
  config,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  verifyRefreshToken,
  verifyEmailToken,
  verifyResetToken,
  hashToken,
  queueEmail,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * User Login: Validate credentials, verify status, and create session tokens
 */
const login = async ({ email, password, req }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email including student and teacher profiles
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: { batch: true, course: true },
          },
        },
      },
      teacherProfile: {
        include: {
          assignments: {
            include: { batch: true },
          },
        },
      },
    },
  });

  if (!user) {
    const error = new Error('Invalid credentials. Please verify your email and password.');
    error.statusCode = 401;
    throw error;
  }

  // Ensure user account is active
  if (user.status !== 'ACTIVE') {
    const error = new Error(`Your account is currently ${user.status.toLowerCase()}. Please contact academy support.`);
    error.statusCode = 403;
    throw error;
  }

  // Verify bcrypt password hash
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid credentials. Please verify your email and password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate session tokens
  const accessToken = generateAccessToken(user);
  const { refreshToken, hashedToken } = generateRefreshToken(user);

  // Store hashed refresh token in database for revocable session
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedToken,
      expiresAt,
    },
  });

  // Log audit event for login
  await logAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    req,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile,
    },
  };
};

/**
 * User Logout: Revoke refresh token and log audit event
 */
const logout = async ({ refreshToken, user, req }) => {
  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded && decoded.tokenSeed) {
      const hashedToken = hashToken(decoded.tokenSeed);
      // Revoke the refresh token record in the database
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashedToken },
        data: { revoked: true },
      });
    }
  }

  if (user) {
    // Log audit event for logout
    await logAudit({
      userId: user.id,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: user.id,
      req,
    });
  }

  return { message: 'Logged out successfully' };
};

/**
 * Refresh Access Token: Rotate refresh token and issue new session
 */
const refresh = async ({ refreshToken }) => {
  if (!refreshToken) {
    const error = new Error('Refresh token not found in cookies.');
    error.statusCode = 401;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || !decoded.userId || !decoded.tokenSeed) {
    const error = new Error('Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const currentHashedToken = hashToken(decoded.tokenSeed);

  // Find token record in database
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash: currentHashedToken },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
    const error = new Error('Session expired or revoked. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  // Revoke old token as part of rotation
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true },
  });

  const user = tokenRecord.user;
  if (user.status !== 'ACTIVE') {
    const error = new Error('Account is no longer active.');
    error.statusCode = 403;
    throw error;
  }

  // Issue new pair of tokens
  const newAccessToken = generateAccessToken(user);
  const { refreshToken: newRefreshToken, hashedToken: newHashedToken } = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: newHashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};

/**
 * Get Current User Profile with active enrollments
 */
const getMe = async (userId) => {
  if (!userId) {
    const error = new Error('Unauthenticated');
    error.statusCode = 401;
    throw error;
  }

  // Fetch full authenticated user record
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      studentProfile: {
        include: {
          enrollments: {
            include: {
              batch: true,
              course: true,
            },
          },
        },
      },
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
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Submit Student Registration Request (checks offline whitelist & invalidates cache)
 */
const requestStudentRegistration = async (data, req) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check if account already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    const error = new Error('An account with this email address already exists. Please log in.');
    error.statusCode = 409;
    throw error;
  }

  // Check if pending registration request already exists
  const existingRequest = await prisma.registrationRequest.findFirst({
    where: { email: normalizedEmail, status: 'PENDING' },
  });
  if (existingRequest) {
    const error = new Error('A registration request for this email address is already pending review.');
    error.statusCode = 409;
    throw error;
  }

  // Check offline whitelist eligibility
  const eligibleRecord = await prisma.eligibleStudentEmail.findUnique({
    where: { email: normalizedEmail },
  });
  if (!eligibleRecord) {
    const error = new Error('This email address is not found in our offline student enrollment list. Please register in-person at the institute admission office first.');
    error.statusCode = 403;
    throw error;
  }
  if (eligibleRecord.isRegistered) {
    const error = new Error('An account has already been registered using this offline enrollment record.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password and build email verification token
  const passwordHash = await hashPassword(data.password);
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const verificationToken = generateVerificationToken({
    email: normalizedEmail,
    fullName,
    role: 'STUDENT',
  });
  const verificationTokenHash = hashToken(verificationToken);

  // Save new registration request in database
  const request = await prisma.registrationRequest.create({
    data: {
      email: normalizedEmail,
      fullName,
      phone: data.phone,
      role: 'STUDENT',
      passwordHash,
      verificationTokenHash,
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isEmailVerified: false,
      status: 'PENDING',
      targetCourseId: data.targetCourseId || null,
    },
  });

  // Queue verification email
  const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
  const verificationUrl = `${clientOrigin}/verify-email?token=${verificationToken}`;
  await queueEmail('VERIFICATION', {
    to: normalizedEmail,
    fullName,
    verificationUrl,
  });

  // Audit log event
  await logAudit({
    action: 'STUDENT_REGISTRATION_REQUESTED',
    entity: 'RegistrationRequest',
    entityId: request.id,
    details: { email: normalizedEmail, fullName, eligible: true },
    req,
  });

  // Explicit Redis cache invalidation on mutation so admin dashboard immediately updates
  await redisClient.del('admin:registration_requests', 'registrations');
  await invalidateCache(['registrations']);

  return {
    requestId: request.id,
    email: normalizedEmail,
    requiresEmailVerification: true,
  };
};

/**
 * Submit Teacher Registration Request
 */
const requestTeacherRegistration = async (data, req) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check if account already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Check if teacher registration request already pending
  const existingRequest = await prisma.registrationRequest.findFirst({
    where: { email: normalizedEmail, status: 'PENDING' },
  });
  if (existingRequest) {
    const error = new Error('A teacher registration request with this email is already under review.');
    error.statusCode = 409;
    throw error;
  }

  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const passwordHash = await hashPassword(data.password);
  const verificationToken = generateVerificationToken({
    email: normalizedEmail,
    fullName,
    role: 'TEACHER',
  });
  const verificationTokenHash = hashToken(verificationToken);

  // Save registration request to database
  const request = await prisma.registrationRequest.create({
    data: {
      email: normalizedEmail,
      fullName,
      phone: data.phone,
      role: 'TEACHER',
      passwordHash,
      verificationTokenHash,
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isEmailVerified: false,
      status: 'PENDING',
      reviewNote: `Specialization: ${data.specialization} | Qualifications: ${data.qualifications}${data.bio ? ` | Bio: ${data.bio}` : ''}`,
    },
  });

  // Queue verification email
  const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
  const verificationUrl = `${clientOrigin}/verify-email?token=${verificationToken}`;
  await queueEmail('VERIFICATION', {
    to: normalizedEmail,
    fullName,
    verificationUrl,
  });

  // Audit log event
  await logAudit({
    action: 'TEACHER_REGISTRATION_REQUESTED',
    entity: 'RegistrationRequest',
    entityId: request.id,
    details: { email: normalizedEmail, fullName },
    req,
  });

  // Explicit Redis cache invalidation on mutation so admin dashboard immediately updates
  await redisClient.del('admin:registration_requests', 'registrations');
  await invalidateCache(['registrations']);

  return {
    requestId: request.id,
    email: normalizedEmail,
  };
};

/**
 * Verify Email Link Click
 */
const verifyEmail = async (token, req) => {
  if (!token) {
    const error = new Error('Verification token is required.');
    error.statusCode = 400;
    throw error;
  }

  const decoded = verifyEmailToken(token);
  if (!decoded || !decoded.email) {
    const error = new Error('Invalid or expired verification token.');
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashToken(token);
  // Find pending request by email and token hash
  const request = await prisma.registrationRequest.findFirst({
    where: {
      email: decoded.email,
      verificationTokenHash: tokenHash,
    },
  });

  if (!request) {
    const error = new Error('No pending registration request found matching this verification token.');
    error.statusCode = 404;
    throw error;
  }

  if (request.tokenExpiresAt && request.tokenExpiresAt < new Date()) {
    const error = new Error('The verification token has expired. Please submit a new registration request.');
    error.statusCode = 400;
    throw error;
  }

  // Mark email as verified in database
  await prisma.registrationRequest.update({
    where: { id: request.id },
    data: {
      isEmailVerified: true,
      verificationTokenHash: null,
    },
  });

  // Log audit event
  await logAudit({
    action: 'EMAIL_VERIFIED',
    entity: 'RegistrationRequest',
    entityId: request.id,
    details: { email: request.email, role: request.role },
    req,
  });

  // Invalidate registration caches in Redis
  await redisClient.del('admin:registration_requests', 'registrations');
  await invalidateCache(['registrations']);

  return {
    email: request.email,
    role: request.role,
    status: request.status,
    isEmailVerified: true,
  };
};

/**
 * Request Password Reset
 */
const forgotPassword = async (email, req) => {
  const normalizedEmail = email.toLowerCase().trim();
  // Find active user account
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.status !== 'ACTIVE') {
    return { message: 'If an account exists with this email address, you will receive password reset instructions.' };
  }

  const resetToken = generateResetToken({ userId: user.id, email: user.email });
  const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
  const resetUrl = `${clientOrigin}/reset-password?token=${resetToken}`;

  // Queue password reset email
  await queueEmail('PASSWORD_RESET', {
    to: user.email,
    fullName: `${user.firstName} ${user.lastName}`,
    resetUrl,
  });

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    entity: 'User',
    entityId: user.id,
    req,
  });

  return { message: 'If an account exists with this email address, you will receive password reset instructions.' };
};

/**
 * Reset Password with Token
 */
const resetPassword = async (token, newPassword, req) => {
  const decoded = verifyResetToken(token);
  if (!decoded || !decoded.userId) {
    const error = new Error('Invalid or expired password reset link.');
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  const newPasswordHash = await hashPassword(newPassword);

  // Update password and revoke all active refresh tokens
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    }),
  ]);

  // Log audit event
  await logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_COMPLETED',
    entity: 'User',
    entityId: user.id,
    req,
  });

  return { message: 'Password has been successfully reset. You may now log in with your new password.' };
};

module.exports = {
  login,
  logout,
  refresh,
  getMe,
  requestStudentRegistration,
  requestTeacherRegistration,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
