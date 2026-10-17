const express = require('express');
const batchController = require('../controllers/batchController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);

// Admin-only operations
router.post('/', requireRole('ADMIN'), batchController.createBatch);
router.put('/:id', requireRole('ADMIN'), batchController.updateBatch);
router.post('/:id/teachers', requireRole('ADMIN'), batchController.assignTeacher);
router.delete('/:id/teachers/:teacherId', requireRole('ADMIN'), batchController.removeTeacherAssignment);
router.post('/:id/enrollments', requireRole('ADMIN'), batchController.enrollStudent);

module.exports = router;
