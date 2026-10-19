const express = require('express');
const eligibleEmailController = require('../controllers/eligibleEmailController');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', cacheMiddleware({ prefix: 'eligible_emails', ttl: 1800 }), eligibleEmailController.getEligibleEmails);
router.post('/', eligibleEmailController.addEligibleEmail);
router.post('/bulk', eligibleEmailController.bulkImport);
router.delete('/:id', eligibleEmailController.deleteEligibleEmail);

module.exports = router;
