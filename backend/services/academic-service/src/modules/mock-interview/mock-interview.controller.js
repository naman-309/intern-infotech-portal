const mockInterviewService = require('./mock-interview.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Admin: List all Mock Interview sessions
 */
const getAll = async (req, res, next) => {
  try {
    const { courseId, search, page, limit } = req.query;
    const result = await mockInterviewService.getAll({ courseId, search, page, limit });

    return paginatedResponse(res, {
      data: result.interviews,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Load Session by Date & Course
 */
const getSession = async (req, res, next) => {
  try {
    const { courseId, date, id } = req.query;
    const result = await mockInterviewService.getSession({ courseId, date, id });
    return successResponse(res, { data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Submit & Publish / Update Mock Interview and Marks
 */
const saveSession = async (req, res, next) => {
  try {
    const result = await mockInterviewService.saveSession(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 200,
      message: 'Mock Interview marks submitted and published successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single mock interview by ID with results
 */
const getById = async (req, res, next) => {
  try {
    const interview = await mockInterviewService.getById(req.params.id);
    return successResponse(res, { data: { interview } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete mock interview
 */
const deleteInterview = async (req, res, next) => {
  try {
    const result = await mockInterviewService.deleteInterview(req.params.id, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Student: Month-by-month Progress Report of Mock Interview scores
 */
const getMyProgressReport = async (req, res, next) => {
  try {
    const result = await mockInterviewService.getMyProgressReport(req.user);
    return successResponse(res, { data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getSession,
  saveSession,
  getById,
  delete: deleteInterview,
  getMyProgressReport,
};
