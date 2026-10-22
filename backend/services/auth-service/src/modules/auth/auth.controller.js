const authService = require('./auth.service');
const { setAuthCookies, clearAuthCookies, successResponse } = require('@portal/shared');

/**
 * User Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password, req });

    // Set HTTP-Only cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return successResponse(res, {
      message: 'Login successful',
      data: { user: result.user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Logout
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = await authService.logout({ refreshToken, user: req.user, req });

    clearAuthCookies(res);

    return successResponse(res, { message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = await authService.refresh({ refreshToken });

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return successResponse(res, {
      message: 'Token refreshed successfully',
      data: { user: result.user },
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

/**
 * Get Current Authenticated User Session
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user?.id);
    return successResponse(res, { data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Student Registration Request
 */
const requestStudentRegistration = async (req, res, next) => {
  try {
    const result = await authService.requestStudentRegistration(req.body, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Registration request submitted successfully. A verification link has been sent to your email.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Teacher Registration Request
 */
const requestTeacherRegistration = async (req, res, next) => {
  try {
    const result = await authService.requestTeacherRegistration(req.body, req);
    return successResponse(res, {
      statusCode: 201,
      message: 'Teacher application submitted. Please verify your email via the link sent to your inbox.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email Link Click
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await authService.verifyEmail(token, req);
    return successResponse(res, {
      message: 'Email successfully verified! Your registration request is now awaiting approval by academy administration.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email, req);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password with valid token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword, req);
    clearAuthCookies(res);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  refresh,
  getMe,
  requestStudentRegistration,
  requestTeacherRegistration,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
