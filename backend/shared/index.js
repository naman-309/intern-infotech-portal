const prisma = require('./prisma/client');
const config = require('./config');
const response = require('./utils/response');
const password = require('./utils/password');
const jwt = require('./utils/jwt');
const email = require('./utils/email');
const queue = require('./utils/queue'); // exports: queueEmail, initEmailSubscriber, isRedisAvailable
const cloudinary = require('./utils/cloudinary');
const auth = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const auditLogger = require('./middleware/auditLogger');

module.exports = {
  prisma,
  config,
  ...response,
  ...password,
  ...jwt,
  ...email,
  ...queue,
  ...cloudinary,
  ...auth,
  ...rateLimiter,
  errorHandler,
  ...auditLogger,
};
