const eligibleEmailService = require('./eligible-email.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Get eligible emails list
 */
const getEligibleEmails = async (req, res, next) => {
  try {
    const { search, isRegistered, page, limit } = req.query;
    const result = await eligibleEmailService.getEligibleEmails({
      search,
      isRegistered,
      page,
      limit,
    });

    return paginatedResponse(res, {
      data: result.records,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a single eligible student email
 */
const addEligibleEmail = async (req, res, next) => {
  try {
    const record = await eligibleEmailService.addEligibleEmail(req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Eligible student email record created successfully.',
      data: { record },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import eligible student emails
 */
const bulkImport = async (req, res, next) => {
  try {
    const { students } = req.body;
    const result = await eligibleEmailService.bulkImport(students, req.user, req);
    return successResponse(res, {
      message: `Bulk import completed: ${result.createdCount} added, ${result.skippedCount} skipped (already existed).`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete eligible student email record
 */
const deleteEligibleEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await eligibleEmailService.deleteEligibleEmail(id, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEligibleEmails,
  addEligibleEmail,
  bulkImport,
  deleteEligibleEmail,
};
