const express = require('express');
const mockInterviewController = require('../controllers/mockInterviewController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

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
router.post('/save', requireRole('ADMIN', 'TEACHER'), mockInterviewController.saveSession);

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
