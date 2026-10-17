const express = require('express');
const resultController = require('../controllers/resultController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

// Student view own published results
router.get('/my-results', requireRole('STUDENT'), resultController.getMyResults);

// Teacher / Admin record or edit marks
router.post('/record-marks', requireRole('ADMIN', 'TEACHER'), resultController.recordMarks);

module.exports = router;
