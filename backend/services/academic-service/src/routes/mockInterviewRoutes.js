const express = require('express');
const mockInterviewController = require('../controllers/mockInterviewController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

// Student progress report (month-by-month mock interview results out of 35)
router.get('/my-progress', requireRole('STUDENT'), mockInterviewController.getMyProgressReport);

// Admin & Teacher session management
router.get('/session', requireRole('ADMIN', 'TEACHER'), mockInterviewController.getSession);
router.post('/save', requireRole('ADMIN', 'TEACHER'), mockInterviewController.saveSession);

// Admin & Teacher list, view, delete
router.get('/', requireRole('ADMIN', 'TEACHER'), mockInterviewController.getAll);
router.get('/:id', requireRole('ADMIN', 'TEACHER'), mockInterviewController.getById);
router.delete('/:id', requireRole('ADMIN'), mockInterviewController.delete);

module.exports = router;
