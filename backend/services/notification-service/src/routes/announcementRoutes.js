const express = require('express');
const announcementController = require('../controllers/announcementController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

router.use(authenticate);

router.get('/', cacheMiddleware({ prefix: 'announcements', ttl: 1800 }), announcementController.getAnnouncements);
router.post('/', requireRole('ADMIN', 'TEACHER'), announcementController.createAnnouncement);
router.put('/:id', requireRole('ADMIN', 'TEACHER'), announcementController.updateAnnouncement);
router.delete('/:id', requireRole('ADMIN', 'TEACHER'), announcementController.deleteAnnouncement);

module.exports = router;
