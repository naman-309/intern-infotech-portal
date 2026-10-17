const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: 429,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: 429,
      message: 'Too many authentication attempts. Please try again after 15 minutes to protect account security.',
    });
  },
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: 429,
      message: 'Too many registration requests submitted. Please wait before submitting again.',
    });
  },
});

module.exports = {
  standardLimiter,
  authLimiter,
  registrationLimiter,
};
