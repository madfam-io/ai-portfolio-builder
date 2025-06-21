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
 * Redis-based Rate Limiter for Production Scalability
 * Replaces in-memory rate limiting with distributed Redis storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/cache/redis-client';
import { logger } from '@/lib/utils/logger';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string; // Custom error message
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.',
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  },
  ai: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 AI requests per minute
    message: 'AI rate limit exceeded, please try again later.',
  },
  stripe: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 payment requests per minute
    message: 'Payment rate limit exceeded, please try again later.',
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 uploads per minute
    message: 'Upload rate limit exceeded, please try again later.',
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // Higher limit for admin operations
    message: 'Admin rate limit exceeded, please try again later.',
  },
} as const satisfies Record<string, RateLimitConfig>;

/**
 * Redis Rate Limiter Implementation
 */
class RedisRateLimiter {
  private fallbackStore = new Map<
    string,
    { count: number; resetTime: number }
  >();

  /**
   * Check rate limit using Redis or fallback to in-memory
   */
  checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (isRedisAvailable()) {
      return this.checkRedisRateLimit(key, config);
    } else {
      logger.warn('Redis unavailable, falling back to in-memory rate limiting');
      return this.checkMemoryRateLimit(key, config);
    }
  }

  /**
   * Redis-based rate limiting using sliding window
   */
  private async checkRedisRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const window = Math.floor(now / config.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    const resetTime = new Date((window + 1) * config.windowMs);

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();

      // Increment counter and set expiration
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, Math.ceil(config.windowMs / 1000));

      const results = await pipeline.exec();
      const current = (results?.[0]?.[1] as number) || 0;

      const remaining = Math.max(0, config.max - current);
      const success = current <= config.max;

      if (!success) {
        // Log rate limit violation
        logger.warn('Redis rate limit exceeded', {
          key,
          current,
          max: config.max,
          window,
        });
      }

      return {
        success,
        limit: config.max,
        current,
        remaining,
        resetTime,
        retryAfter: success
          ? undefined
          : Math.ceil((resetTime.getTime() - now) / 1000),
      };
    } catch (error) {
      logger.error('Redis rate limit error, falling back to memory', { error });
      return this.checkMemoryRateLimit(key, config);
    }
  }

  /**
   * In-memory fallback rate limiting
   */
  private checkMemoryRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const window = Math.floor(now / config.windowMs);
    const windowKey = `${key}:${window}`;
    const resetTime = new Date((window + 1) * config.windowMs);

    // Cleanup old entries (run occasionally)
    if (Math.random() < 0.01) {
      this.cleanupMemoryStore(now);
    }

    // Get or create rate limit data
    let rateLimitData = this.fallbackStore.get(windowKey);

    if (!rateLimitData) {
      rateLimitData = { count: 0, resetTime: resetTime.getTime() };
      this.fallbackStore.set(windowKey, rateLimitData);
    }

    // Increment counter
    rateLimitData.count++;

    const remaining = Math.max(0, config.max - rateLimitData.count);
    const success = rateLimitData.count <= config.max;

    if (!success) {
      logger.warn('Memory rate limit exceeded', {
        key: windowKey,
        current: rateLimitData.count,
        max: config.max,
      });
    }

    return Promise.resolve({
      success,
      limit: config.max,
      current: rateLimitData.count,
      remaining,
      resetTime,
      retryAfter: success
        ? undefined
        : Math.ceil((resetTime.getTime() - now) / 1000),
    });
  }

  /**
   * Cleanup expired entries from memory store
   */
  private cleanupMemoryStore(now: number): void {
    const maxSize = 10000; // Prevent unbounded growth

    // Clean up expired entries
    for (const [key, value] of this.fallbackStore.entries()) {
      if (value.resetTime < now) {
        this.fallbackStore.delete(key);
      }
    }

    // If still too large, remove oldest entries
    if (this.fallbackStore.size > maxSize) {
      const entries = Array.from(this.fallbackStore.entries()).sort(
        (a, b) => a[1].resetTime - b[1].resetTime
      );

      const toRemove = entries.slice(0, entries.length - maxSize);
      toRemove.forEach(([key]) => this.fallbackStore.delete(key));
    }
  }

  /**
   * Get client identifier from request
   */
  getClientId(request: NextRequest): string {
    // Try to get real IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    // Use the first available IP
    const ip =
      forwardedFor?.split(',')[0]?.trim() ||
      realIp ||
      cfConnectingIp ||
      'unknown';

    // Include the path in the key to have separate limits per endpoint
    const path = new URL(request.url).pathname;
    return `${ip}:${path}`;
  }

  /**
   * Get authenticated user ID for user-specific rate limiting
   */
  getUserId(request: NextRequest): string | null {
    // Extract user ID from JWT token or session
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        // In a real implementation, decode and verify the JWT
        // For now, return a placeholder
        return 'user_from_token';
      } catch (error) {
        logger.debug('Failed to extract user from token', { error });
      }
    }
    return null;
  }

  /**
   * Determine rate limit config based on path and user
   */
  getConfigForPath(
    path: string,
    isAuthenticated: boolean = false
  ): RateLimitConfig {
    // Admin routes get higher limits
    if (path.startsWith('/api/admin/')) {
      return RATE_LIMIT_CONFIGS.admin;
    }

    // Authentication routes
    if (path.startsWith('/api/auth/') || path.includes('/auth/')) {
      return RATE_LIMIT_CONFIGS.auth;
    }

    // AI routes
    if (
      path.startsWith('/api/ai/') ||
      path.includes('/enhance') ||
      path.includes('/optimize')
    ) {
      return RATE_LIMIT_CONFIGS.ai;
    }

    // Payment routes
    if (path.startsWith('/api/stripe/') || path.includes('/payment')) {
      return RATE_LIMIT_CONFIGS.stripe;
    }

    // Upload routes
    if (path.includes('/upload') || path.includes('/import')) {
      return RATE_LIMIT_CONFIGS.upload;
    }

    // General API routes
    if (path.startsWith('/api/')) {
      const config: RateLimitConfig = {
        windowMs: RATE_LIMIT_CONFIGS.api.windowMs,
        max: RATE_LIMIT_CONFIGS.api.max,
        message: RATE_LIMIT_CONFIGS.api.message,
      };

      // Authenticated users get higher limits
      if (isAuthenticated) {
        config.max = Math.floor(config.max * 1.5);
      }

      return config;
    }

    // No rate limiting for non-API routes
    return { windowMs: 0, max: Infinity };
  }
}

