const prisma = require('../prisma/client');

/**
 * Sanitize metadata object removing all sensitive credential keys
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'smtp', 'tokenHash', 'cookie'];
  const sanitized = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Log a security or administrative action to the AuditLog table
 */
const logAudit = async ({
  userId = null,
  action,
  entity,
  entityId = null,
  details = null,
  req = null,
}) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
      userAgent = req.headers['user-agent'] || null;
      if (!userId && req.user) {
        userId = req.user.id;
      }
    }

    const sanitizedDetails = details ? sanitizeData(details) : null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details: sanitizedDetails,
        ipAddress: ipAddress ? String(ipAddress).substring(0, 45) : null,
        userAgent: userAgent ? String(userAgent).substring(0, 255) : null,
      },
    });
  } catch (err) {
    // We log but never crash an API request if audit write fails
    console.warn('[AuditLogger] Failed to write audit record:', err.message);
  }
};

module.exports = {
  logAudit,
  sanitizeData,
};
