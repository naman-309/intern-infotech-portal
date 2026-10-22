const express = require('express');
const { z } = require('zod');
const successStoryController = require('./success-story.controller');
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

const storySchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  photoUrl: z.string().url().optional().or(z.literal('')),
  courseCompleted: z.string().min(2, 'Course completed is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  companyName: z.string().min(2, 'Company name is required'),
  companyLogoUrl: z.string().url().optional().or(z.literal('')),
  packageLPA: z.string().optional(),
  placementYear: z.number().int().min(2015).max(2035).default(new Date().getFullYear()),
  testimonial: z.string().min(10, 'Testimonial must be at least 10 characters'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

// Public (cached for 30 minutes)
router.get('/public', cacheMiddleware({ prefix: 'stories', ttl: 1800 }), successStoryController.getPublicStories);

// Admin (cached for 30 minutes)
router.get('/', authenticate, requireRole('ADMIN'), cacheMiddleware({ prefix: 'stories', ttl: 1800 }), successStoryController.getAllStories);
router.post('/', authenticate, requireRole('ADMIN'), validate(storySchema), successStoryController.createStory);
router.put('/:id', authenticate, requireRole('ADMIN'), validate(storySchema.partial()), successStoryController.updateStory);
router.delete('/:id', authenticate, requireRole('ADMIN'), successStoryController.deleteStory);

module.exports = router;
