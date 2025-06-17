/**
 * Redis client with fallback for development
 */

import Redis from 'ioredis';
import { logger } from '@/lib/utils/logger';

let redis: Redis | null = null;
let isAvailable = false;

/**
 * Initialize Redis connection
 */
function initializeRedis(): Redis | null {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('Redis URL not configured, using in-memory fallback');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      isAvailable = true;
      logger.info('Redis connected successfully');
    });

    redis.on('error', error => {
      isAvailable = false;
      logger.error('Redis connection error', { error });
    });

    return redis;
  } catch (error) {
    logger.error('Failed to initialize Redis', { error });
    return null;
  }
}

// Initialize Redis
const redisClient = initializeRedis();

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return isAvailable && redis !== null;
}

/**
 * Get Redis client instance
 * Returns a mock client if Redis is not available
 */
export const redis = redisClient || {
  // Mock Redis client for development/fallback
  get: async () => null,
  set: async () => 'OK',
  setex: async () => 'OK',
  del: async () => 1,
  exists: async () => 0,
  incr: async () => 1,
  expire: async () => 1,
  lpush: async () => 1,
  ltrim: async () => 'OK',
  lrange: async () => [],
  sismember: async () => 0,
  sadd: async () => 1,
  pipeline: () => ({
    incr: () => {},
    expire: () => {},
    exec: async () => [
      [null, 1],
      [null, 1],
    ],
  }),
};

export default redis;
