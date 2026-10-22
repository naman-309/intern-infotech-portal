const express = require('express');
const { z } = require('zod');
const eligibleEmailController = require('./eligible-email.controller');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

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

const createEligibleSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(2, 'Full name is required'),
  offlineRegNumber: z.string().optional(),
  phone: z.string().optional(),
  courseHint: z.string().optional(),
});

const bulkImportSchema = z.object({
  students: z.array(createEligibleSchema).min(1, 'Provide at least one student record'),
});

router.use(authenticate, requireRole('ADMIN'));

router.get('/', cacheMiddleware({ prefix: 'eligible_emails', ttl: 1800 }), eligibleEmailController.getEligibleEmails);
router.post('/', validate(createEligibleSchema), eligibleEmailController.addEligibleEmail);
router.post('/bulk', validate(bulkImportSchema), eligibleEmailController.bulkImport);
router.delete('/:id', eligibleEmailController.deleteEligibleEmail);

module.exports = router;
