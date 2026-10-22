const successStoryService = require('./success-story.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Public: List Published Stories
 */
const getPublicStories = async (req, res, next) => {
  try {
    const { featured } = req.query;
    const stories = await successStoryService.getPublicStories({ featured });
    return successResponse(res, { data: { stories } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List All Stories
 */
const getAllStories = async (req, res, next) => {
  try {
    const { search, published, page, limit } = req.query;
    const result = await successStoryService.getAllStories({ search, published, page, limit });

    return paginatedResponse(res, {
      data: result.stories,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create Story
 */
const createStory = async (req, res, next) => {
  try {
    const story = await successStoryService.createStory(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Student success story created successfully',
      data: { story },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Story
 */
const updateStory = async (req, res, next) => {
  try {
    const story = await successStoryService.updateStory(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      message: 'Success story updated successfully',
      data: { story },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete Story
 */
const deleteStory = async (req, res, next) => {
  try {
    const result = await successStoryService.deleteStory(req.params.id, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStories,
  getAllStories,
  createStory,
  updateStory,
  deleteStory,
};
