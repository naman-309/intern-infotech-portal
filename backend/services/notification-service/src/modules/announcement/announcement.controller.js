const announcementService = require('./announcement.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Handle GET announcements
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const { priority, targetType, page, limit } = req.query;
    const result = await announcementService.getAnnouncements({
      priority,
      targetType,
      page,
      limit,
      user: req.user,
    });

    return paginatedResponse(res, {
      data: result.announcements,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle POST announcement
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Announcement published successfully',
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle PUT announcement
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      message: 'Announcement updated successfully',
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle DELETE announcement
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const result = await announcementService.deleteAnnouncement(req.params.id, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
