const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const multer = require('multer');

const router = express.Router();

// Memory storage for direct Cloudinary upload (5MB limit)
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

// Self Profile (handles both JSON and multipart/form-data with passport photo)
router.put(['/profile', '/users/profile'], authenticate, upload.single('avatar'), userController.updateProfile);
router.post(['/change-password', '/users/change-password'], authenticate, userController.changePassword);

// Students (cached for 30 minutes in Redis with automatic invalidation on updates)
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
// Admin student editing & journey status management
router.put('/students/:id', authenticate, requireRole('ADMIN'), userController.updateStudentByAdmin);
router.patch('/students/:id/journey-status', authenticate, requireRole('ADMIN'), userController.updateStudentJourneyStatus);


// Teachers (cached for 30 minutes in Redis with automatic invalidation)
router.get(
  '/teachers',
  authenticate,
  requireRole('ADMIN'),
  cacheMiddleware({ prefix: 'users', ttl: 1800 }),
  userController.getTeachers
);

// User status lifecycle (Active / Inactive / Suspended)
router.patch('/users/:id/status', authenticate, requireRole('ADMIN'), userController.updateUserStatus);

module.exports = router;
