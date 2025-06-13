import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/utils/logger';

/**
 * Edge-compatible rate limiter for Vercel deployment
 * Uses in-memory storage with sliding window algorithm
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string; // Custom error message
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

// Default configurations for different endpoint types
const defaultConfigs = {
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
} as const satisfies Record<string, RateLimitConfig>;

// In-memory store for rate limit data
// In production, this should be replaced with a distributed store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup function that runs on each request
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const maxSize = 10000; // Prevent unbounded growth

  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  // If still too large, remove oldest entries
  if (rateLimitStore.size > maxSize) {
    const entries = Array.from(rateLimitStore.entries()).sort(
      (a, b) => a[1].resetTime - b[1].resetTime
    );

    const toRemove = entries.slice(0, entries.length - maxSize);
    toRemove.forEach(([key]) => rateLimitStore.delete(key));
  }
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
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
 * Determine rate limit config based on path
 */
function getConfigForPath(path: string): RateLimitConfig {
  if (path.startsWith('/api/auth/')) {
    return defaultConfigs.auth;
  }
  if (
    path.startsWith('/api/ai/') ||
    path.includes('/enhance') ||
    path.includes('/optimize')
  ) {
    return defaultConfigs.ai;
  }
  if (path.startsWith('/api/')) {
    return defaultConfigs.api;
  }

  // No rate limiting for non-API routes
  return { windowMs: 0, max: Infinity };
}

/**
 * Edge-compatible rate limiting middleware
 */
export function edgeRateLimitMiddleware(
  request: NextRequest,
  customConfig?: Partial<RateLimitConfig>
): NextResponse | null {
  const path = new URL(request.url).pathname;
  const baseConfig = getConfigForPath(path);
  const config = { ...baseConfig, ...customConfig };

  // Skip if no rate limiting for this path
  if (config.max === Infinity) {
    return null;
  }

  const clientId = getClientId(request);
  const now = Date.now();

  // Run cleanup occasionally (1% of requests)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // Get or create rate limit data
  let rateLimitData = rateLimitStore.get(clientId);

  if (!rateLimitData || rateLimitData.resetTime < now) {
    // Create new window
    rateLimitData = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, rateLimitData);
  }

  // Increment counter
  rateLimitData.count++;

  // Check if limit exceeded
  if (rateLimitData.count > config.max) {
    logger.warn('Rate limit exceeded', {
      clientId,
      path,
      count: rateLimitData.count,
      max: config.max,
    });

    // Calculate retry after
    const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);

    return NextResponse.json(
      {
        error: config.message || 'Too many requests',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
        },
      }
    );
  }

  // Add rate limit headers to successful responses
  const remaining = config.max - rateLimitData.count;
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.max.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    new Date(rateLimitData.resetTime).toISOString()
  );

  return null; // Continue to next middleware
}

/**
 * Create a custom rate limiter with specific configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest) => edgeRateLimitMiddleware(request, config);
}
