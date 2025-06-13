/**
 * Redis cache service for performance optimization
 * Provides caching layer for expensive operations
 */

import * as redis from 'redis';

import { logger } from '@/lib/utils/logger';

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

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.currentMemory -= item.size;
      this.cache.delete(key);
      return null;
    }

    return JSON.stringify(item.value);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || CACHE_CONFIG.defaultTTL) * 1000;
    const parsedValue = JSON.parse(value);
    const size = new TextEncoder().encode(value).length;

    // Check if we need to evict entries
    if (
      this.cache.size >= this.maxSize ||
      this.currentMemory + size > this.maxMemory
    ) {
      await this.evictOldestEntries();
    }

    // Remove old entry if exists
    const oldItem = this.cache.get(key);
    if (oldItem) {
      this.currentMemory -= oldItem.size;
    }

    this.cache.set(key, { value: parsedValue, expiry, size });
    this.currentMemory += size;
  }

  private async evictOldestEntries(): Promise<void> {
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
      const [key, item] = entries.shift()!;
      this.currentMemory -= item.size;
      this.cache.delete(key);
    }
  }

  async del(key: string): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      this.currentMemory -= item.size;
      this.cache.delete(key);
    }
  }

  async clear(): Promise<void> {
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
    if (this.connected || !process.env.REDIS_URL) {
      logger.info('Using in-memory cache (Redis URL not configured)');
      return;
    }

    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL,
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
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value =
        this.client && this.connected
          ? await this.client.get(key)
          : await this.fallback.get(key);

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
  async set<T = any>(
    key: string,
    value: T,
    ttl: number = CACHE_CONFIG.defaultTTL
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (this.client && this.connected) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.fallback.set(key, serialized, ttl);
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
        await this.fallback.del(key);
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
        await this.fallback.clear();
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
if (typeof window === 'undefined') {
  cache.connect().catch(err => {
    logger.error('Failed to initialize cache', err as Error);
  });
}

// Cleanup on process termination
if (typeof window === 'undefined') {
  process.on('SIGTERM', async () => {
    await cache.disconnect();
  });

  process.on('SIGINT', async () => {
    await cache.disconnect();
  });
}

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

    descriptor.value = async function (...args: any[]) {
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
