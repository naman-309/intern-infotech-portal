const express = require('express');
const successStoryController = require('../controllers/successStoryController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

// Public (cached for 5 minutes)
router.get('/public', cacheMiddleware({ prefix: 'stories', ttl: 300 }), successStoryController.getPublicStories);

// Admin (cached for 3 minutes)
router.get('/', authenticate, requireRole('ADMIN'), cacheMiddleware({ prefix: 'stories', ttl: 180 }), successStoryController.getAllStories);
router.post('/', authenticate, requireRole('ADMIN'), successStoryController.createStory);
router.put('/:id', authenticate, requireRole('ADMIN'), successStoryController.updateStory);
router.delete('/:id', authenticate, requireRole('ADMIN'), successStoryController.deleteStory);

module.exports = router;
