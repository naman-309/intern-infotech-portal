const express = require('express');
const feeController = require('../controllers/feeController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

// Student view own fees
router.get('/my-fees', requireRole('STUDENT'), feeController.getMyFees);

// Admin view and update fees
router.get('/', requireRole('ADMIN'), feeController.getAllFees);
router.put('/:id', requireRole('ADMIN'), feeController.updateFeeRecord);

module.exports = router;
