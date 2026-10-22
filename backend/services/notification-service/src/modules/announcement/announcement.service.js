const {
  prisma,
  config,
  logAudit,
  queueEmail,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * List Announcements targeted by user role
 */
const getAnnouncements = async ({ priority, targetType, page = 1, limit = 15, user }) => {
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

  if (user.role === 'STUDENT') {
    // Find student enrollments to filter relevant announcements
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { enrollments: true },
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
  } else if (user.role === 'TEACHER') {
    // Find teacher assignments
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
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
            { authorId: user.id },
          ],
        },
      ],
    };
  } else if (user.role === 'ADMIN') {
    // Admin can see all announcements
    where = {
      ...(priority && { priority }),
      ...(targetType && { targetType }),
    };
  }

  // Count and fetch announcements concurrently
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

  return { announcements, total, page: Number(page), limit: Number(limit) };
};

/**
 * Create Announcement and optionally trigger email notifications
 */
const createAnnouncement = async (data, user, req) => {
  // Teachers cannot create individual announcements
  if (user.role === 'TEACHER' && data.targetType === 'INDIVIDUAL') {
    const error = new Error('Teachers cannot create individual student announcements.');
    error.statusCode = 403;
    throw error;
  }

  // Create announcement in database
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
      authorId: user.id,
    },
  });

  // Async dispatch email notifications to relevant recipients
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

        let queuedCount = 0;
        const authorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Academy Administration';
        const clientOrigin = config.getClientOrigin ? config.getClientOrigin(req) : config.clientOrigin;
        const portalUrl = `${clientOrigin}/student/announcements`;

        for (const r of recipients) {
          if (r.email) {
            const studentName = `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Student';
            try {
              await queueEmail('ANNOUNCEMENT', {
                to: r.email,
                email: r.email,
                studentName,
                title: data.title,
                body: data.body,
                priority: data.priority,
                authorName,
                portalUrl,
              });
              queuedCount++;
            } catch (queueErr) {
              console.error(`[NotificationService] Failed queuing announcement email to ${r.email}:`, queueErr.message);
            }
          }
        }

        console.log(`[NotificationService] Dispatched ${queuedCount} announcement emails via Redis Pub/Sub for "${data.title}"`);

        await prisma.announcement.update({
          where: { id: announcement.id },
          data: { emailSent: true },
        });
      } catch (e) {
        console.error('[NotificationService] Email dispatch process encountered error:', e.message);
      }
    });
  }

  // Audit log
  await logAudit({
    userId: user.id,
    action: 'ANNOUNCEMENT_CREATED',
    entity: 'Announcement',
    entityId: announcement.id,
    details: { title: announcement.title, targetType: announcement.targetType },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('announcements');
  await invalidateCache(['announcements']);

  return announcement;
};

/**
 * Update Announcement
 */
const updateAnnouncement = async (id, data, user, req) => {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'TEACHER' && existing.authorId !== user.id) {
    const error = new Error('Forbidden. You did not author this announcement.');
    error.statusCode = 403;
    throw error;
  }

  // Update in database
  const updated = await prisma.announcement.update({
    where: { id },
    data,
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'ANNOUNCEMENT_UPDATED',
    entity: 'Announcement',
    entityId: id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('announcements');
  await invalidateCache(['announcements']);

  return updated;
};

/**
 * Delete Announcement
 */
const deleteAnnouncement = async (id, user, req) => {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'TEACHER' && existing.authorId !== user.id) {
    const error = new Error('Forbidden.');
    error.statusCode = 403;
    throw error;
  }

  // Delete from database
  await prisma.announcement.delete({ where: { id } });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'ANNOUNCEMENT_DELETED',
    entity: 'Announcement',
    entityId: id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('announcements');
  await invalidateCache(['announcements']);

  return { message: 'Announcement deleted' };
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
