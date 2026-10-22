const feeService = require('./fee.service');
const { successResponse, paginatedResponse } = require('@portal/shared');

/**
 * Student: Get Own Fee Records
 */
const getMyFees = async (req, res, next) => {
  try {
    const result = await feeService.getMyFees(req.user);
    return successResponse(res, { data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List All Student Fee Records
 */
const getAllFees = async (req, res, next) => {
  try {
    const { batchId, courseId, paymentStatus, search, page, limit } = req.query;
    const result = await feeService.getAllFees({
      batchId,
      courseId,
      paymentStatus,
      search,
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
 * Admin: Record Payment
 */
const recordPayment = async (req, res, next) => {
  try {
    const result = await feeService.recordPayment(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Payment recorded and student notified successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Fee Record
 */
const updateFeeRecord = async (req, res, next) => {
  try {
    const feeRecord = await feeService.updateFeeRecord(req.params.id, req.body, req.user, req);
    return successResponse(res, {
      message: 'Fee record and discount updated successfully',
      data: { feeRecord },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFees,
  getAllFees,
  recordPayment,
  updateFeeRecord,
};
