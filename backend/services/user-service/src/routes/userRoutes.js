const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

// Self Profile
router.put('/profile', authenticate, userController.updateProfile);
router.post('/change-password', authenticate, userController.changePassword);

// Students (cached for 3 minutes)
router.get(
  '/students',
  authenticate,
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'users', ttl: 180 }),
  userController.getStudents
);
router.get(
  '/students/:id',
  authenticate,
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'users', ttl: 180 }),
  userController.getStudentById
);

// Teachers (cached for 3 minutes)
router.get(
  '/teachers',
  authenticate,
  requireRole('ADMIN'),
  cacheMiddleware({ prefix: 'users', ttl: 180 }),
  userController.getTeachers
);

// User status lifecycle (Active / Inactive / Suspended)
router.patch('/users/:id/status', authenticate, requireRole('ADMIN'), userController.updateUserStatus);

module.exports = router;
