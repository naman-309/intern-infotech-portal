const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../config');
const emailUtils = require('./email');

let redisClient = null;
let emailQueue = null;
let isRedisAvailable = false;

// Attempt Redis connection
try {
  redisClient = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('[Queue] Redis not available on local host. Falling back to direct asynchronous dispatch.');
        return null; // stop retrying
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Queue] Redis connected successfully for background jobs.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    // Suppress repeated connection error spam in dev
  });

  emailQueue = new Queue('email-queue', {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  });

  // Start BullMQ Worker
  const emailWorker = new Worker(
    'email-queue',
    async (job) => {
      const { type, payload } = job.data;
      switch (type) {
        case 'VERIFICATION':
          await emailUtils.sendVerificationEmail(payload);
          break;
        case 'APPROVAL':
          await emailUtils.sendApprovalEmail(payload);
          break;
        case 'REJECTION':
          await emailUtils.sendRejectionEmail(payload);
          break;
        case 'PASSWORD_RESET':
          await emailUtils.sendPasswordResetEmail(payload);
          break;
        case 'EXAM_RESULT':
          await emailUtils.sendExamResultsPublishedEmail(payload);
          break;
        default:
          console.warn(`[EmailWorker] Unknown job type: ${type}`);
      }
    },
    { connection: redisClient }
  );

  emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
  });
} catch (err) {
  console.warn('[Queue] Initializing queue failed, will use direct async fallback.');
}

/**
 * Queue or dispatch an email job
 */
const queueEmail = async (type, payload) => {
  if (isRedisAvailable && emailQueue) {
    try {
      await emailQueue.add(type, { type, payload });
      return;
    } catch (err) {
      console.warn('[Queue] Failed to add job to BullMQ, falling back to direct async:', err.message);
    }
  }

  // Graceful direct fallback if Redis is offline
  setImmediate(async () => {
    try {
      switch (type) {
        case 'VERIFICATION':
          await emailUtils.sendVerificationEmail(payload);
          break;
        case 'APPROVAL':
          await emailUtils.sendApprovalEmail(payload);
          break;
        case 'REJECTION':
          await emailUtils.sendRejectionEmail(payload);
          break;
        case 'PASSWORD_RESET':
          await emailUtils.sendPasswordResetEmail(payload);
          break;
        case 'EXAM_RESULT':
          await emailUtils.sendExamResultsPublishedEmail(payload);
          break;
        default:
          console.warn(`[DirectEmail] Unknown email type: ${type}`);
      }
    } catch (e) {
      console.error(`[DirectEmail] Failed to send ${type} email:`, e.message);
    }
  });
};

module.exports = {
  queueEmail,
  isRedisAvailable: () => isRedisAvailable,
};
