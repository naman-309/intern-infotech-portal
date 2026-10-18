const express = require('express');
const mockInterviewController = require('../controllers/mockInterviewController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

// Student progress report (cached per student for 2 mins)
router.get(
  '/my-progress',
  requireRole('STUDENT'),
  cacheMiddleware({
    prefix: 'mock_interviews',
    ttl: 120,
    keyGenerator: (req) => `cache:mock_interviews:student:${req.user.id}`,
  }),
  mockInterviewController.getMyProgressReport
);

// Admin & Teacher session management
router.get(
  '/session',
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'mock_interviews', ttl: 120 }),
  mockInterviewController.getSession
);
router.post('/save', requireRole('ADMIN', 'TEACHER'), mockInterviewController.saveSession);

// Admin & Teacher list, view, delete
router.get(
  '/',
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'mock_interviews', ttl: 180 }),
  mockInterviewController.getAll
);
router.get(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'mock_interviews', ttl: 180 }),
  mockInterviewController.getById
);
router.delete('/:id', requireRole('ADMIN'), mockInterviewController.delete);

module.exports = router;
