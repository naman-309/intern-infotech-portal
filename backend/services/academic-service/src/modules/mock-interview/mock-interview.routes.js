const express = require('express');
const { z } = require('zod');
const mockInterviewController = require('./mock-interview.controller');
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

const saveMockInterviewSchema = z.object({
  id: z.string().optional(),
  title: z.string().default('Mock Interview Session'),
  date: z.string().transform((val) => new Date(val)),
  courseId: z.string().min(1, 'Course is required'),
  batchId: z.string().optional().nullable(),
  totalMarks: z.number().default(35),
  description: z.string().optional().nullable(),
  results: z.array(
    z.object({
      studentId: z.string().min(1),
      marksObtained: z.number().min(0).max(35, 'Marks cannot exceed 35'),
      feedback: z.string().optional().nullable(),
    })
  ),
});

router.use(authenticate);

// Student progress report (cached per student for 30 mins)
router.get(
  '/my-progress',
  requireRole('STUDENT'),
  cacheMiddleware({
    prefix: 'mock_interviews',
    ttl: 1800,
    keyGenerator: (req) => `cache:mock_interviews:student:${req.user.id}`,
  }),
  mockInterviewController.getMyProgressReport
);

// Admin & Teacher session management
router.get(
  '/session',
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'mock_interviews', ttl: 1800 }),
  mockInterviewController.getSession
);

router.post('/save', requireRole('ADMIN', 'TEACHER'), validate(saveMockInterviewSchema), mockInterviewController.saveSession);

// Admin & Teacher list, view, delete (Cached for 30 mins)
router.get(
  '/',
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'mock_interviews', ttl: 1800 }),
  mockInterviewController.getAll
);

router.get(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'mock_interviews', ttl: 1800 }),
  mockInterviewController.getById
);

router.delete('/:id', requireRole('ADMIN'), mockInterviewController.delete);

module.exports = router;
