const express = require('express');
const feeController = require('../controllers/feeController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

// Student view own fees (cached per student user ID for 2 minutes)
router.get(
  '/my-fees',
  requireRole('STUDENT'),
  cacheMiddleware({
    prefix: 'fees',
    ttl: 120,
    keyGenerator: (req) => `cache:fees:student:${req.user.id}`,
  }),
  feeController.getMyFees
);

// Admin view and update fees (cached for 3 minutes)
router.get('/', requireRole('ADMIN'), cacheMiddleware({ prefix: 'fees', ttl: 180 }), feeController.getAllFees);
router.post('/:id/payments', requireRole('ADMIN'), feeController.recordPayment);
router.put('/:id', requireRole('ADMIN'), feeController.updateFeeRecord);

module.exports = router;
