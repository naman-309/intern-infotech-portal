const express = require('express');
const publicCmsController = require('../controllers/publicCmsController');
const { authenticate, requireRole } = require('@portal/shared');

const router = express.Router();

router.get('/overview', publicCmsController.getInstituteOverview);
router.get('/upload-signature', authenticate, requireRole('ADMIN', 'TEACHER'), publicCmsController.getUploadSignature);

module.exports = router;
