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
  uploadBuffer,
} = require('@portal/shared');

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
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

      // Direct image upload from Multer buffer to Cloudinary
      if (req.file) {
        try {
          const uploadRes = await uploadBuffer(
            req.file.buffer,
            req.file.mimetype,
            'infotech-portal/profiles'
          );
          if (uploadRes?.secure_url) {
            userUpdateData.avatarUrl = uploadRes.secure_url;
            console.log(`[UserController] Processed passport photo: ${uploadRes.secure_url.substring(0, 45)}...`);
          }
        } catch (uploadErr) {
          console.error('[UserController] Avatar processing error:', uploadErr.message);
          userUpdateData.avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
      } else if (data.avatarUrl !== undefined && data.avatarUrl !== null) {
        userUpdateData.avatarUrl = data.avatarUrl;
      }

      // 1. Update User base fields if any
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      // 2. Update Student Profile if Student
      if (req.user.role === 'STUDENT') {
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

      // 3. Update Teacher Profile if Teacher
      if (req.user.role === 'TEACHER') {
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

      // 4. Fetch the fresh user object with all updated relations
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
   * Admin / Teacher: List Students (Indexed and Parallelized for Sub-300ms Search)
   */
  async getStudents(req, res, next) {
    try {
      const { search = '', status, batchId, journeyStatus, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
      const trimmedSearch = search.trim();

      const where = {
        role: 'STUDENT',
        ...(status && { status }),
        ...(journeyStatus && {
          studentProfile: {
            journeyStatus,
          },
        }),
        ...(trimmedSearch && {
          OR: [
            { firstName: { contains: trimmedSearch, mode: 'insensitive' } },
            { lastName: { contains: trimmedSearch, mode: 'insensitive' } },
            { email: { contains: trimmedSearch, mode: 'insensitive' } },
            { phone: { contains: trimmedSearch, mode: 'insensitive' } },
            {
              studentProfile: {
                enrollmentNumber: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
            {
              studentProfile: {
                rollNumber: { contains: trimmedSearch, mode: 'insensitive' },
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

      // Concurrent parallel queries over connection pooler (replaces slow $transaction)
      const [total, students] = await Promise.all([
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
              select: {
                id: true,
                enrollmentNumber: true,
                rollNumber: true,
                guardianName: true,
                guardianPhone: true,
                address: true,
                joiningDate: true,
                journeyStatus: true,
                exitDate: true,
                dropOutReason: true,
                createdAt: true,
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
   * Get Student by ID (Full Student 360 View)
   */
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;

      const student = await prisma.user.findFirst({
        where: {
          role: 'STUDENT',
          OR: [{ id }, { studentProfile: { id } }],
        },
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
                orderBy: { enrolledAt: 'desc' },
              },
              feeRecords: {
                include: {
                  course: true,
                  batch: true,
                  payments: {
                    orderBy: { paidAt: 'desc' },
                  },
                },
                orderBy: { createdAt: 'desc' },
              },
              mockResults: {
                include: {
                  mockInterview: {
                    include: {
                      course: true,
                      batch: true,
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
              },
              examResults: {
                include: {
                  exam: {
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
        return errorResponse(res, { statusCode: 404, message: 'Student not found' });
      }

      return successResponse(res, { data: { student } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Student Details on behalf of student
   */
  async updateStudentByAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        phone,
        email,
        avatarUrl,
        rollNumber,
        guardianName,
        guardianPhone,
        address,
        joiningDate,
        journeyStatus,
        exitDate,
        dropOutReason,
      } = req.body;

      const student = await prisma.user.findFirst({
        where: {
          role: 'STUDENT',
          OR: [{ id }, { studentProfile: { id } }],
        },
        include: { studentProfile: true },
      });

      if (!student) {
        return errorResponse(res, { statusCode: 404, message: 'Student not found' });
      }

      const userUpdateData = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (avatarUrl !== undefined) userUpdateData.avatarUrl = avatarUrl;
      if (email !== undefined && email !== student.email) {
        // Verify unique email
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail && existingEmail.id !== student.id) {
          return errorResponse(res, { statusCode: 400, message: 'Email address is already in use' });
        }
        userUpdateData.email = email;
      }

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: student.id },
          data: userUpdateData,
        });
      }

      const profileUpdateData = {};
      if (rollNumber !== undefined) profileUpdateData.rollNumber = rollNumber;
      if (guardianName !== undefined) profileUpdateData.guardianName = guardianName;
      if (guardianPhone !== undefined) profileUpdateData.guardianPhone = guardianPhone;
      if (address !== undefined) profileUpdateData.address = address;
      if (joiningDate !== undefined) profileUpdateData.joiningDate = new Date(joiningDate);
      if (journeyStatus !== undefined) profileUpdateData.journeyStatus = journeyStatus;
      if (exitDate !== undefined) profileUpdateData.exitDate = exitDate ? new Date(exitDate) : null;
      if (dropOutReason !== undefined) profileUpdateData.dropOutReason = dropOutReason;

      if (student.studentProfile) {
        if (Object.keys(profileUpdateData).length > 0) {
          await prisma.studentProfile.update({
            where: { id: student.studentProfile.id },
            data: profileUpdateData,
          });
        }
      } else {
        await prisma.studentProfile.create({
          data: {
            userId: student.id,
            enrollmentNumber: `IIT-S${Date.now().toString().slice(-6)}`,
            ...profileUpdateData,
          },
        });
      }

      const updatedStudent = await prisma.user.findUnique({
        where: { id: student.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          avatarUrl: true,
          studentProfile: {
            include: {
              enrollments: { include: { batch: true, course: true } },
              feeRecords: { include: { course: true, batch: true, payments: true } },
              mockResults: { include: { mockInterview: { include: { course: true, batch: true } } } },
            },
          },
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'ADMIN_STUDENT_PROFILE_UPDATED',
        entity: 'User',
        entityId: student.id,
        details: { updatedFields: { ...userUpdateData, ...profileUpdateData } },
        req,
      });

      await invalidateCache(['users']);

      return successResponse(res, {
        message: 'Student profile updated successfully',
        data: { student: updatedStudent },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Student Journey Status (ACTIVE, PLACED, DROPPED_OUT)
   */
  async updateStudentJourneyStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { journeyStatus, dropOutReason, exitDate } = req.body;

      if (!['ACTIVE', 'PLACED', 'DROPPED_OUT'].includes(journeyStatus)) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Invalid journeyStatus. Must be ACTIVE, PLACED, or DROPPED_OUT',
        });
      }

      if (journeyStatus === 'DROPPED_OUT' && (!dropOutReason || !dropOutReason.trim())) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'A mandatory drop out reason is required when marking student as DROPPED_OUT',
        });
      }

      const student = await prisma.user.findFirst({
        where: {
          role: 'STUDENT',
          OR: [{ id }, { studentProfile: { id } }],
        },
        include: { studentProfile: true },
      });

      if (!student) {
        return errorResponse(res, { statusCode: 404, message: 'Student not found' });
      }

      const updateData = {
        journeyStatus,
      };

      if (journeyStatus === 'DROPPED_OUT') {
        updateData.dropOutReason = dropOutReason.trim();
        updateData.exitDate = exitDate ? new Date(exitDate) : new Date();
      } else if (journeyStatus === 'PLACED') {
        updateData.dropOutReason = null;
        updateData.exitDate = exitDate ? new Date(exitDate) : new Date();
      } else {
        // ACTIVE
        updateData.dropOutReason = null;
        updateData.exitDate = null;
      }

      const updatedProfile = await prisma.studentProfile.update({
        where: { id: student.studentProfile.id },
        data: updateData,
      });

      await logAudit({
        userId: req.user.id,
        action: 'STUDENT_JOURNEY_STATUS_UPDATED',
        entity: 'StudentProfile',
        entityId: student.studentProfile.id,
        details: {
          studentId: student.id,
          previousStatus: student.studentProfile.journeyStatus,
          newStatus: journeyStatus,
          dropOutReason: updateData.dropOutReason,
          exitDate: updateData.exitDate,
        },
        req,
      });

      await invalidateCache(['users']);

      return successResponse(res, {
        message: `Student journey status updated to ${journeyStatus}`,
        data: { profile: updatedProfile },
      });
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

      await invalidateCache(['users', 'auth', 'teachers_public']);

      return successResponse(res, {
        message: `User status changed to ${status}`,
        data: { user: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: List Teachers Visible on Institute Website
   * Filters by showOnWebsite: true and status: ACTIVE
   */
  async getPublicTeachers(req, res, next) {
    try {
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
                    select: {
                      id: true,
                      name: true,
                      batchCode: true,
                      course: {
                        select: {
                          id: true,
                          title: true,
                          slug: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return successResponse(res, {
        message: 'Public faculty list fetched successfully',
        data: teachers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Add New Faculty Member
   */
  async createTeacher(req, res, next) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        specialization,
        qualifications,
        bio,
        showOnWebsite = true,
      } = req.body;

      if (!email || !firstName || !lastName) {
        return errorResponse(res, { statusCode: 400, message: 'Email, First Name, and Last Name are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return errorResponse(res, { statusCode: 409, message: 'A user account with this email already exists' });
      }

      const passwordHash = await hashPassword(password || 'Teacher@12345');
      const teacherCount = await prisma.teacherProfile.count();
      const employeeId = `IIT-T${101 + teacherCount}`;

      const newTeacher = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? phone.trim() : null,
            role: 'TEACHER',
            status: 'ACTIVE',
          },
        });

        const profile = await tx.teacherProfile.create({
          data: {
            userId: user.id,
            employeeId,
            specialization: specialization ? specialization.trim() : null,
            qualifications: qualifications ? qualifications.trim() : null,
            bio: bio ? bio.trim() : null,
            showOnWebsite: Boolean(showOnWebsite),
          },
        });

        return { ...user, teacherProfile: profile };
      });

      await logAudit({
        userId: req.user.id,
        action: 'FACULTY_CREATED_BY_ADMIN',
        entity: 'User',
        entityId: newTeacher.id,
        details: { email: normalizedEmail, employeeId, showOnWebsite },
        req,
      });

      await invalidateCache(['users', 'teachers_public']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Faculty member created successfully',
        data: { teacher: newTeacher },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Edit Faculty Details
   */
  async updateTeacher(req, res, next) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        phone,
        specialization,
        qualifications,
        bio,
        showOnWebsite,
      } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          role: 'TEACHER',
          OR: [{ id }, { teacherProfile: { id } }],
        },
        include: { teacherProfile: true },
      });

      if (!user || !user.teacherProfile) {
        return errorResponse(res, { statusCode: 404, message: 'Faculty member not found' });
      }

      const userUpdateData = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName.trim();
      if (lastName !== undefined) userUpdateData.lastName = lastName.trim();
      if (phone !== undefined) userUpdateData.phone = phone ? phone.trim() : null;

      const profileUpdateData = {};
      if (specialization !== undefined) profileUpdateData.specialization = specialization ? specialization.trim() : null;
      if (qualifications !== undefined) profileUpdateData.qualifications = qualifications ? qualifications.trim() : null;
      if (bio !== undefined) profileUpdateData.bio = bio ? bio.trim() : null;
      if (showOnWebsite !== undefined) profileUpdateData.showOnWebsite = Boolean(showOnWebsite);

      const [updatedUser, updatedProfile] = await prisma.$transaction([
        Object.keys(userUpdateData).length > 0
          ? prisma.user.update({
              where: { id: user.id },
              data: userUpdateData,
            })
          : prisma.user.findUnique({ where: { id: user.id } }),
        Object.keys(profileUpdateData).length > 0
          ? prisma.teacherProfile.update({
              where: { id: user.teacherProfile.id },
              data: profileUpdateData,
            })
          : prisma.teacherProfile.findUnique({ where: { id: user.teacherProfile.id } }),
      ]);

      await logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPDATED_BY_ADMIN',
        entity: 'User',
        entityId: user.id,
        details: { userUpdates: userUpdateData, profileUpdates: profileUpdateData },
        req,
      });

      await invalidateCache(['users', 'teachers_public']);

      return successResponse(res, {
        message: 'Faculty details updated successfully',
        data: {
          teacher: {
            ...updatedUser,
            teacherProfile: updatedProfile,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Toggle Teacher Public Website Visibility (Show on Public Website: ON / OFF)
   */
  async toggleTeacherVisibility(req, res, next) {
    try {
      const { id } = req.params;
      const { showOnWebsite } = req.body;

      if (typeof showOnWebsite !== 'boolean') {
        return errorResponse(res, { statusCode: 400, message: 'showOnWebsite boolean flag (true/false) is required' });
      }

      const user = await prisma.user.findFirst({
        where: {
          role: 'TEACHER',
          OR: [{ id }, { teacherProfile: { id } }],
        },
        include: { teacherProfile: true },
      });

      if (!user || !user.teacherProfile) {
        return errorResponse(res, { statusCode: 404, message: 'Faculty member not found' });
      }

      const updatedProfile = await prisma.teacherProfile.update({
        where: { id: user.teacherProfile.id },
        data: { showOnWebsite },
      });

      await logAudit({
        userId: req.user.id,
        action: 'TEACHER_VISIBILITY_TOGGLED',
        entity: 'TeacherProfile',
        entityId: user.teacherProfile.id,
        details: { teacherId: user.id, showOnWebsite },
        req,
      });

      await invalidateCache(['users', 'teachers_public']);

      return successResponse(res, {
        message: `Faculty public website visibility set to ${showOnWebsite ? 'ON' : 'OFF'}`,
        data: {
          teacherId: user.id,
          employeeId: updatedProfile.employeeId,
          showOnWebsite: updatedProfile.showOnWebsite,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
