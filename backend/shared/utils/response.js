/**
 * Standardized API Response Utilities
 */

const successResponse = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

const paginatedResponse = (res, { statusCode = 200, message = 'Success', data = [], total = 0, page = 1, limit = 10 } = {}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

const errorResponse = (res, { statusCode = 500, message = 'Internal server error', errors = null } = {}) => {
  const payload = {
    success: false,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
