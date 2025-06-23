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
 * Flexible and powerful rate limiting with multiple algorithms and storage adapters
 */

// Core exports
export { RateLimiter, createRateLimiter, slidingWindow, tokenBucket, fixedWindow } from './core/rate-limiter';

// Type exports
export type {
  RateLimitConfig,
  RateLimitInfo,
  RateLimitResult,
  RateLimitStore,
  RateLimitMiddleware,
  RateLimitHeaders,
  TokenBucketConfig,
  SlidingWindowConfig,
  FixedWindowConfig,
  RedisStoreConfig,
  MemoryStoreConfig,
  DatabaseStoreConfig,
  KeyGenerator,
  RateLimitHandler,
} from './core/types';

// Store exports
export { MemoryStore } from './adapters/memory-store';
export { RedisStore } from './adapters/redis-store';

// Utility exports
export * from './utils/key-generators';
export * from './utils/algorithms';