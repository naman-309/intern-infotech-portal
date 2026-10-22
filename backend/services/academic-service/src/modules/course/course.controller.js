const courseService = require('./course.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Public: Get published courses
 */
const getPublicCourses = async (req, res, next) => {
  try {
    const { featured, search } = req.query;
    const courses = await courseService.getPublicCourses({ featured, search });
    return successResponse(res, { data: { courses } });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get course details by slug
 */
const getPublicCourseBySlug = async (req, res, next) => {
  try {
    const course = await courseService.getPublicCourseBySlug(req.params.slug);
    return successResponse(res, { data: { course } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all courses
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { search, published, isArchived, page, limit } = req.query;
    const result = await courseService.getAllCourses({ search, published, isArchived, page, limit });

    return paginatedResponse(res, {
      data: result.courses,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create Course
 */
const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Course created successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Course
 */
const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      message: 'Course updated successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Archive Course
 */
const archiveCourse = async (req, res, next) => {
  try {
    const course = await courseService.archiveCourse(req.params.id, req.user, req);
    return successResponse(res, {
      message: 'Course archived successfully. Historical records preserved.',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicCourses,
  getPublicCourseBySlug,
  getAllCourses,
  createCourse,
  updateCourse,
  archiveCourse,
};
