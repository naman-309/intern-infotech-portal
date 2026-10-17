require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/intern_infotech_db?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  ports: {
    gateway: parseInt(process.env.PORT_GATEWAY, 10) || 5000,
    auth: parseInt(process.env.PORT_AUTH_SERVICE, 10) || 5001,
    user: parseInt(process.env.PORT_USER_SERVICE, 10) || 5002,
    academic: parseInt(process.env.PORT_ACADEMIC_SERVICE, 10) || 5003,
    notification: parseInt(process.env.PORT_NOTIFICATION_SERVICE, 10) || 5004,
  },

  serviceUrls: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    academic: process.env.ACADEMIC_SERVICE_URL || 'http://localhost:5003',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5004',
  },

  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  publicApiUrl: process.env.PUBLIC_API_URL || 'http://localhost:5000/api/v1',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_needs_replacement_in_prod_min_32_chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_key_needs_replacement_in_prod_min_32_chars',
    verifySecret: process.env.JWT_VERIFY_SECRET || 'dev_jwt_verify_secret_key_needs_replacement_in_prod_min_32_chars',
    resetSecret: process.env.JWT_RESET_SECRET || 'dev_jwt_reset_secret_key_needs_replacement_in_prod_min_32_chars',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Intern Infotech Engineering Academy',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@infotech-academy.edu',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  bootstrap: {
    token: process.env.BOOTSTRAP_TOKEN || 'secure_bootstrap_key_12345',
  }
};

module.exports = config;
