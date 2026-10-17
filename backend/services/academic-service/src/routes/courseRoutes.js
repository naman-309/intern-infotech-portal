const express = require('express');
const courseController = require('../controllers/courseController');
const { authenticate, requireRole, optionalAuth } = require('@portal/shared');

const router = express.Router();

// Public course endpoints
router.get('/public', courseController.getPublicCourses);
router.get('/public/:slug', courseController.getPublicCourseBySlug);

// Admin course management
router.get('/', authenticate, requireRole('ADMIN', 'TEACHER'), courseController.getAllCourses);
router.post('/', authenticate, requireRole('ADMIN'), courseController.createCourse);
router.put('/:id', authenticate, requireRole('ADMIN'), courseController.updateCourse);
router.delete('/:id/archive', authenticate, requireRole('ADMIN'), courseController.archiveCourse);

module.exports = router;
