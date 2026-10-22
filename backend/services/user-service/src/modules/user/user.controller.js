const userService = require('./user.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Update Self Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile({
      userId: req.user.id,
      role: req.user.role,
      data: req.body,
      file: req.file,
      req,
    });

    return successResponse(res, {
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Account Password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
      req,
    });

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * List Students (Admin & Teacher)
 */
const getStudents = async (req, res, next) => {
  try {
    const { batchId, journeyStatus, status, search, page, limit } = req.query;
    const result = await userService.getStudents({
      batchId,
      journeyStatus,
      status,
      search,
      page,
      limit,
    });

    return paginatedResponse(res, {
      data: result.students,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student By ID (Student 360 View)
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await userService.getStudentById(req.params.id);
    return successResponse(res, { data: { student } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Student Details
 */
const updateStudentByAdmin = async (req, res, next) => {
  try {
    const result = await userService.updateStudentByAdmin(req.params.id, req.body, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Student Journey Status
 */
const updateStudentJourneyStatus = async (req, res, next) => {
  try {
    const result = await userService.updateStudentJourneyStatus(req.params.id, req.body, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * List Teachers (Admin)
 */
const getTeachers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await userService.getTeachers({ search, page, limit });

    return paginatedResponse(res, {
      data: result.teachers,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get active teachers directory
 */
const getPublicTeachers = async (req, res, next) => {
  try {
    const teachers = await userService.getPublicTeachers();
    return successResponse(res, { data: { teachers } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create Teacher Faculty Account
 */
const createTeacher = async (req, res, next) => {
  try {
    const teacher = await userService.createTeacher(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Teacher account created successfully.',
      data: { teacher },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Teacher Details
 */
const updateTeacher = async (req, res, next) => {
  try {
    const result = await userService.updateTeacher(req.params.id, req.body, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Toggle Teacher Public Visibility
 */
const toggleTeacherVisibility = async (req, res, next) => {
  try {
    const { showOnWebsite } = req.body;
    const result = await userService.toggleTeacherVisibility(req.params.id, showOnWebsite, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update User Status (ACTIVE / INACTIVE / SUSPENDED)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await userService.updateUserStatus(req.params.id, status, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword,
  getStudents,
  getStudentById,
  updateStudentByAdmin,
  updateStudentJourneyStatus,
  getTeachers,
  getPublicTeachers,
  createTeacher,
  updateTeacher,
  toggleTeacherVisibility,
  updateUserStatus,
};
