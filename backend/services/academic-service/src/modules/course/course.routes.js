const express = require('express');
const { z } = require('zod');
const courseController = require('./course.controller');
const {
  authenticate,
  requireRole,
  cacheMiddleware,
  purgeAllCache,
  successResponse,
} = require('@portal/shared');

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

const courseSchema = z.object({
  title: z.string().min(3, 'Course title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  curriculum: z.any().optional(),
  duration: z.string().min(1, 'Duration is required (e.g. 6 Months)'),
  advertisedFee: z.number().nonnegative('Advertised fee cannot be negative').default(0),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

// Admin Manual Cache Flush & Wipe
router.post('/cache/purge', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = await purgeAllCache();
    return successResponse(res, {
      message: 'Upstash Redis cache successfully wiped and refreshed!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Public course endpoints (Cached in Redis for 30 mins)
router.get('/public', cacheMiddleware({ prefix: 'courses', ttl: 1800 }), courseController.getPublicCourses);
router.get('/public/:slug', cacheMiddleware({ prefix: 'courses', ttl: 1800 }), courseController.getPublicCourseBySlug);

// Admin course management (Cached in Redis for 30 mins)
router.get('/', authenticate, requireRole('ADMIN', 'TEACHER'), cacheMiddleware({ prefix: 'courses', ttl: 1800 }), courseController.getAllCourses);
router.post('/', authenticate, requireRole('ADMIN'), validate(courseSchema), courseController.createCourse);
router.put('/:id', authenticate, requireRole('ADMIN'), validate(courseSchema.partial()), courseController.updateCourse);
router.delete('/:id/archive', authenticate, requireRole('ADMIN'), courseController.archiveCourse);

module.exports = router;
