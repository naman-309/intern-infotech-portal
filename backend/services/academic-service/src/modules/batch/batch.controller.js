const batchService = require('./batch.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * List Batches
 */
const getBatches = async (req, res, next) => {
  try {
    const { courseId, status, search, page, limit } = req.query;
    const result = await batchService.getBatches({
      courseId,
      status,
      search,
      page,
      limit,
      user: req.user,
    });

    return paginatedResponse(res, {
      data: result.batches,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Batch Details with Roster
 */
const getBatchById = async (req, res, next) => {
  try {
    const batch = await batchService.getBatchById(req.params.id, req.user);
    return successResponse(res, { data: { batch } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create Batch
 */
const createBatch = async (req, res, next) => {
  try {
    const batch = await batchService.createBatch(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Batch created successfully',
      data: { batch },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Batch
 */
const updateBatch = async (req, res, next) => {
  try {
    const batch = await batchService.updateBatch(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      message: 'Batch updated successfully',
      data: { batch },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Assign Teacher to Batch
 */
const assignTeacher = async (req, res, next) => {
  try {
    const assignment = await batchService.assignTeacher(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      message: 'Teacher assigned to batch successfully',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Remove Teacher from Batch
 */
const removeTeacherAssignment = async (req, res, next) => {
  try {
    const result = await batchService.removeTeacherAssignment(req.params.id, req.params.teacherId, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Enroll Student into Batch
 */
const enrollStudent = async (req, res, next) => {
  try {
    const result = await batchService.enrollStudent(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Student enrolled in course successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  assignTeacher,
  removeTeacherAssignment,
  enrollStudent,
};
