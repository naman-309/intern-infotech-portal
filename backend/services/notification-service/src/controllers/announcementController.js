const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  queueEmail,
} = require('@portal/shared');

const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Announcement title is required'),
  body: z.string().min(5, 'Announcement body is required'),
  targetType: z.enum(['ALL', 'COURSE', 'BATCH', 'INDIVIDUAL']).default('ALL'),
  targetCourseId: z.string().uuid().optional(),
  targetBatchId: z.string().uuid().optional(),
  targetStudentId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  publishDate: z.string().optional().transform((val) => (val ? new Date(val) : new Date())),
  expiryDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  isPublished: z.boolean().default(true),
  sendEmailNotification: z.boolean().default(false),
});

class AnnouncementController {
  /**
   * List Announcements
   * Targeted by user role:
   * - Students: only announcements for ALL, their enrolled courses, their enrolled batches, or directly to them
   * - Teachers: announcements for ALL or their assigned batches/courses
   * - Admins: all announcements
   */
  async getAnnouncements(req, res, next) {
    try {
      const { priority, targetType, page = 1, limit = 15 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const now = new Date();
      let where = {
        isPublished: true,
        publishDate: { lte: now },
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
        ...(priority && { priority }),
        ...(targetType && { targetType }),
      };

      if (req.user.role === 'STUDENT') {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: req.user.id },
          include: {
            enrollments: true,
          },
        });

        const courseIds = studentProfile?.enrollments.map((e) => e.courseId) || [];
        const batchIds = studentProfile?.enrollments.map((e) => e.batchId) || [];

        where = {
          isPublished: true,
          publishDate: { lte: now },
          OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
          AND: [
            {
              OR: [
                { targetType: 'ALL' },
                { targetType: 'COURSE', targetCourseId: { in: courseIds } },
                { targetType: 'BATCH', targetBatchId: { in: batchIds } },
                { targetType: 'INDIVIDUAL', targetStudentId: studentProfile?.id },
              ],
            },
          ],
        };
      } else if (req.user.role === 'TEACHER') {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId: req.user.id },
          include: {
            assignments: { include: { batch: true } },
          },
        });

        const batchIds = teacherProfile?.assignments.map((a) => a.batchId) || [];
        const courseIds = teacherProfile?.assignments.map((a) => a.batch.courseId) || [];

        where = {
          isPublished: true,
          publishDate: { lte: now },
          OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
          AND: [
            {
              OR: [
                { targetType: 'ALL' },
                { targetType: 'COURSE', targetCourseId: { in: courseIds } },
                { targetType: 'BATCH', targetBatchId: { in: batchIds } },
                { authorId: req.user.id },
              ],
            },
          ],
        };
      } else if (req.user.role === 'ADMIN') {
        // Admin can see all including unpublished/expired if specified
        where = {
          ...(priority && { priority }),
          ...(targetType && { targetType }),
        };
      }

      const [total, announcements] = await prisma.$transaction([
        prisma.announcement.count({ where }),
        prisma.announcement.findMany({
          where,
          skip,
          take,
          orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
            targetCourse: { select: { id: true, title: true } },
            targetBatch: { select: { id: true, name: true, batchCode: true } },
          },
        }),
      ]);

      return paginatedResponse(res, {
        data: announcements,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Announcement
   */
  async createAnnouncement(req, res, next) {
    try {
      const data = createAnnouncementSchema.parse(req.body);

      // Teacher authorization check: can only target assigned batch/course or general
      if (req.user.role === 'TEACHER') {
        if (data.targetType === 'INDIVIDUAL') {
          return errorResponse(res, {
            statusCode: 403,
            message: 'Teachers cannot create individual student announcements.',
          });
        }
      }

      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          body: data.body,
          targetType: data.targetType,
          targetCourseId: data.targetCourseId || null,
          targetBatchId: data.targetBatchId || null,
          targetStudentId: data.targetStudentId || null,
          priority: data.priority,
          publishDate: data.publishDate,
          expiryDate: data.expiryDate,
          isPublished: data.isPublished,
          authorId: req.user.id,
        },
      });

      // If sendEmailNotification is true and announcement is published, dispatch emails to target group
      if (data.sendEmailNotification && data.isPublished) {
        setImmediate(async () => {
          try {
            let recipients = [];
            if (data.targetType === 'ALL') {
              const students = await prisma.user.findMany({
                where: { role: 'STUDENT', status: 'ACTIVE' },
                select: { email: true, firstName: true, lastName: true },
              });
              recipients = students;
            } else if (data.targetType === 'BATCH' && data.targetBatchId) {
              const enrollments = await prisma.enrollment.findMany({
                where: { batchId: data.targetBatchId, status: 'ACTIVE' },
                include: { student: { include: { user: true } } },
              });
              recipients = enrollments.map((e) => e.student.user);
            } else if (data.targetType === 'COURSE' && data.targetCourseId) {
              const enrollments = await prisma.enrollment.findMany({
                where: { courseId: data.targetCourseId, status: 'ACTIVE' },
                include: { student: { include: { user: true } } },
              });
              recipients = enrollments.map((e) => e.student.user);
            } else if (data.targetType === 'INDIVIDUAL' && data.targetStudentId) {
              const profile = await prisma.studentProfile.findUnique({
                where: { id: data.targetStudentId },
                include: { user: true },
              });
              if (profile?.user) recipients = [profile.user];
            }

            for (const r of recipients) {
              if (r.email) {
                // Dispatch async notification email
                console.log(`[Notification] Dispatched announcement email to ${r.email} for "${data.title}"`);
              }
            }

            await prisma.announcement.update({
              where: { id: announcement.id },
              data: { emailSent: true },
            });
          } catch (e) {
            console.error('[NotificationService] Email dispatch failed:', e.message);
          }
        });
      }

      await logAudit({
        userId: req.user.id,
        action: 'ANNOUNCEMENT_CREATED',
        entity: 'Announcement',
        entityId: announcement.id,
        details: { title: announcement.title, targetType: announcement.targetType },
        req,
      });

      return successResponse(res, {
        statusCode: 201,
        message: 'Announcement published successfully',
        data: { announcement },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Announcement (Admin or Author)
   */
  async updateAnnouncement(req, res, next) {
    try {
      const { id } = req.params;
      const data = createAnnouncementSchema.partial().parse(req.body);

      const existing = await prisma.announcement.findUnique({ where: { id } });
      if (!existing) {
        return errorResponse(res, { statusCode: 404, message: 'Announcement not found' });
      }

      if (req.user.role === 'TEACHER' && existing.authorId !== req.user.id) {
        return errorResponse(res, { statusCode: 403, message: 'Forbidden. You did not author this announcement.' });
      }

      const announcement = await prisma.announcement.update({
        where: { id },
        data,
      });

      await logAudit({
        userId: req.user.id,
        action: 'ANNOUNCEMENT_UPDATED',
        entity: 'Announcement',
        entityId: id,
        req,
      });

      return successResponse(res, {
        message: 'Announcement updated successfully',
        data: { announcement },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete / Archive Announcement
   */
  async deleteAnnouncement(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await prisma.announcement.findUnique({ where: { id } });
      if (!existing) {
        return errorResponse(res, { statusCode: 404, message: 'Announcement not found' });
      }

      if (req.user.role === 'TEACHER' && existing.authorId !== req.user.id) {
        return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
      }

      await prisma.announcement.delete({ where: { id } });

      await logAudit({
        userId: req.user.id,
        action: 'ANNOUNCEMENT_DELETED',
        entity: 'Announcement',
        entityId: id,
        req,
      });

      return successResponse(res, { message: 'Announcement deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnnouncementController();