// Singleton instance
const rateLimiter = new RedisRateLimiter();

/**
 * Rate limiting middleware function
 */
export function withRateLimit<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  type: keyof typeof RATE_LIMIT_CONFIGS | RateLimitConfig = 'api',
  customLimit?: number
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    // Extract request from arguments (assuming first arg is NextRequest)
    const request = args[0] as NextRequest;

    if (!request || typeof request.url !== 'string') {
      // If we can't get the request, proceed without rate limiting
      return handler(...args);
    }

    try {
      const path = new URL(request.url).pathname;

      // Skip rate limiting for non-API routes
      if (!path.startsWith('/api/')) {
        return handler(...args);
      }

      // Get configuration
      const config =
        typeof type === 'string'
          ? { ...RATE_LIMIT_CONFIGS[type] }
          : { ...type };

      // Apply custom limit if provided
      if (customLimit !== undefined) {
        config.max = customLimit;
      }

      // Skip if no rate limiting for this config
      if (config.max === Infinity) {
        return handler(...args);
      }

      // Generate rate limit key
      const clientId = rateLimiter.getClientId(request);
      const userId = rateLimiter.getUserId(request);
      const key = userId ? `user:${userId}` : `ip:${clientId}`;

      // Check rate limit
      const result = await rateLimiter.checkRateLimit(key, config);

      if (!result.success) {
        // Rate limit exceeded
        return NextResponse.json(
          {
            error: config.message || 'Too many requests',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toISOString(),
            },
          }
        );
      }

      // Execute handler
      const response = await handler(...args);

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        result.remaining.toString()
      );
      response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());

      return response;
    } catch (error) {
      logger.error('Rate limiting error, proceeding without limit', { error });
      return handler(...args);
    }
  };
}

/**
 * Edge middleware compatible rate limiter
 */
export async function redisRateLimitMiddleware(
  request: NextRequest,
  customConfig?: Partial<RateLimitConfig>
): Promise<NextResponse | null> {
  try {
    const path = new URL(request.url).pathname;
    const userId = rateLimiter.getUserId(request);
    const baseConfig = rateLimiter.getConfigForPath(path, !!userId);
    const config = { ...baseConfig, ...customConfig };

    // Skip if no rate limiting for this path
    if (config.max === Infinity) {
      return null;
    }

    // Generate rate limit key
    const clientId = rateLimiter.getClientId(request);
    const key = userId ? `user:${userId}` : `ip:${clientId}`;

    // Check rate limit
    const result = await rateLimiter.checkRateLimit(key, config);

    if (!result.success) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toISOString(),
          },
        }
      );
    }

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());

    return null; // Continue to next middleware
  } catch (error) {
    logger.error('Redis rate limit middleware error', { error });
    return null; // Continue without rate limiting on error
  }
}

export { rateLimiter };
