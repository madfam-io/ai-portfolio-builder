import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileoverview API Optimization Utilities
 *
 * Comprehensive suite of utilities for optimizing API performance, caching,
 * and improving response times across the PRISMA platform.
 *
 * Features:
 * - Response caching with multiple strategies
 * - Rate limiting and request throttling
 * - Database query optimization
 * - API response compression
 * - Request/response logging and monitoring
 * - Error handling and retry mechanisms
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

// Cache configuration interfaces
export interface CacheConfig {
  strategy: 'memory' | 'redis' | 'database' | 'none';
  ttl: number; // Time to live in seconds
  key?: string;
  tags?: string[];
  revalidateOnStale?: boolean;
}

export interface RateLimitConfig {
  requests: number;
  window: number; // Window in seconds
  identifier?: (req: NextRequest) => string;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * In-Memory Cache Implementation
 *
 * A simple in-memory cache for development and small-scale deployments.
 * For production, consider Redis or other distributed caching solutions.
 */
class MemoryCache {
  private cache = new Map<
    string,
    { data: unknown; expiry: number; tags: string[] }
  >();
  private timers = new Map<string, NodeJS.Timeout>();

  set(key: string, data: unknown, ttl: number, tags: string[] = []): void {
    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expiry, tags });

    // Set expiry timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);
    this.timers.set(key, timer);
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }

  size(): number {
    return this.cache.size;
  }

  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const memoryCache = new MemoryCache();

/**
 * Rate Limiter Implementation
 *
 * Simple sliding window rate limiter for API endpoints.
 */
class RateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.window * 1000;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => timestamp > windowStart
    );

    // Check if under limit
    if (validRequests.length >= config.requests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  getRemainingRequests(identifier: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.window * 1000;
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(
      timestamp => timestamp > windowStart
    );

    return Math.max(0, config.requests - validRequests.length);
  }

  getResetTime(identifier: string, config: RateLimitConfig): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;

    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + config.window * 1000;
  }
}

const rateLimiter = new RateLimiter();

/**
 * API Metrics Collector
 */
class APIMetricsCollector {
  private metrics: APIMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  record(metric: APIMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(options?: {
    endpoint?: string;
    timeRange?: { start: Date; end: Date };
    statusCode?: number;
  }): APIMetrics[] {
    let filtered = this.metrics;

    if (options?.endpoint) {
      filtered = filtered.filter(m => m.endpoint === options.endpoint);
    }

    if (options?.timeRange) {
      filtered = filtered.filter(
        m =>
          options.timeRange &&
          m.timestamp >= options.timeRange.start &&
          m.timestamp <= options.timeRange.end
      );
    }

    if (options?.statusCode) {
      filtered = filtered.filter(m => m.statusCode === options.statusCode);
    }

    return filtered;
  }

  getStats(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  } {
    const total = this.metrics.length;
    const avgResponseTime =
      total > 0
        ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / total
        : 0;

    const errors = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    // Count endpoint frequencies
    const endpointCounts = new Map<string, number>();
    this.metrics.forEach(m => {
      endpointCounts.set(m.endpoint, (endpointCounts.get(m.endpoint) || 0) + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: total,
      averageResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      topEndpoints,
    };
  }
}

const metricsCollector = new APIMetricsCollector();

/**
 * API Response Cache Middleware
 *
 * Caches API responses based on configuration.
 */
export function withCache(config: CacheConfig) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (req: NextRequest, ...args: any[]) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET' || config.strategy === 'none') {
        return handler(req, ...args);
      }

      // Generate cache key
      const cacheKey = config.key || `${req.url}_${req.method}`;

      // Try to get from cache
      const cached = memoryCache.get(cacheKey) as any;
      if (cached) {
        // Return cached response with cache headers
        const response = new NextResponse(cached.body, {
          status: cached.status,
          headers: {
            ...cached.headers,
            'X-Cache': 'HIT',
            'Cache-Control': `public, max-age=${config.ttl}`,
          },
        });
        return response;
      }

      // Execute handler
      const response = await handler(req, ...args);

      // Cache successful responses
      if (response.status >= 200 && response.status < 300) {
        const body = await response.text();
        const headers = Object.fromEntries(response.headers.entries());

        memoryCache.set(
          cacheKey,
          {
            body,
            status: response.status,
            headers,
          },
          config.ttl,
          config.tags || []
        );

        // Return response with cache headers
        return new NextResponse(body, {
          status: response.status,
          headers: {
            ...headers,
            'X-Cache': 'MISS',
            'Cache-Control': `public, max-age=${config.ttl}`,
          },
        });
      }

      return response;
    }) as T;
  };
}

