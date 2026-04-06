/**
 * Redis client configuration
 * Used for caching, rate limiting, and BullMQ
 */
const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Create and return Redis client singleton
 */
const getRedisClient = () => {
  if (redisClient) return redisClient;

  const config = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null, // Required for BullMQ
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('Redis: Max retry attempts reached, running without cache');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  };

  if (env.REDIS_PASSWORD) {
    config.password = env.REDIS_PASSWORD;
  }

  redisClient = new Redis(config);

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error:', err.message);
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redisClient;
};

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  const client = getRedisClient();
  try {
    await client.connect();
    return client;
  } catch (error) {
    logger.warn('Redis connection failed, running without cache:', error.message);
    return null;
  }
};

/**
 * Cache helpers
 */
const cache = {
  /**
   * Get cached value
   */
  async get(key) {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set cache with expiry (seconds)
   */
  async set(key, value, ttl = 300) {
    try {
      const client = getRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
    } catch {
      // Silently fail - cache is not critical
    }
  },

  /**
   * Delete cache key(s)
   */
  async del(...keys) {
    try {
      const client = getRedisClient();
      await client.del(...keys);
    } catch {
      // Silently fail
    }
  },

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch {
      // Silently fail
    }
  },
};

module.exports = { getRedisClient, connectRedis, cache };
