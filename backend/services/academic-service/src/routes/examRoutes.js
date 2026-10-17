const express = require('express');
const examController = require('../controllers/examController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

router.get('/', examController.getExams);
router.get('/:id', examController.getExamById);

// Creation and publishing
router.post('/', requireRole('ADMIN', 'TEACHER'), examController.createExam);
router.post('/:id/publish', requireRole('ADMIN', 'TEACHER'), examController.publishExam);
router.post('/:id/unpublish', requireRole('ADMIN'), examController.unpublishExam);

module.exports = router;
