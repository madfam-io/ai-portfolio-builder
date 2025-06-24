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
 * Main rate limiter implementation
 */

import { MemoryStore } from '../adapters/memory-store';
import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitInfo,
  RateLimitStore,
  Request,
  Response,
} from './types';

export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig) {
    this.config = {
      max: config.max,
      windowMs: config.windowMs,
      algorithm: config.algorithm || 'sliding-window',
      store: config.store || new MemoryStore(),
      keyGenerator: config.keyGenerator || ((id: string) => id),
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      message: config.message || 'Too many requests',
      standardHeaders: config.standardHeaders !== false,
      legacyHeaders: config.legacyHeaders || false,
      handler: config.handler || this.defaultHandler,
      onLimitReached: config.onLimitReached,
    };

    this.store = this.config.store;
  }

  /**
   * Check if a request should be allowed
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(identifier);

    try {
      const limitInfo = await this.store.increment(key, this.config.windowMs);
      const allowed = limitInfo.used <= this.config.max;

      let retryAfter: number | undefined;
      if (!allowed) {
        retryAfter = Math.ceil((limitInfo.resetTime - Date.now()) / 1000);
      }

      return {
        allowed,
        limit: {
          ...limitInfo,
          limit: this.config.max,
          remaining: Math.max(0, this.config.max - limitInfo.used),
        },
        retryAfter,
      };
    } catch (error) {
      // If store fails, allow the request to prevent cascading failures
      console.error('Rate limiter store error:', error);
      return {
        allowed: true,
        limit: {
          limit: this.config.max,
          used: 0,
          remaining: this.config.max,
          resetTime: Date.now() + this.config.windowMs,
          totalHits: 0,
        },
      };
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = this.config.keyGenerator(identifier);
    await this.store.reset(key);
  }

  /**
   * Get current rate limit status for an identifier
   */
  async getStatus(identifier: string): Promise<RateLimitInfo | null> {
    const key = this.config.keyGenerator(identifier);
    const info = await this.store.get(key);

    if (!info) {
      return null;
    }

    return {
      ...info,
      limit: this.config.max,
      remaining: Math.max(0, this.config.max - info.used),
    };
  }

  /**
   * Create Express middleware
   */
  middleware() {
    return async (req: Request, res: Response, next: () => void) => {
      const identifier = this.getIdentifier(req);
      const result = await this.checkLimit(identifier);

      // Add headers
      this.addHeaders(res, result.limit, result.retryAfter);

      if (!result.allowed) {
        // Call onLimitReached callback
        if (this.config.onLimitReached) {
          this.config.onLimitReached(req, result.limit);
        }

        // Handle rate limit exceeded
        return this.config.handler(req, res, result.limit);
      }

      next();
    };
  }

  /**
   * Create async function wrapper
   */
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    getIdentifier: (...args: Parameters<T>) => string
  ) {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const identifier = getIdentifier(...args);
      const result = await this.checkLimit(identifier);

      if (!result.allowed) {
        const error = new Error(
          typeof this.config.message === 'string'
            ? this.config.message
            : this.config.message(result.limit)
        );
        (
          error as Error & {
            rateLimitInfo?: RateLimitInfo;
            retryAfter?: number;
          }
        ).rateLimitInfo = result.limit;
        (
          error as Error & {
            rateLimitInfo?: RateLimitInfo;
            retryAfter?: number;
          }
        ).retryAfter = result.retryAfter;
        throw error;
      }

      return fn(...args);
    };
  }

  /**
   * Close the rate limiter and cleanup resources
   */
  async close(): Promise<void> {
    if (this.store.close) {
      await this.store.close();
    }
  }

  /**
   * Extract identifier from request
   */
  private getIdentifier(req: Request): string {
    // Try common identifier sources
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.user?.id ||
      'anonymous'
    );
  }

  /**
   * Add rate limit headers to response
   */
  private addHeaders(
    res: Response,
    limit: RateLimitInfo,
    retryAfter?: number
  ): void {
    if (this.config.standardHeaders) {
      res.setHeader('RateLimit-Limit', limit.limit.toString());
      res.setHeader('RateLimit-Remaining', limit.remaining.toString());
      res.setHeader('RateLimit-Reset', new Date(limit.resetTime).toISOString());
    }

    if (this.config.legacyHeaders) {
      res.setHeader('X-RateLimit-Limit', limit.limit.toString());
      res.setHeader('X-RateLimit-Remaining', limit.remaining.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(limit.resetTime / 1000).toString()
      );
      res.setHeader('X-RateLimit-Used', limit.used.toString());
    }

    if (retryAfter !== undefined) {
      res.setHeader('Retry-After', retryAfter.toString());
    }
  }

  /**
   * Default handler for rate limit exceeded
   */
  private defaultHandler = (
    req: Request,
    res: Response,
    limit: RateLimitInfo
  ): void => {
    const message =
      typeof this.config.message === 'string'
        ? this.config.message
        : this.config.message(limit);

    if (res.status) {
      // Express-like response
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      });
    } else {
      // Generic response
      res.statusCode = 429;
      res.end(
        JSON.stringify({
          error: 'Too Many Requests',
          message,
        })
      );
    }
  };
}

// Convenience factory functions
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

export function slidingWindow(
  config: Omit<RateLimitConfig, 'algorithm'>
): RateLimiter {
  return new RateLimiter({ ...config, algorithm: 'sliding-window' });
}

export function tokenBucket(
  config: Omit<RateLimitConfig, 'algorithm'>
): RateLimiter {
  return new RateLimiter({ ...config, algorithm: 'token-bucket' });
}

export function fixedWindow(
  config: Omit<RateLimitConfig, 'algorithm'>
): RateLimiter {
  return new RateLimiter({ ...config, algorithm: 'fixed-window' });
}
