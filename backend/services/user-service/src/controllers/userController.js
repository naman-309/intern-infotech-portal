const { z } = require('zod');
const {
  prisma,
  hashPassword,
  comparePassword,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  // Student-specific permitted fields
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  // Teacher-specific permitted fields
  bio: z.string().optional(),
  specialization: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

class UserController {
  /**
   * Update Self Profile
   */
  async updateProfile(req, res, next) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const userId = req.user.id;

      // Update User base fields
      const userUpdateData = {};
      if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
      if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
      if (data.phone !== undefined) userUpdateData.phone = data.phone;
      if (data.avatarUrl !== undefined) userUpdateData.avatarUrl = data.avatarUrl;

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });

        if (req.user.role === 'STUDENT' && req.user.studentProfile) {
          const studentData = {};
          if (data.address !== undefined) studentData.address = data.address;
          if (data.guardianName !== undefined) studentData.guardianName = data.guardianName;
          if (data.guardianPhone !== undefined) studentData.guardianPhone = data.guardianPhone;

          if (Object.keys(studentData).length > 0) {
            await tx.studentProfile.update({
              where: { id: req.user.studentProfile.id },
              data: studentData,
            });
          }
        }

        if (req.user.role === 'TEACHER' && req.user.teacherProfile) {
          const teacherData = {};
          if (data.bio !== undefined) teacherData.bio = data.bio;
          if (data.specialization !== undefined) teacherData.specialization = data.specialization;

          if (Object.keys(teacherData).length > 0) {
            await tx.teacherProfile.update({
              where: { id: req.user.teacherProfile.id },
              data: teacherData,
            });
          }
        }

        return user;
      });

      await logAudit({
        userId,
        action: 'PROFILE_UPDATED',
        entity: 'User',
        entityId: userId,
        details: { fields: Object.keys(data) },
        req,
      });

      await invalidateCache(['users']);

      return successResponse(res, {
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change Self Password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Incorrect current password.',
        });
      }

      const newHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: user.id,
        req,
      });

      return successResponse(res, { message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin / Teacher: List Students
   */
  async getStudents(req, res, next) {
    try {
      const { search = '', status, batchId, page = 1, limit = 10 } = req.query;
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
            {
              studentProfile: {
                enrollmentNumber: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }),
        ...(batchId && {
          studentProfile: {
            enrollments: {
              some: { batchId },
            },
          },
        }),
      };

      const [total, students] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
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
          },
        }),
      ]);

      return paginatedResponse(res, {
        data: students,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Student by ID
   */
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;

      const student = await prisma.user.findFirst({
        where: { id, role: 'STUDENT' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
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
              feeRecords: {
                include: { course: true, batch: true },
              },
              examResults: {
                include: {
                  exam: {
                    include: { course: true, batch: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!student) {
        return errorResponse(res, { statusCode: 404, message: 'Student not found' });
      }

      return successResponse(res, { data: { student } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List Teachers
   */
  async getTeachers(req, res, next) {
    try {
      const { search = '', status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        role: 'TEACHER',
        ...(status && { status }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            {
              teacherProfile: {
                employeeId: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }),
      };

      const [total, teachers] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
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

      return paginatedResponse(res, {
        data: teachers,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update User Account Status (ACTIVE, INACTIVE, SUSPENDED)
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        return errorResponse(res, { statusCode: 400, message: 'Invalid status' });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return errorResponse(res, { statusCode: 404, message: 'User not found' });
      }

      if (user.role === 'ADMIN' && req.user.id === user.id) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Administrators cannot deactivate their own active account.',
        });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { status },
      });

      // If user is deactivated/suspended, revoke their refresh tokens immediately
      if (status !== 'ACTIVE') {
        await prisma.refreshToken.updateMany({
          where: { userId: id },
          data: { revoked: true },
        });
      }

      await logAudit({
        userId: req.user.id,
        action: 'USER_STATUS_UPDATED',
        entity: 'User',
        entityId: id,
        details: { previousStatus: user.status, newStatus: status, userEmail: user.email },
        req,
      });

      await invalidateCache(['users', 'auth']);

      return successResponse(res, {
        message: `User status changed to ${status}`,
        data: { user: updated },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
