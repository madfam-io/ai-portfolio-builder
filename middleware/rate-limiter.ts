import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

import { logger } from '@/lib/utils/logger';

/**
 * Redis-based Rate Limiter Middleware
 * Implements sliding window rate limiting with Redis
 */

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Auth endpoints - strict limits
  '/api/auth/signin': { windowMs: 15 * 60 * 1000, max: 5 },
  '/api/auth/signup': { windowMs: 60 * 60 * 1000, max: 3 },
  '/api/auth/reset-password': { windowMs: 60 * 60 * 1000, max: 3 },

  // AI endpoints - prevent abuse
  '/api/ai/enhance-bio': { windowMs: 60 * 1000, max: 10 },
  '/api/ai/optimize-project': { windowMs: 60 * 1000, max: 10 },
  '/api/ai/recommend-template': { windowMs: 60 * 1000, max: 10 },

  // Portfolio endpoints - reasonable limits
  '/api/portfolios': { windowMs: 60 * 1000, max: 30 },

  // Default for all other endpoints
  default: { windowMs: 60 * 1000, max: 60 },
};

class RedisRateLimiter {
  private client: ReturnType<typeof createClient> | null = null;
  private fallbackStore: Map<string, { count: number; resetAt: number }> =
    new Map();
  private isRedisAvailable = false;

  async initialize() {
    try {
      if (process.env.REDIS_URL) {
        this.client = createClient({
          url: process.env.REDIS_URL,
        });

        this.client.on('error', err => {
          logger.error('Redis client error', err);
          this.isRedisAvailable = false;
        });

        this.client.on('connect', () => {
          logger.info('Redis connected for rate limiting');
          this.isRedisAvailable = true;
        });

        await this.client.connect();
      } else {
        logger.warn('REDIS_URL not set, using in-memory rate limiting');
      }
    } catch (error) {
      logger.error('Failed to initialize Redis', error as Error);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Check rate limit for a given key
   */
  async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const resetAt = new Date(now + config.windowMs);

    if (this.isRedisAvailable && this.client) {
      try {
        // Use Redis sorted set for sliding window
        const multi = this.client.multi();

        // Remove old entries outside the window
        multi.zRemRangeByScore(key, '-inf', windowStart.toString());

        // Add current request
        multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

        // Count requests in window
        multi.zCard(key);

        // Set expiry
        multi.expire(key, Math.ceil(config.windowMs / 1000));

        const results = await multi.exec();
        const count = (results && results[2] ? Number(results[2]) : 0) || 0;

        const allowed = count <= config.max;
        const remaining = Math.max(0, config.max - count);

        return { allowed, limit: config.max, remaining, resetAt };
      } catch (error) {
        logger.error('Redis rate limit check failed', error as Error);
        // Fall through to in-memory implementation
      }
    }

    // Fallback to in-memory rate limiting
    const record = this.fallbackStore.get(key);

    if (!record || record.resetAt < now) {
      // New window
      this.fallbackStore.set(key, { count: 1, resetAt: now + config.windowMs });
      return {
        allowed: true,
        limit: config.max,
        remaining: config.max - 1,
        resetAt,
      };
    }

    if (record.count >= config.max) {
      return {
        allowed: false,
        limit: config.max,
        remaining: 0,
        resetAt: new Date(record.resetAt),
      };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      limit: config.max,
      remaining: config.max - record.count,
      resetAt: new Date(record.resetAt),
    };
  }

  /**
   * Clean up old entries from fallback store
   */
  cleanupFallbackStore() {
    const now = Date.now();
    for (const [key, record] of this.fallbackStore.entries()) {
      if (record.resetAt < now) {
        this.fallbackStore.delete(key);
      }
    }
  }
}

// Singleton instance
const rateLimiter = new RedisRateLimiter();

// Initialize on module load
rateLimiter
  .initialize()
  .catch(err => logger.error('Failed to initialize rate limiter', err));

// Cleanup fallback store periodically
setInterval(() => rateLimiter.cleanupFallbackStore(), 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from auth
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown';

  return `ip:${ip}`;
}

/**
 * Get rate limit config for a given path
 */
function getConfigForPath(pathname: string): RateLimitConfig {
  // Check exact match first
  if (RATE_LIMIT_CONFIGS[pathname]) {
    return RATE_LIMIT_CONFIGS[pathname];
  }

  // Check prefix match
  for (const [path, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }

  return RATE_LIMIT_CONFIGS.default!;
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const pathname = new URL(request.url).pathname;
  const config = getConfigForPath(pathname);
  const clientId = getClientId(request);
  const key = `rate-limit:${config.keyPrefix || pathname}:${clientId}`;

  const result = await rateLimiter.checkLimit(key, config);

  // Add rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    logger.warn('Rate limit exceeded', {
      clientId,
      pathname,
      limit: result.limit,
    });

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: result.resetAt,
      },
      {
        status: 429,
        headers,
      }
    );
  }

  // For allowed requests, we'll add headers in the middleware chain
  return null;
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  headers: Headers
): NextResponse {
  headers.forEach((value, key) => {
    if (key.startsWith('X-RateLimit-')) {
      response.headers.set(key, value);
    }
  });
  return response;
}
