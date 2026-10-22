const express = require('express');
const auditLogController = require('./audit-log.controller');
const { authenticate, requireRole, cacheMiddleware } = require('@portal/shared');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', cacheMiddleware({ prefix: 'audit_logs', ttl: 1200 }), auditLogController.getAuditLogs);

module.exports = router;
