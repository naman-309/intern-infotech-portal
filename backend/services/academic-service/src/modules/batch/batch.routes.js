const express = require('express');
const { z } = require('zod');
const batchController = require('./batch.controller');
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

const createBatchSchema = z.object({
  name: z.string().min(3, 'Batch name is required'),
  batchCode: z.string().min(2, 'Unique batch code is required (e.g. BATCH-2026-FSD1)'),
  courseId: z.string().uuid('Valid course ID is required'),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  timing: z.string().optional(),
  capacity: z.number().int().positive().default(30),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED']).default('UPCOMING'),
});

const assignTeacherSchema = z.object({
  teacherId: z.string().uuid(),
  roleTitle: z.string().optional(),
});

const enrollStudentSchema = z.object({
  studentId: z.string().uuid(),
  discountAmount: z.number().min(0, 'Discount amount cannot be negative').optional().default(0),
});

router.use(authenticate);

router.get('/', cacheMiddleware({ prefix: 'batches', ttl: 1800 }), batchController.getBatches);
router.get('/:id', cacheMiddleware({ prefix: 'batches', ttl: 1800 }), batchController.getBatchById);

// Admin-only operations
router.post('/', requireRole('ADMIN'), validate(createBatchSchema), batchController.createBatch);
router.put('/:id', requireRole('ADMIN'), validate(createBatchSchema.partial()), batchController.updateBatch);
router.post('/:id/teachers', requireRole('ADMIN'), validate(assignTeacherSchema), batchController.assignTeacher);
router.delete('/:id/teachers/:teacherId', requireRole('ADMIN'), batchController.removeTeacherAssignment);
router.post('/:id/enrollments', requireRole('ADMIN'), validate(enrollStudentSchema), batchController.enrollStudent);

module.exports = router;
