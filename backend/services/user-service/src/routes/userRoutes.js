const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

// Self Profile
router.put('/profile', authenticate, userController.updateProfile);
router.post('/change-password', authenticate, userController.changePassword);

// Students
router.get('/students', authenticate, requireRole('ADMIN', 'TEACHER'), userController.getStudents);
router.get('/students/:id', authenticate, requireRole('ADMIN', 'TEACHER'), userController.getStudentById);

// Teachers
router.get('/teachers', authenticate, requireRole('ADMIN'), userController.getTeachers);

// User status lifecycle (Active / Inactive / Suspended)
router.patch('/users/:id/status', authenticate, requireRole('ADMIN'), userController.updateUserStatus);

module.exports = router;
