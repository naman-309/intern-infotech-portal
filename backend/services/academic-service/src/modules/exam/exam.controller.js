const examService = require('./exam.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * List Offline Examinations
 */
const getExams = async (req, res, next) => {
  try {
    const { batchId, courseId, status, page, limit } = req.query;
    const result = await examService.getExams({
      batchId,
      courseId,
      status,
      page,
      limit,
      user: req.user,
    });

    return paginatedResponse(res, {
      data: result.exams,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Exam Details with Results
 */
const getExamById = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id, req.user);
    return successResponse(res, { data: { exam } });
  } catch (error) {
    next(error);
  }
};

/**
 * Teacher / Admin: Create Offline Examination Record
 */
const createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Offline exam record created successfully. Marks can now be entered.',
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Teacher / Admin: Publish Offline Exam Results
 */
const publishExam = async (req, res, next) => {
  try {
    const result = await examService.publishExam(req.params.id, req.user, req);
    return successResponse(res, {
      message: `Offline exam results published successfully. Notifications dispatched to ${result.studentCount} students.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Unpublish Exam Results
 */
const unpublishExam = async (req, res, next) => {
  try {
    const result = await examService.unpublishExam(req.params.id, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  publishExam,
  unpublishExam,
};
