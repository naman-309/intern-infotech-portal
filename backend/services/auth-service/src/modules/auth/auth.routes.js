const express = require('express');
const { z } = require('zod');
const authController = require('./auth.controller');
const { authenticate, authLimiter, registrationLimiter } = require('@portal/shared');

const router = express.Router();

// Simple Zod validator middleware
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted fields.',
      errors: err.errors ? err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) : err.message,
    });
  }
};

// Simple Schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const studentRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  offlineRegNumber: z.string().optional(),
  targetCourseId: z.string().optional(),
});

const teacherRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualifications: z.string().min(2, 'Qualifications are required'),
  bio: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Routes
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);

router.post('/register-request/student', registrationLimiter, validate(studentRegisterSchema), authController.requestStudentRegistration);
router.post('/register-request/teacher', registrationLimiter, validate(teacherRegisterSchema), authController.requestTeacherRegistration);
router.get('/verify-email', authController.verifyEmail);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
