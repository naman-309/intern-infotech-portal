const express = require('express');
const { z } = require('zod');
const announcementController = require('./announcement.controller');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

// Simple Zod validator
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors ? err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) : err.message,
    });
  }
};

const announcementBaseSchema = z.object({
  title: z.string().min(3, 'Announcement title is required'),
  body: z.string().optional(),
  content: z.string().optional(),
  targetType: z.enum(['ALL', 'COURSE', 'BATCH', 'INDIVIDUAL']).optional(),
  targetScope: z.enum(['ALL', 'COURSE', 'BATCH', 'INDIVIDUAL']).optional(),
  targetCourseId: z.string().uuid().optional().nullable(),
  targetBatchId: z.string().uuid().optional().nullable(),
  targetStudentId: z.string().uuid().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  publishDate: z.any().optional().transform((val) => (val ? new Date(val) : new Date())),
  expiryDate: z.any().optional().transform((val) => (val ? new Date(val) : undefined)),
  isPublished: z.boolean().default(true),
  sendEmailNotification: z.boolean().default(false),
});

const createAnnouncementSchema = announcementBaseSchema
  .refine((data) => Boolean(data.body || data.content), {
    message: 'Announcement body is required',
    path: ['body'],
  })
  .transform((data) => ({
    ...data,
    body: data.body || data.content,
    targetType: data.targetType || data.targetScope || 'ALL',
  }));

const updateAnnouncementSchema = announcementBaseSchema.partial().transform((data) => ({
  ...data,
  ...(data.content && !data.body && { body: data.content }),
  ...(data.targetScope && !data.targetType && { targetType: data.targetScope }),
}));

router.use(authenticate);

router.get('/', cacheMiddleware({ prefix: 'announcements', ttl: 1800 }), announcementController.getAnnouncements);
router.post('/', requireRole('ADMIN', 'TEACHER'), validate(createAnnouncementSchema), announcementController.createAnnouncement);
router.put('/:id', requireRole('ADMIN', 'TEACHER'), validate(updateAnnouncementSchema), announcementController.updateAnnouncement);
router.delete('/:id', requireRole('ADMIN', 'TEACHER'), announcementController.deleteAnnouncement);

module.exports = router;
