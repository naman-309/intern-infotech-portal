const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
};

const generateRefreshToken = (user) => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const hashedToken = hashToken(rawToken);
  const jwtRefreshToken = jwt.sign(
    {
      userId: user.id,
      tokenSeed: rawToken,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );

  return {
    refreshToken: jwtRefreshToken,
    rawToken,
    hashedToken,
  };
};

const generateVerificationToken = (payload) => {
  return jwt.sign(payload, config.jwt.verifySecret, { expiresIn: '24h' });
};

const generateResetToken = (payload) => {
  return jwt.sign(payload, config.jwt.resetSecret, { expiresIn: '1h' });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (err) {
    return null;
  }
};

const verifyEmailToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.verifySecret);
  } catch (err) {
    return null;
  }
};

const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.resetSecret);
  } catch (err) {
    return null;
  }
};

const getCookieOptions = (maxAgeMs) => {
  const isProd = config.isProduction;
  return {
    httpOnly: true,
    secure: isProd ? config.cookie.secure : false,
    sameSite: config.cookie.sameSite,
    domain: isProd && config.cookie.domain ? config.cookie.domain : undefined,
    path: '/',
    maxAge: maxAgeMs,
  };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access Token Cookie (15 mins)
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
  
  // Refresh Token Cookie (7 days)
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
  }
};

const clearAuthCookies = (res) => {
  const clearOpts = {
    httpOnly: true,
    secure: config.isProduction ? config.cookie.secure : false,
    sameSite: config.cookie.sameSite,
    domain: config.isProduction && config.cookie.domain ? config.cookie.domain : undefined,
    path: '/',
  };
  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);
};

module.exports = {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
  verifyResetToken,
  setAuthCookies,
  clearAuthCookies,
};
