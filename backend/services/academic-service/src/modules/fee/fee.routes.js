const express = require('express');
const { z } = require('zod');
const feeController = require('./fee.controller');
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

const updateFeeSchema = z.object({
  originalFee: z.number().nonnegative('Original course fee cannot be negative').optional(),
  discountAmount: z.number().nonnegative('Discount amount cannot be negative').optional(),
  paidAmount: z.number().nonnegative('Paid amount cannot be negative').optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD']).default('UPI'),
  transactionRef: z.string().optional(),
  receiptNumber: z.string().optional(),
  remarks: z.string().optional(),
  paidAt: z.string().optional().transform((val) => (val ? new Date(val) : new Date())),
});

router.use(authenticate);

// Student view own fees (cached per student user ID for 30 minutes in Redis)
router.get(
  '/my-fees',
  requireRole('STUDENT'),
  cacheMiddleware({
    prefix: 'fees',
    ttl: 1800,
    keyGenerator: (req) => `cache:fees:student:${req.user.id}`,
  }),
  feeController.getMyFees
);

// Admin view and update fees (cached for 30 minutes in Redis)
router.get('/', requireRole('ADMIN'), cacheMiddleware({ prefix: 'fees', ttl: 1800 }), feeController.getAllFees);
router.post('/:id/payments', requireRole('ADMIN'), validate(recordPaymentSchema), feeController.recordPayment);
router.put('/:id', requireRole('ADMIN'), validate(updateFeeSchema), feeController.updateFeeRecord);

module.exports = router;
