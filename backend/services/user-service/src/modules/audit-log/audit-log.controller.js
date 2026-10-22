const auditLogService = require('./audit-log.service');
const { paginatedResponse } = require('@portal/shared');

/**
 * Handle GET audit logs request
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity, page, limit } = req.query;
    const result = await auditLogService.getAuditLogs({
      action,
      entity,
      page,
      limit,
    });

    return paginatedResponse(res, {
      data: result.logs,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
