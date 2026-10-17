const express = require('express');
const registrationController = require('../controllers/registrationController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN', 'TEACHER'), registrationController.getRequests);
router.post('/:id/review', authenticate, requireRole('ADMIN', 'TEACHER'), registrationController.reviewRequest);

module.exports = router;
