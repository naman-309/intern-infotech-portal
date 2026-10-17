const { ZodError } = require('zod');
const { errorResponse } = require('../utils/response');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  // Safe logging in server console
  console.error(`[Error] [${req.method} ${req.originalUrl || req.url}]`, err.message);
  if (!config.isProduction && err.stack) {
    console.error(err.stack);
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, {
      statusCode: 400,
      message: 'Validation failed. Please correct the highlighted fields.',
      errors: formattedErrors,
    });
  }

  // 2. Prisma Known Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        const fields = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
        return errorResponse(res, {
          statusCode: 409,
          message: `A record with this ${fields} already exists in the system.`,
        });
      }
      case 'P2025':
        return errorResponse(res, {
          statusCode: 404,
          message: 'The requested resource was not found.',
        });
      case 'P2003':
        return errorResponse(res, {
          statusCode: 400,
          message: 'Foreign key constraint failed. Related record does not exist.',
        });
      default:
        break;
    }
  }

  // 3. JSON body parsing error
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Invalid JSON payload received.',
    });
  }

  // 4. Default Fallback Error
  const statusCode = err.statusCode || 500;
  const message = config.isProduction && statusCode === 500
    ? 'An unexpected error occurred. Please contact the administrator.'
    : err.message || 'Internal server error';

  return errorResponse(res, { statusCode, message });
};

module.exports = errorHandler;