/**
 * Rate Limiting Middleware
 *
 * Applies rate limiting to API endpoints.
 */
export function withRateLimit(config: RateLimitConfig) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (req: NextRequest, ...args: any[]) => {
      // Get identifier (IP address by default)
      const identifier = config.identifier
        ? config.identifier(req)
        : req.headers.get('x-forwarded-for') ||
          req.headers.get('x-real-ip') ||
          'anonymous';

      // Check rate limit
      if (!rateLimiter.isAllowed(identifier, config)) {
        const remaining = rateLimiter.getRemainingRequests(identifier, config);
        const resetTime = rateLimiter.getResetTime(identifier, config);

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.requests.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
              'Retry-After': Math.ceil(
                (resetTime - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(req, ...args);
      const remaining = rateLimiter.getRemainingRequests(identifier, config);
      const resetTime = rateLimiter.getResetTime(identifier, config);

      response.headers.set('X-RateLimit-Limit', config.requests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(resetTime / 1000).toString()
      );

      return response;
    }) as T;
  };
}

/**
 * API Metrics Middleware
 *
 * Collects performance metrics for API endpoints.
 */
export function withMetrics() {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (req: NextRequest, ...args: any[]) => {
      const startTime = Date.now();
      const endpoint = new URL(req.url).pathname;

      try {
        const response = await handler(req, ...args);
        const responseTime = Date.now() - startTime;

        // Record metrics
        metricsCollector.record({
          endpoint,
          method: req.method,
          statusCode: response.status,
          responseTime,
          timestamp: new Date(),
          userAgent: req.headers.get('user-agent') || undefined,
          ip:
            req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            undefined,
        });

        // Add performance headers
        response.headers.set('X-Response-Time', `${responseTime}ms`);

        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;

        // Record error metrics
        metricsCollector.record({
          endpoint,
          method: req.method,
          statusCode: 500,
          responseTime,
          timestamp: new Date(),
          userAgent: req.headers.get('user-agent') || undefined,
          ip:
            req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            undefined,
        });

        throw error;
      }
    }) as T;
  };
}

/**
 * Combined API Optimization Middleware
 *
 * Combines multiple optimization strategies into a single decorator.
 */
function withOptimization(options: {
  cache?: CacheConfig;
  rateLimit?: RateLimitConfig;
  metrics?: boolean;
}) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    let optimizedHandler = handler;

    // Apply metrics first (innermost)
    if (options.metrics !== false) {
      optimizedHandler = withMetrics()(optimizedHandler);
    }

    // Apply rate limiting
    if (options.rateLimit) {
      optimizedHandler = withRateLimit(options.rateLimit)(optimizedHandler);
    }

    // Apply caching (outermost)
    if (options.cache) {
      optimizedHandler = withCache(options.cache)(optimizedHandler);
    }

    return optimizedHandler;
  };
}

/**
 * Database Query Optimization Utilities
 */
class QueryOptimizer {
  /**
   * Batch multiple database queries
   */
  static batchQueries<T>(queries: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(queries.map(query => query()));
  }

  /**
   * Paginate query results
   */
  static getPaginationParams(searchParams: URLSearchParams): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10'))
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Build pagination response
   */
  static buildPaginatedResponse<T>(
    data: T[],
    paginationOptions: {
      total: number;
      page: number;
      limit: number;
      baseUrl?: string;
    }
  ) {
    const { total, page, limit, baseUrl } = paginationOptions;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        ...(baseUrl && {
          nextUrl: hasNext
            ? `${baseUrl}?page=${page + 1}&limit=${limit}`
            : null,
          prevUrl: hasPrev
            ? `${baseUrl}?page=${page - 1}&limit=${limit}`
            : null,
        }),
      },
    };
  }
}

/**
 * Get API metrics and cache stats
 */
function getAPIStats() {
  return {
    metrics: metricsCollector.getStats(),
    cache: memoryCache.stats(),
  };
}

/**
 * Clear all caches
 */
function clearCaches() {
  memoryCache.clear();
}

/**
 * Invalidate cache by tag
 */
function invalidateCache(tag: string): number {
  return memoryCache.invalidateByTag(tag);
}

export { memoryCache, rateLimiter, metricsCollector };
