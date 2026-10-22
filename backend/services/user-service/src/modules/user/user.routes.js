const express = require('express');
const multer = require('multer');
const userController = require('./user.controller');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

// Memory storage for direct profile photo upload (5MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are allowed for profile photo upload.'), false);
    }
  },
});

// Self Profile
router.put(['/profile', '/users/profile'], authenticate, upload.single('avatar'), userController.updateProfile);
router.post(['/change-password', '/users/change-password'], authenticate, userController.changePassword);

// Students Management
router.get(
  '/students',
  authenticate,
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'users', ttl: 1800 }),
  userController.getStudents
);

router.get(
  '/students/:id',
  authenticate,
  requireRole('ADMIN', 'TEACHER'),
  cacheMiddleware({ prefix: 'users', ttl: 1800 }),
  userController.getStudentById
);

router.put('/students/:id', authenticate, requireRole('ADMIN'), userController.updateStudentByAdmin);
router.patch('/students/:id/journey-status', authenticate, requireRole('ADMIN'), userController.updateStudentJourneyStatus);

// Teachers
// Public directory of instructors
router.get(
  '/teachers/public',
  cacheMiddleware({ prefix: 'teachers_public', ttl: 1800 }),
  userController.getPublicTeachers
);

// Admin teacher management
router.get(
  '/teachers',
  authenticate,
  requireRole('ADMIN'),
  cacheMiddleware({ prefix: 'users', ttl: 1800 }),
  userController.getTeachers
);

router.post('/teachers', authenticate, requireRole('ADMIN'), userController.createTeacher);
router.put('/teachers/:id', authenticate, requireRole('ADMIN'), userController.updateTeacher);
router.patch('/teachers/:id/visibility', authenticate, requireRole('ADMIN'), userController.toggleTeacherVisibility);

// User status management (ACTIVE / INACTIVE / SUSPENDED)
router.patch('/users/:id/status', authenticate, requireRole('ADMIN'), userController.updateUserStatus);

module.exports = router;
