const express = require('express');
const { z } = require('zod');
const registrationController = require('./registration.controller');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

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

const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reviewNote: z.string().optional(),
  assignedBatchId: z.string().optional(),
  assignedCourseId: z.string().optional(),
});

// All registration review routes require authentication and ADMIN/TEACHER role
router.use(authenticate, requireRole('ADMIN', 'TEACHER'));

router.get('/', cacheMiddleware({ prefix: 'registrations', ttl: 1800 }), registrationController.getRequests);
router.post('/:id/review', validate(reviewSchema), registrationController.reviewRequest);

module.exports = router;
