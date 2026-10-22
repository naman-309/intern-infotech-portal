const resultService = require('./result.service');
const { successResponse } = require('@portal/shared');

/**
 * Teacher / Admin: Enter or Edit Marks
 */
const recordMarks = async (req, res, next) => {
  try {
    const result = await resultService.recordMarks(req.body, req.user, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Student: Get Own Published Examination Results
 */
const getMyResults = async (req, res, next) => {
  try {
    const result = await resultService.getMyResults(req.user);
    return successResponse(res, { data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordMarks,
  getMyResults,
};
