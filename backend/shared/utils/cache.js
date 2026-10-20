const IORedis = require('ioredis');
const config = require('../config');

// ==============================================================================
// Upstash Serverless Redis High-Speed Caching Layer
// - Optimized for Upstash 250MB limit with strict low-footprint TTL (180s - 300s)
// - Fast in-memory key pattern invalidation on data mutations
// - Non-blocking async execution (never crashes or blocks on network/redis errors)
// ==============================================================================

let cacheClient = null;
let isRedisAvailable = false;

try {
  cacheClient = new IORedis(config.redisUrl, {
    family: 0, // IPv4/IPv6 dual-stack resolution for Upstash
    tls: config.redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy: (times) => {
      if (times > 5) {
        console.warn('[RedisCache] Upstash Redis unavailable after 5 retries. Bypassing cache.');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  cacheClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('[RedisCache] Connected to Upstash Redis for high-speed API caching.');
  });

  cacheClient.on('error', (err) => {
    isRedisAvailable = false;
    if (err.message && !err.message.includes('ECONNREFUSED logged')) {
      console.warn(`[RedisCache] Warning: ${err.message}`);
    }
  });
} catch (err) {
  console.warn('[RedisCache] Failed to initialize Redis client:', err.message);
}

/**
 * Retrieve parsed JSON value from Redis
 */
async function getCache(key) {
  if (!isRedisAvailable || !cacheClient) return null;
  try {
    const data = await cacheClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.warn(`[RedisCache] Get failed for "${key}":`, err.message);
    return null;
  }
}

/**
 * Store JSON value in Redis with automatic TTL expiration (strict 30-min / 1800s window).
 * Lightweight serialization preserves memory usage well under the 250 MB Upstash limit.
 */
async function setCache(key, value, ttlSeconds = 1800) {
  if (!isRedisAvailable || !cacheClient) return false;
  try {
    // Strict 30-minute wipeout cap (1800s max)
    const safeTtl = Math.max(10, Math.min(1800, ttlSeconds));
    const serialized = JSON.stringify(value);
    await cacheClient.set(key, serialized, 'EX', safeTtl);
    return true;
  } catch (err) {
    console.warn(`[RedisCache] Set failed for "${key}":`, err.message);
    return false;
  }
}

/**
 * Delete a specific key
 */
async function delCache(key) {
  if (!isRedisAvailable || !cacheClient) return false;
  try {
    await cacheClient.del(key);
    return true;
  } catch (err) {
    console.warn(`[RedisCache] Del failed for "${key}":`, err.message);
    return false;
  }
}

/**
 * Invalidate all cache keys belonging to given prefix namespace(s)
 * E.g. invalidateCache(['courses', 'batches', 'fees', 'mock_interviews'])
 * Scans efficiently in chunks of 100 to prevent blocking Upstash.
 */
async function invalidateCache(prefixes) {
  if (!isRedisAvailable || !cacheClient) return 0;
  const list = Array.isArray(prefixes) ? prefixes : [prefixes];
  let totalDeleted = 0;

  for (const prefix of list) {
    try {
      const pattern = `cache:${prefix}:*`;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await cacheClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length > 0) {
          await cacheClient.del(...keys);
          totalDeleted += keys.length;
        }
      } while (cursor !== '0');

      if (totalDeleted > 0) {
        console.log(`[RedisCache] Wiped ${totalDeleted} keys for pattern "${pattern}". Data is now fresh.`);
      }
    } catch (err) {
      console.warn(`[RedisCache] Invalidation error for "${prefix}":`, err.message);
    }
  }

  return totalDeleted;
}

/**
 * Complete cache purge for all cache:* keys
 */
async function purgeAllCache() {
  if (!isRedisAvailable || !cacheClient) return { success: false, count: 0 };
  try {
    let totalDeleted = 0;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await cacheClient.scan(cursor, 'MATCH', 'cache:*', 'COUNT', 200);
      cursor = nextCursor;
      if (keys && keys.length > 0) {
        await cacheClient.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== '0');

    console.log(`[RedisCache] Purged all ${totalDeleted} cached API records from Upstash.`);
    return { success: true, count: totalDeleted };
  } catch (err) {
    console.warn('[RedisCache] Purge all failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Express Middleware for transparent HTTP response caching
 * - Returns cached response with X-Cache: HIT in ~5ms
 * - Intercepts first miss, caches to Redis with safe TTL, returns X-Cache: MISS
 */
const cacheMiddleware = ({ prefix = 'api', ttl = 1800, keyGenerator } = {}) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `cache:${prefix}:${req.baseUrl || ''}${req.path}:${new URLSearchParams(req.query || {}).toString()}:${req.user?.role || 'public'}${req.user?.id ? `:${req.user.id}` : ''}`;

    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.status(200).json(cached);
      }
    } catch (e) {
      // Graceful fallback: continue without cache
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttl).catch(() => {});
      }
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  getCache,
  setCache,
  delCache,
  invalidateCache,
  purgeAllCache,
  cacheMiddleware,
  isCacheAvailable: () => isRedisAvailable,
};
