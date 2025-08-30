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

// Legacy Redis client - now using Vercel KV
// This is a stub for backward compatibility

import { kvCache } from './vercel-kv';

// Legacy Redis client wrapper
export class RedisClient {
  async get(key: string): Promise<string | null> {
    return await kvCache.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await kvCache.set(key, value, { ttl });
  }

  async delete(key: string): Promise<void> {
    await kvCache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return await kvCache.exists(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await kvCache.expire(key, seconds);
  }

  async incr(key: string): Promise<number> {
    return await kvCache.incr(key);
  }

  async decr(key: string): Promise<number> {
    return await kvCache.decr(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await kvCache.keys(pattern);
  }
}

// Export instance for backward compatibility
export const redisClient = new RedisClient();
export const redis = redisClient; // Common alias

// Redis availability check
export const isRedisAvailable = true; // Always true with Vercel KV

// Export default
export default redisClient;
