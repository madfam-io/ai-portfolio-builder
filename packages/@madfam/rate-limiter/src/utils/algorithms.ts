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
 * Rate limiting algorithm implementations
 */

import type { RateLimitInfo } from '../core/types';

/**
 * Sliding window algorithm implementation
 */
export class SlidingWindowAlgorithm {
  private windows = new Map<string, number[]>();

  calculate(key: string, maxRequests: number, windowMs: number): RateLimitInfo {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create window for key
    let timestamps = this.windows.get(key) || [];
    
    // Remove old timestamps
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Add current timestamp
    timestamps.push(now);
    
    // Update window
    this.windows.set(key, timestamps);
    
    const used = timestamps.length;
    const remaining = Math.max(0, maxRequests - used);
    const resetTime = now + windowMs;
    
    return {
      limit: maxRequests,
      used,
      remaining,
      resetTime,
      totalHits: used, // Approximate
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.windows.entries()) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - 300000) { // 5 minutes
        this.windows.delete(key);
      }
    }
  }
}

/**
 * Token bucket algorithm implementation
 */
export class TokenBucketAlgorithm {
  private buckets = new Map<string, {
    tokens: number;
    lastRefill: number;
    totalRequests: number;
  }>();

  calculate(
    key: string,
    capacity: number,
    refillRate: number, // tokens per second
    tokensRequested = 1
  ): { allowed: boolean; info: RateLimitInfo } {
    const now = Date.now();
    
    // Get or create bucket
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: capacity,
        lastRefill: now,
        totalRequests: 0,
      };
      this.buckets.set(key, bucket);
    }

    // Calculate tokens to add based on elapsed time
    const elapsed = (now - bucket.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = elapsed * refillRate;
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request can be allowed
    const allowed = bucket.tokens >= tokensRequested;
    
    if (allowed) {
      bucket.tokens -= tokensRequested;
      bucket.totalRequests++;
    }

    const used = capacity - bucket.tokens;
    const remaining = Math.floor(bucket.tokens);
    
    // Calculate reset time (when bucket will be full again)
    const tokensNeeded = capacity - bucket.tokens;
    const timeToFull = tokensNeeded / refillRate * 1000; // Convert to ms
    const resetTime = now + timeToFull;

    return {
      allowed,
      info: {
        limit: capacity,
        used: Math.ceil(used),
        remaining,
        resetTime,
        totalHits: bucket.totalRequests,
      },
    };
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key);
      }
    }
  }
}

/**
 * Fixed window algorithm implementation
 */
export class FixedWindowAlgorithm {
  private windows = new Map<string, {
    count: number;
    windowStart: number;
    totalRequests: number;
  }>();

  calculate(key: string, maxRequests: number, windowMs: number): RateLimitInfo {
    const now = Date.now();
    const windowId = Math.floor(now / windowMs);
    const windowStart = windowId * windowMs;
    const windowEnd = windowStart + windowMs;
    
    // Get or create window
    let window = this.windows.get(key);
    
    // Check if we need a new window
    if (!window || window.windowStart !== windowStart) {
      window = {
        count: 0,
        windowStart,
        totalRequests: window?.totalRequests || 0,
      };
      this.windows.set(key, window);
    }

    // Increment count
    window.count++;
    window.totalRequests++;

    const used = window.count;
    const remaining = Math.max(0, maxRequests - used);
    const resetTime = windowEnd;

    return {
      limit: maxRequests,
      used,
      remaining,
      resetTime,
      totalHits: window.totalRequests,
    };
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    for (const [key, window] of this.windows.entries()) {
      if (now - window.windowStart > maxAge) {
        this.windows.delete(key);
      }
    }
  }
}

/**
 * Leaky bucket algorithm implementation
 */
export class LeakyBucketAlgorithm {
  private buckets = new Map<string, {
    size: number;
    lastLeak: number;
    totalRequests: number;
  }>();

  calculate(
    key: string,
    capacity: number,
    leakRate: number, // requests per second
    requestSize = 1
  ): { allowed: boolean; info: RateLimitInfo } {
    const now = Date.now();
    
    // Get or create bucket
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        size: 0,
        lastLeak: now,
        totalRequests: 0,
      };
      this.buckets.set(key, bucket);
    }

    // Calculate leak based on elapsed time
    const elapsed = (now - bucket.lastLeak) / 1000; // Convert to seconds
    const leaked = elapsed * leakRate;
    bucket.size = Math.max(0, bucket.size - leaked);
    bucket.lastLeak = now;

    // Check if request can be added
    const allowed = bucket.size + requestSize <= capacity;
    
    if (allowed) {
      bucket.size += requestSize;
      bucket.totalRequests++;
    }

    const used = Math.ceil(bucket.size);
    const remaining = Math.max(0, capacity - used);
    
    // Calculate reset time (when bucket will be empty)
    const timeToEmpty = bucket.size / leakRate * 1000; // Convert to ms
    const resetTime = now + timeToEmpty;

    return {
      allowed,
      info: {
        limit: capacity,
        used,
        remaining,
        resetTime,
        totalHits: bucket.totalRequests,
      },
    };
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastLeak > maxAge) {
        this.buckets.delete(key);
      }
    }
  }
}

/**
 * Hierarchical rate limiting (multiple tiers)
 */
export class HierarchicalRateLimiter {
  private tiers: Array<{
    algorithm: SlidingWindowAlgorithm | TokenBucketAlgorithm | FixedWindowAlgorithm;
    config: RateLimitConfig;
  }> = [];

  addTier(algorithm: SlidingWindowAlgorithm | TokenBucketAlgorithm | FixedWindowAlgorithm, config: RateLimitConfig): void {
    this.tiers.push({ algorithm, config });
  }

  calculate(key: string): { allowed: boolean; info: RateLimitInfo; tier?: number } {
    let mostRestrictive: RateLimitInfo | null = null;
    let blockedAtTier: number | undefined;

    for (let i = 0; i < this.tiers.length; i++) {
      const { algorithm, config } = this.tiers[i];
      
      let result: RateLimitInfo;
      
      if (algorithm instanceof TokenBucketAlgorithm) {
        const bucketResult = algorithm.calculate(
          `${key}:tier${i}`,
          config.capacity,
          config.refillRate
        );
        result = bucketResult.info;
        if (!bucketResult.allowed && blockedAtTier === undefined) {
          blockedAtTier = i;
        }
      } else {
        result = algorithm.calculate(
          `${key}:tier${i}`,
          config.maxRequests,
          config.windowMs
        );
        if (result.remaining === 0 && blockedAtTier === undefined) {
          blockedAtTier = i;
        }
      }

      if (!mostRestrictive || result.remaining < mostRestrictive.remaining) {
        mostRestrictive = result;
      }
    }

    const allowed = blockedAtTier === undefined;

    return {
      allowed,
      info: mostRestrictive || {
        limit: 0,
        used: 0,
        remaining: 0,
        resetTime: Date.now(),
        totalHits: 0,
      },
      tier: blockedAtTier,
    };
  }
}