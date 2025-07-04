/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import 'server-only';
import * as redis from 'redis';

import { env, services } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

/**
 * Server-side Redis cache service for performance optimization
 * This file should only be imported in server components and API routes
 */

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 300, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
};

// Key prefixes for different cache types
export const CACHE_KEYS = {
  PORTFOLIO: 'portfolio:',
  AI_RESULT: 'ai:',
  ANALYTICS: 'analytics:',
  GITHUB: 'github:',
  TEMPLATE: 'template:',
} as const;

// In-memory cache fallback for development
class InMemoryCache {
  private cache = new Map<
    string,
    { value: unknown; expiry: number; size: number }
  >();
  private maxSize = 100; // Maximum number of entries
  private maxMemory = 50 * 1024 * 1024; // 50MB maximum memory
  private currentMemory = 0;

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.currentMemory -= item.size;
      this.cache.delete(key);
      return null;
    }

    return JSON.stringify(item.value);
  }

  set(key: string, value: string, ttl?: number): void {
    const expiry = Date.now() + (ttl || CACHE_CONFIG.defaultTTL) * 1000;
    const parsedValue = JSON.parse(value);
    const size = new TextEncoder().encode(value).length;

    // Check if we need to evict entries
    if (
      this.cache.size >= this.maxSize ||
      this.currentMemory + size > this.maxMemory
    ) {
      this.evictOldestEntries();
    }

    // Remove old entry if exists
    const oldItem = this.cache.get(key);
    if (oldItem) {
      this.currentMemory -= oldItem.size;
    }

    this.cache.set(key, { value: parsedValue, expiry, size });
    this.currentMemory += size;
  }

  private evictOldestEntries(): void {
    // Sort entries by expiry time
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].expiry - b[1].expiry
    );

    // Remove oldest entries until we have enough space
    while (
      (this.cache.size >= this.maxSize ||
        this.currentMemory > this.maxMemory * 0.9) &&
      entries.length > 0
    ) {
      const entry = entries.shift();
      if (!entry) break;
      const [key, item] = entry;
      this.currentMemory -= item.size;
      this.cache.delete(key);
    }
  }

  del(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      this.currentMemory -= item.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentMemory = 0;
  }
}

/**
 * Redis cache service
 */
class CacheService {
  private client: redis.RedisClientType | null = null;
  private fallback: InMemoryCache = new InMemoryCache();
  private connected = false;

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.connected || !services.redis) {
      logger.info('Using in-memory cache (Redis service not configured)');
      return;
    }

    try {
      this.client = redis.createClient({
        url: env.REDIS_URL,
        socket: {
          reconnectStrategy: retries => {
            if (retries > CACHE_CONFIG.maxRetries) {
              logger.error('Redis reconnection failed after max retries');
              return false;
            }
            return CACHE_CONFIG.retryDelay;
          },
        },
      });

      this.client.on('error', err => {
        logger.error('Redis client error', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
        this.connected = true;
      });

      await this.client.connect();
    } catch (error: unknown) {
      logger.error('Failed to connect to Redis', error as Error);
      logger.info('Falling back to in-memory cache');
    }
  }

  /**
   * Get value from cache
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value =
        this.client && this.connected
          ? await this.client.get(key)
          : this.fallback.get(key);

      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error: unknown) {
      logger.error('Cache get error', error as Error, { key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = unknown>(
    key: string,
    value: T,
    ttl: number = CACHE_CONFIG.defaultTTL
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (this.client && this.connected) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        this.fallback.set(key, serialized, ttl);
      }
    } catch (error: unknown) {
      logger.error('Cache set error', error as Error, { key });
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      if (this.client && this.connected) {
        await this.client.del(key);
      } else {
        this.fallback.del(key);
      }
    } catch (error: unknown) {
      logger.error('Cache delete error', error as Error, { key });
    }
  }

  /**
   * Clear all cache with pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      if (this.client && this.connected) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        // For in-memory cache, clear all (pattern matching not supported)
        this.fallback.clear();
      }
    } catch (error: unknown) {
      logger.error('Cache clear pattern error', error as Error, { pattern });
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }
}

// Export singleton instance
export const cache = new CacheService();

// Initialize cache on module load
cache.connect().catch(err => {
  logger.error('Failed to initialize cache', err as Error);
});

// Cleanup on process termination
process.on('SIGTERM', async () => {
  await cache.disconnect();
});

process.on('SIGINT', async () => {
  await cache.disconnect();
});

/**
 * Cache decorator for methods
 */
export function Cacheable(keyPrefix: string, ttl?: number) {
  return function (
    _target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${keyPrefix}:${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        logger.debug('Cache hit', { key: cacheKey });
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      await cache.set(cacheKey, result, ttl);
      logger.debug('Cache set', { key: cacheKey });

      return result;
    };

    return descriptor;
  };
}
