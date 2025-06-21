/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Redis client with fallback for development
 */

import Redis from 'ioredis';
import { logger } from '@/lib/utils/logger';

let redisInstance: Redis | null = null;
let isAvailable = false;

/**
 * Initialize Redis connection
 */
function initializeRedis(): Redis | null {
  if (redisInstance) return redisInstance;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('Redis URL not configured, using in-memory fallback');
    return null;
  }

  try {
    redisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: times => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redisInstance.on('connect', () => {
      isAvailable = true;
      logger.info('Redis connected successfully');
    });

    redisInstance.on('error', error => {
      isAvailable = false;
      logger.error('Redis connection error', { error });
    });

    return redisInstance;
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
  return isAvailable && redisInstance !== null;
}

/**
 * Get Redis client instance
 * Returns a mock client if Redis is not available
 */
export const redis = redisClient || {
  // Mock Redis client for development/fallback
  get: () => Promise.resolve(null),
  set: () => Promise.resolve('OK'),
  setex: () => Promise.resolve('OK'),
  del: () => Promise.resolve(1),
  exists: () => Promise.resolve(0),
  incr: () => Promise.resolve(1),
  expire: () => Promise.resolve(1),
  lpush: () => Promise.resolve(1),
  ltrim: () => Promise.resolve('OK'),
  lrange: () => Promise.resolve([]),
  sismember: () => Promise.resolve(0),
  sadd: () => Promise.resolve(1),
  pipeline: () => ({
    incr: () => {},
    expire: () => {},
    exec: () =>
      Promise.resolve([
        [null, 1],
        [null, 1],
      ]),
  }),
};

export default redis;
