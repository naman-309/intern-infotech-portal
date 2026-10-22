const express = require('express');
const { z } = require('zod');
const examController = require('./exam.controller');
const { authenticate, requireRole } = require('@portal/shared');

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

const createExamSchema = z.object({
  title: z.string().min(3, 'Test title is required'),
  subject: z.string().min(2, 'Subject is required'),
  courseId: z.string().uuid(),
  batchId: z.string().uuid(),
  examDate: z.string().transform((val) => new Date(val)),
  maxMarks: z.number().positive('Maximum marks must be greater than zero'),
  description: z.string().optional(),
});

router.use(authenticate);

router.get('/', examController.getExams);
router.get('/:id', examController.getExamById);

// Creation and publishing
router.post('/', requireRole('ADMIN', 'TEACHER'), validate(createExamSchema), examController.createExam);
router.post('/:id/publish', requireRole('ADMIN', 'TEACHER'), examController.publishExam);
router.post('/:id/unpublish', requireRole('ADMIN'), examController.unpublishExam);

module.exports = router;
