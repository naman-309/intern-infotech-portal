const express = require('express');
const authController = require('../controllers/authController');
const {
  authenticate,
  authLimiter,
  registrationLimiter,
} = require('@portal/shared');

const router = express.Router();

// Public Auth Endpoints with Rate Limiting
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Registration Request Endpoints
router.post('/register-request/student', registrationLimiter, authController.requestStudentRegistration);
router.post('/register-request/teacher', registrationLimiter, authController.requestTeacherRegistration);
router.get('/verify-email', authController.verifyEmail);

// Password Reset Endpoints
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Authenticated Session Endpoints
router.get('/me', authenticate, authController.getMe);

module.exports = router;
