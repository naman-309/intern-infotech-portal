const express = require('express');
const eligibleEmailController = require('../controllers/eligibleEmailController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', eligibleEmailController.getEligibleEmails);
router.post('/', eligibleEmailController.addEligibleEmail);
router.post('/bulk', eligibleEmailController.bulkImport);
router.delete('/:id', eligibleEmailController.deleteEligibleEmail);

module.exports = router;
