const express = require('express');
const courseController = require('../controllers/courseController');
const {
  authenticate,
  requireRole,
  cacheMiddleware,
  purgeAllCache,
  successResponse,
} = require('@portal/shared');

const router = express.Router();

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
router.post('/', authenticate, requireRole('ADMIN'), courseController.createCourse);
router.put('/:id', authenticate, requireRole('ADMIN'), courseController.updateCourse);
router.delete('/:id/archive', authenticate, requireRole('ADMIN'), courseController.archiveCourse);

module.exports = router;
