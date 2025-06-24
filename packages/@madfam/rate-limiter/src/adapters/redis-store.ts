/**
 * MIT License
 *
 * Copyright (c) 2025 MADFAM LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/rate-limiter
 *
 * Redis-based rate limit store
 */

import type {
  RateLimitStore,
  RateLimitInfo,
  RedisStoreConfig,
} from '../core/types';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode?: string,
    duration?: number
  ): Promise<string | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  del(key: string): Promise<number>;
  pipeline(): RedisClient;
  zadd(key: string, ...args: (string | number)[]): Promise<number>;
  zremrangebyscore(
    key: string,
    min: string | number,
    max: string | number
  ): Promise<number>;
  zcard(key: string): Promise<number>;
  exec(): Promise<unknown[]>;
}

export class RedisStore implements RateLimitStore {
  private redis: RedisClient;
  private prefix: string;
  private ttl: number;

  constructor(config: RedisStoreConfig) {
    this.prefix = config.prefix || 'rate_limit:';
    this.ttl = config.ttl || 3600; // 1 hour default

    // Import Redis dynamically to make it optional
    try {
      const Redis = require('ioredis');
      this.redis =
        typeof config.redis === 'string'
          ? new Redis(config.redis)
          : new Redis(config.redis);
    } catch (_error) {
      throw new Error(
        'ioredis is required for RedisStore. Install it with: npm install ioredis'
      );
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitInfo> {
    const redisKey = this.prefix + key;
    const now = Date.now();
    const windowStart = now - windowMs;
    const resetTime = now + windowMs;

    // Use a Lua script for atomic operations
    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local windowStart = tonumber(ARGV[2])
      local resetTime = tonumber(ARGV[3])
      local ttl = tonumber(ARGV[4])

      -- Remove expired entries from sorted set
      redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
      
      -- Add current timestamp
      redis.call('ZADD', key, now, now)
      
      -- Get current count
      local count = redis.call('ZCARD', key)
      
      -- Set expiration
      redis.call('EXPIRE', key, ttl)
      
      -- Get total hits (approximate)
      local totalHits = redis.call('GET', key .. ':total') or 0
      totalHits = totalHits + 1
      redis.call('SET', key .. ':total', totalHits, 'EX', ttl)
      
      return {count, resetTime, totalHits}
    `;

    const result = await this.redis.eval(
      luaScript,
      1,
      redisKey,
      now,
      windowStart,
      resetTime,
      Math.ceil(windowMs / 1000)
    );

    const [count, calcResetTime, totalHits] = result;

    return {
      limit: 0, // Will be set by RateLimiter
      used: parseInt(count, 10),
      remaining: 0, // Will be calculated by RateLimiter
      resetTime: parseInt(calcResetTime, 10),
      totalHits: parseInt(totalHits, 10),
    };
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const redisKey = this.prefix + key;

    const [count, totalHits] = await Promise.all([
      this.redis.zcard(redisKey),
      this.redis.get(redisKey + ':total'),
    ]);

    if (count === 0) {
      return null;
    }

    // Get the oldest timestamp to calculate reset time
    const oldestTimestamp = await this.redis.zrange(
      redisKey,
      0,
      0,
      'WITHSCORES'
    );
    const resetTime =
      oldestTimestamp.length > 0
        ? parseInt(oldestTimestamp[1], 10) + this.ttl * 1000
        : Date.now() + this.ttl * 1000;

    return {
      limit: 0, // Will be set by RateLimiter
      used: count,
      remaining: 0, // Will be calculated by RateLimiter
      resetTime,
      totalHits: parseInt(totalHits || '0', 10),
    };
  }

  async reset(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    await Promise.all([
      this.redis.del(redisKey),
      this.redis.del(redisKey + ':total'),
    ]);
  }

  async cleanup(): Promise<void> {
    // Redis automatically handles expiration, but we can clean up manually if needed
    const keys = await this.redis.keys(this.prefix + '*');

    if (keys.length === 0) {
      return;
    }

    // Check each key and remove if expired
    const now = Date.now();
    const pipeline = this.redis.pipeline();

    for (const key of keys) {
      if (key.endsWith(':total')) {
        continue;
      }

      // Remove entries older than TTL
      const windowStart = now - this.ttl * 1000;
      pipeline.zremrangebyscore(key, 0, windowStart);
    }

    await pipeline.exec();
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient() {
    return this.redis;
  }

  /**
   * Get store statistics
   */
  async getStats() {
    const keys = await this.redis.keys(this.prefix + '*');
    const totalKeys = keys.filter(key => !key.endsWith(':total')).length;

    return {
      keys: totalKeys,
      totalKeys: keys.length,
      memoryUsage: await this.redis.memory('usage').catch(() => null),
    };
  }

  /**
   * Fixed window implementation using Redis
   */
  async incrementFixed(key: string, windowMs: number): Promise<RateLimitInfo> {
    const redisKey = this.prefix + key;
    const now = Date.now();
    const windowId = Math.floor(now / windowMs);
    const windowKey = `${redisKey}:${windowId}`;
    const resetTime = (windowId + 1) * windowMs;

    const luaScript = `
      local key = KEYS[1]
      local resetTime = tonumber(ARGV[1])
      local ttl = tonumber(ARGV[2])
      
      local count = redis.call('INCR', key)
      redis.call('EXPIRE', key, ttl)
      
      -- Track total hits
      local totalKey = KEYS[2]
      local totalHits = redis.call('INCR', totalKey)
      redis.call('EXPIRE', totalKey, ttl * 2)
      
      return {count, resetTime, totalHits}
    `;

    const result = await this.redis.eval(
      luaScript,
      2,
      windowKey,
      redisKey + ':total',
      resetTime,
      Math.ceil(windowMs / 1000)
    );

    const [count, calcResetTime, totalHits] = result;

    return {
      limit: 0,
      used: parseInt(count, 10),
      remaining: 0,
      resetTime: parseInt(calcResetTime, 10),
      totalHits: parseInt(totalHits, 10),
    };
  }

  /**
   * Token bucket implementation using Redis
   */
  async incrementTokenBucket(
    key: string,
    capacity: number,
    refillRate: number,
    tokensRequested = 1
  ): Promise<RateLimitInfo> {
    const redisKey = this.prefix + key;
    const now = Date.now();

    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local tokensRequested = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      local ttl = tonumber(ARGV[5])
      
      -- Get current bucket state
      local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill', 'totalHits')
      local tokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now
      local totalHits = tonumber(bucket[3]) or 0
      
      -- Calculate tokens to add based on time elapsed
      local elapsed = (now - lastRefill) / 1000 -- Convert to seconds
      local tokensToAdd = math.floor(elapsed * refillRate)
      tokens = math.min(capacity, tokens + tokensToAdd)
      
      local allowed = tokens >= tokensRequested
      if allowed then
        tokens = tokens - tokensRequested
        totalHits = totalHits + 1
      end
      
      -- Update bucket state
      redis.call('HMSET', key, 
        'tokens', tokens,
        'lastRefill', now,
        'totalHits', totalHits
      )
      redis.call('EXPIRE', key, ttl)
      
      local used = capacity - tokens
      local resetTime = now + ((capacity - tokens) / refillRate) * 1000
      
      return {allowed and 1 or 0, used, resetTime, totalHits}
    `;

    const result = await this.redis.eval(
      luaScript,
      1,
      redisKey,
      capacity,
      refillRate,
      tokensRequested,
      now,
      this.ttl
    );

    const [_allowed, used, resetTime, totalHits] = result;

    return {
      limit: capacity,
      used: parseInt(used, 10),
      remaining: capacity - parseInt(used, 10),
      resetTime: parseInt(resetTime, 10),
      totalHits: parseInt(totalHits, 10),
    };
  }
}
