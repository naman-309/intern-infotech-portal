const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const prisma = require('../prisma/client');

/**
 * Extract token from HTTP-only cookie or Authorization header
 */
const extractToken = (req) => {
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.substring(7);
  }
  return null;
};

/**
 * Authentication Middleware
 * Enforces valid JWT and active account status
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Verify user still exists in database and is ACTIVE
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'User account not found.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse(res, {
        statusCode: 403,
        message: `Your account is currently ${user.status.toLowerCase()}. Please contact administration.`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: 'Authentication error occurred.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles - e.g. 'ADMIN', 'TEACHER', 'STUDENT'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Unauthenticated access.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Forbidden. You do not have permission to perform this action.',
      });
    }

    next();
  };
};

/**
 * Optional Authentication
 * Decodes user if present without failing the request
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            studentProfile: true,
            teacherProfile: true,
          },
        });
        if (user && user.status === 'ACTIVE') {
          req.user = user;
        }
      }
    }
  } catch (e) {
    // ignore
  }
  next();
};

module.exports = {
  authenticate,
  authenticateUser: authenticate,
  requireRole,
  authorizeRoles: requireRole,
  optionalAuth,
};
