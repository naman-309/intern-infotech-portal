const registrationService = require('./registration.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Get registration requests list
 */
const getRequests = async (req, res, next) => {
  try {
    const { role, status, search, page, limit } = req.query;
    const result = await registrationService.getRequests({
      role,
      status,
      search,
      page,
      limit,
      user: req.user,
    });

    return paginatedResponse(res, {
      data: result.requests,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review registration request (APPROVE / REJECT)
 */
const reviewRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewNote, assignedBatchId, assignedCourseId } = req.body;
    const result = await registrationService.reviewRequest({
      id,
      action,
      reviewNote,
      assignedBatchId,
      assignedCourseId,
      user: req.user,
      req,
    });

    return successResponse(res, {
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  reviewRequest,
};
