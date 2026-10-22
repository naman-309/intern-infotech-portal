const express = require('express');
const { z } = require('zod');
const resultController = require('./result.controller');
const { authenticate, requireRole } = require('@portal/shared');

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

const saveMarksSchema = z.object({
  examId: z.string().uuid(),
  entries: z.array(
    z.object({
      studentId: z.string().uuid(),
      marksObtained: z.number().nonnegative('Marks cannot be negative'),
      remarks: z.string().optional(),
      reasonForChange: z.string().optional(),
    })
  ).min(1, 'At least one student mark entry is required'),
});

router.use(authenticate);

// Student view own published results
router.get('/my-results', requireRole('STUDENT'), resultController.getMyResults);

// Teacher / Admin record or edit marks
router.post('/record-marks', requireRole('ADMIN', 'TEACHER'), validate(saveMarksSchema), resultController.recordMarks);

module.exports = router;
