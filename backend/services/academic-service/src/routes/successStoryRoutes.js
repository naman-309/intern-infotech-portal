const express = require('express');
const successStoryController = require('../controllers/successStoryController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

// Public
router.get('/public', successStoryController.getPublicStories);

// Admin
router.get('/', authenticate, requireRole('ADMIN'), successStoryController.getAllStories);
router.post('/', authenticate, requireRole('ADMIN'), successStoryController.createStory);
router.put('/:id', authenticate, requireRole('ADMIN'), successStoryController.updateStory);
router.delete('/:id', authenticate, requireRole('ADMIN'), successStoryController.deleteStory);

module.exports = router;
