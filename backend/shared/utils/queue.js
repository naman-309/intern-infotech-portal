const IORedis = require('ioredis');
const config = require('../config');
const emailUtils = require('./email');

// ==============================================================================
// Redis Pub/Sub Architecture — Publisher & Subscriber
// Cloud-first: Compatible with Upstash Serverless Redis (TLS + family:0)
// ==============================================================================

const EMAIL_CHANNEL = 'email_channel';

// --- Connection factory ---
// Each Pub/Sub role (publish vs. subscribe) needs its own dedicated connection.
// A subscribed client cannot issue regular Redis commands, hence the separation.

const createRedisClient = (label) => {
  const client = new IORedis(config.redisUrl, {
    family: 0,               // IPv4/IPv6 dual-stack DNS resolution (Upstash fix)
    tls: config.redisUrl.startsWith('rediss://')
      ? { rejectUnauthorized: false } // Allow Upstash self-signed TLS
      : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 5) {
        console.warn(`[${label}] Redis unavailable after ${times} retries. Giving up.`);
        return null; // Stop retrying
      }
      return Math.min(times * 200, 3000); // Exponential back-off, max 3 s
    },
  });

  client.on('connect', () => console.log(`[${label}] Connected to Redis.`));
  client.on('error', (err) => {
    // Only log once, suppress repetitive noise
    if (err.message && !err.message.includes('ECONNREFUSED logged')) {
      console.warn(`[${label}] Redis error: ${err.message}`);
    }
  });

  return client;
};

// ---------------------------------------------------------------------------
// Publisher client — used by all services to publish email jobs
// ---------------------------------------------------------------------------
let publisherClient = null;
let isRedisAvailable = false;

try {
  publisherClient = createRedisClient('EmailPublisher');

  publisherClient.on('connect', () => {
    isRedisAvailable = true;
  });

  publisherClient.on('error', () => {
    isRedisAvailable = false;
  });
} catch (err) {
  console.warn('[EmailPublisher] Failed to initialise Redis publisher:', err.message);
}

// ---------------------------------------------------------------------------
// Subscriber client — lives inside the Notification Service (or any service
// that initialises the subscriber via initEmailSubscriber()).
// ---------------------------------------------------------------------------

/**
 * Start listening to `email_channel` and dispatch emails accordingly.
 * Call this ONCE at application startup in the service that should process
 * emails (notification-service, or each service independently).
 */
const initEmailSubscriber = () => {
  let subscriberClient;

  try {
    subscriberClient = createRedisClient('EmailSubscriber');
  } catch (err) {
    console.warn('[EmailSubscriber] Failed to create subscriber client:', err.message);
    return;
  }

  subscriberClient.subscribe(EMAIL_CHANNEL, (err, count) => {
    if (err) {
      console.error('[EmailSubscriber] Failed to subscribe to channel:', err.message);
      return;
    }
    console.log(`[EmailSubscriber] Subscribed to "${EMAIL_CHANNEL}". Waiting for email jobs…`);
  });

  subscriberClient.on('message', async (channel, message) => {
    if (channel !== EMAIL_CHANNEL) return;

    let job;
    try {
      job = JSON.parse(message);
    } catch (parseErr) {
      console.error('[EmailSubscriber] Failed to parse message:', parseErr.message);
      return;
    }

    const { type, payload } = job;

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
        case 'FEE_PAYMENT':
          await emailUtils.sendFeePaymentEmail(payload);
          break;
        default:
          console.warn(`[EmailSubscriber] Unknown email type received: ${type}`);
      }
    } catch (emailErr) {
      console.error(`[EmailSubscriber] Failed to send "${type}" email:`, emailErr.message);
    }
  });

  subscriberClient.on('error', (err) => {
    console.warn('[EmailSubscriber] Subscriber connection error:', err.message);
  });
};

// ---------------------------------------------------------------------------
// queueEmail — Public API used by all microservices
//
// Publishes an email job to email_channel via Redis Pub/Sub.
// Falls back to a direct async dispatch if Redis is not available.
// ---------------------------------------------------------------------------

/**
 * Publish an email job to the Redis email_channel.
 *
 * @param {string} type    - Email type key: 'VERIFICATION' | 'APPROVAL' | 'REJECTION' | 'PASSWORD_RESET' | 'EXAM_RESULT' | 'FEE_PAYMENT'
 * @param {object} payload - Data required by the corresponding email template function.
 */
const queueEmail = async (type, payload) => {
  if (isRedisAvailable && publisherClient) {
    try {
      const message = JSON.stringify({ type, payload });
      await publisherClient.publish(EMAIL_CHANNEL, message);
      console.log(`[EmailPublisher] Published "${type}" job to "${EMAIL_CHANNEL}".`);
      return;
    } catch (pubErr) {
      console.warn(`[EmailPublisher] Publish failed, falling back to direct dispatch:`, pubErr.message);
    }
  }

  // Graceful direct fallback — fires asynchronously so it never blocks the HTTP response
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
        case 'FEE_PAYMENT':
          await emailUtils.sendFeePaymentEmail(payload);
          break;
        default:
          console.warn(`[DirectEmail] Unknown email type: ${type}`);
      }
    } catch (e) {
      console.error(`[DirectEmail] Failed to send "${type}" email:`, e.message);
    }
  });
};

module.exports = {
  queueEmail,
  initEmailSubscriber,
  isRedisAvailable: () => isRedisAvailable,
};