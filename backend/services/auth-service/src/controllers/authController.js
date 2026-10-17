const { z } = require('zod');
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
  setAuthCookies,
  clearAuthCookies,
  successResponse,
  errorResponse,
  queueEmail,
  logAudit,
} = require('@portal/shared');

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const studentRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  offlineRegNumber: z.string().optional(),
  targetCourseId: z.string().optional(),
});

const teacherRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualifications: z.string().min(2, 'Qualifications are required'),
  bio: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

class AuthController {
  /**
   * User Login (Student, Teacher, Admin)
   */
  async login(req, res, next) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase().trim();

      // Find user with relations
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
        return errorResponse(res, {
          statusCode: 401,
          message: 'Invalid credentials. Please verify your email and password.',
        });
      }

      // Check account status
      if (user.status !== 'ACTIVE') {
        return errorResponse(res, {
          statusCode: 403,
          message: `Your account is currently ${user.status.toLowerCase()}. Please contact academy support.`,
        });
      }

      // Verify password
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, {
          statusCode: 401,
          message: 'Invalid credentials. Please verify your email and password.',
        });
      }

      // Generate Tokens
      const accessToken = generateAccessToken(user);
      const { refreshToken, hashedToken } = generateRefreshToken(user);

      // Store hashed refresh token in database (revocable session)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashedToken,
          expiresAt,
        },
      });

      // Set HTTP-Only Cookies
      setAuthCookies(res, accessToken, refreshToken);

      // Audit Log
      await logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        req,
      });

      return successResponse(res, {
        message: 'Login successful',
        data: {
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
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User Logout
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded && decoded.tokenSeed) {
          const hashedToken = hashToken(decoded.tokenSeed);
          await prisma.refreshToken.updateMany({
            where: { tokenHash: hashedToken },
            data: { revoked: true },
          });
        }
      }

      clearAuthCookies(res);

      if (req.user) {
        await logAudit({
          userId: req.user.id,
          action: 'USER_LOGOUT',
          entity: 'User',
          entityId: req.user.id,
          req,
        });
      }

      return successResponse(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Access Token (Token Rotation)
   */
  async refresh(req, res, next) {
    try {
      const rawCookieToken = req.cookies?.refreshToken;
      if (!rawCookieToken) {
        return errorResponse(res, {
          statusCode: 401,
          message: 'Refresh token not found in cookies.',
        });
      }

      const decoded = verifyRefreshToken(rawCookieToken);
      if (!decoded || !decoded.userId || !decoded.tokenSeed) {
        clearAuthCookies(res);
        return errorResponse(res, {
          statusCode: 401,
          message: 'Invalid refresh token.',
        });
      }

      const currentHashedToken = hashToken(decoded.tokenSeed);

      // Find token record in database
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { tokenHash: currentHashedToken },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
        clearAuthCookies(res);
        return errorResponse(res, {
          statusCode: 401,
          message: 'Session expired or revoked. Please log in again.',
        });
      }

      // Revoke the old token (rotation)
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      const user = tokenRecord.user;
      if (user.status !== 'ACTIVE') {
        clearAuthCookies(res);
        return errorResponse(res, {
          statusCode: 403,
          message: 'Account is no longer active.',
        });
      }

      // Issue new access and refresh tokens
      const newAccessToken = generateAccessToken(user);
      const { refreshToken: newRefreshToken, hashedToken: newHashedToken } = generateRefreshToken(user);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newHashedToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      setAuthCookies(res, newAccessToken, newRefreshToken);

      return successResponse(res, {
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated User Session
   */
  async getMe(req, res, next) {
    try {
      if (!req.user) {
        return errorResponse(res, { statusCode: 401, message: 'Unauthenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
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

      return successResponse(res, { data: { user } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Student Registration Request (Offline Enrollment Verification Flow)
   */
  async requestStudentRegistration(req, res, next) {
    try {
      const data = studentRegisterSchema.parse(req.body);
      const normalizedEmail = data.email.toLowerCase().trim();

      // 1. Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // 2. Check if a pending registration request already exists
      const existingRequest = await prisma.registrationRequest.findFirst({
        where: {
          email: normalizedEmail,
          status: 'PENDING',
        },
      });
      if (existingRequest) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'A registration request for this email address is already pending review. Please check your email for the verification link.',
        });
      }

      // 3. Check Authoritative Eligible Student Emails list (offline registration list)
      const eligibleRecord = await prisma.eligibleStudentEmail.findUnique({
        where: { email: normalizedEmail },
      });

      if (!eligibleRecord) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'This email address is not found in our offline student enrollment list. Please register in-person at the institute admission office first.',
        });
      }

      if (eligibleRecord.isRegistered) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'An account has already been registered using this offline enrollment record.',
        });
      }

      // 4. Hash password
      const passwordHash = await hashPassword(data.password);

      // 5. Generate Email Verification Token
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const verificationToken = generateVerificationToken({
        email: normalizedEmail,
        fullName,
        role: 'STUDENT',
      });
      const verificationTokenHash = hashToken(verificationToken);

      // 6. Save Registration Request
      const request = await prisma.registrationRequest.create({
        data: {
          email: normalizedEmail,
          fullName,
          phone: data.phone,
          role: 'STUDENT',
          passwordHash,
          verificationTokenHash,
          tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          isEmailVerified: false,
          status: 'PENDING',
          targetCourseId: data.targetCourseId || null,
        },
      });

      // 7. Queue email verification
      const verificationUrl = `${config.clientOrigin}/verify-email?token=${verificationToken}`;
      await queueEmail('VERIFICATION', {
        to: normalizedEmail,
        fullName,
        verificationUrl,
      });

      // 8. Audit Log
      await logAudit({
        action: 'STUDENT_REGISTRATION_REQUESTED',
        entity: 'RegistrationRequest',
        entityId: request.id,
        details: { email: normalizedEmail, fullName, eligible: true },
        req,
      });

      return successResponse(res, {
        statusCode: 201,
        message: 'Registration request submitted successfully. A verification link has been sent to your email.',
        data: {
          requestId: request.id,
          email: normalizedEmail,
          requiresEmailVerification: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Teacher Registration Request
   */
  async requestTeacherRegistration(req, res, next) {
    try {
      const data = teacherRegisterSchema.parse(req.body);
      const normalizedEmail = data.email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'An account with this email already exists.',
        });
      }

      const existingRequest = await prisma.registrationRequest.findFirst({
        where: {
          email: normalizedEmail,
          status: 'PENDING',
        },
      });
      if (existingRequest) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'A teacher registration request with this email is already under review.',
        });
      }

      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const passwordHash = await hashPassword(data.password);

      const verificationToken = generateVerificationToken({
        email: normalizedEmail,
        fullName,
        role: 'TEACHER',
      });
      const verificationTokenHash = hashToken(verificationToken);

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

      const verificationUrl = `${config.clientOrigin}/verify-email?token=${verificationToken}`;
      await queueEmail('VERIFICATION', {
        to: normalizedEmail,
        fullName,
        verificationUrl,
      });

      await logAudit({
        action: 'TEACHER_REGISTRATION_REQUESTED',
        entity: 'RegistrationRequest',
        entityId: request.id,
        details: { email: normalizedEmail, fullName },
        req,
      });

      return successResponse(res, {
        statusCode: 201,
        message: 'Teacher application submitted. Please verify your email via the link sent to your inbox.',
        data: {
          requestId: request.id,
          email: normalizedEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Email Link Click
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Verification token is required in query params.',
        });
      }

      const decoded = verifyEmailToken(token);
      if (!decoded || !decoded.email) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Invalid or expired verification token. Please request a new verification link.',
        });
      }

      const tokenHash = hashToken(token);
      const request = await prisma.registrationRequest.findFirst({
        where: {
          email: decoded.email,
          verificationTokenHash: tokenHash,
        },
      });

      if (!request) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'No pending registration request found matching this verification token.',
        });
      }

      if (request.tokenExpiresAt && request.tokenExpiresAt < new Date()) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'The verification token has expired. Please submit a new registration request.',
        });
      }

      // Mark email as verified
      await prisma.registrationRequest.update({
        where: { id: request.id },
        data: {
          isEmailVerified: true,
          verificationTokenHash: null, // single-use
        },
      });

      await logAudit({
        action: 'EMAIL_VERIFIED',
        entity: 'RegistrationRequest',
        entityId: request.id,
        details: { email: request.email, role: request.role },
        req,
      });

      return successResponse(res, {
        message: 'Email successfully verified! Your registration request is now awaiting approval by academy administration.',
        data: {
          email: request.email,
          role: request.role,
          status: request.status,
          isEmailVerified: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot Password - Protected against account enumeration
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Generic response to prevent email enumeration
      const genericSuccess = () =>
        successResponse(res, {
          message: 'If an account exists with this email address, you will receive password reset instructions.',
        });

      if (!user || user.status !== 'ACTIVE') {
        return genericSuccess();
      }

      const resetToken = generateResetToken({ userId: user.id, email: user.email });
      const resetUrl = `${config.clientOrigin}/reset-password?token=${resetToken}`;

      await queueEmail('PASSWORD_RESET', {
        to: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        resetUrl,
      });

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user.id,
        req,
      });

      return genericSuccess();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password with valid token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      const decoded = verifyResetToken(token);
      if (!decoded || !decoded.userId) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Invalid or expired password reset link. Please request a new one.',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'User account not found.',
        });
      }

      const newPasswordHash = await hashPassword(newPassword);

      // Update password and revoke all existing refresh tokens
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

      clearAuthCookies(res);

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        entity: 'User',
        entityId: user.id,
        req,
      });

      return successResponse(res, {
        message: 'Password has been successfully reset. You may now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
