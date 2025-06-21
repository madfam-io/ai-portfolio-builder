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
 * Performance optimization middleware for runtime improvements
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Response compression and caching headers
 */
export function withPerformanceOptimization<
  T extends (...args: unknown[]) => unknown,
>(
  handler: T,
  options: {
    enableCompression?: boolean;
    cacheControl?: string;
    enableETags?: boolean;
    maxAge?: number;
  } = {}
): T {
  const {
    enableCompression = true,
    cacheControl,
    enableETags = true,
    maxAge = 3600, // 1 hour default
  } = options;

  return (async (request: NextRequest, ...args: unknown[]) => {
    const startTime = Date.now();

    try {
      // Execute the original handler
      const response = await handler(request, ...args);

      if (response instanceof NextResponse) {
        // Add performance headers
        const processingTime = Date.now() - startTime;
        response.headers.set('X-Response-Time', `${processingTime}ms`);

        // Cache control based on content type and route
        const contentType = response.headers.get('content-type') || '';
        const isAPI = request.nextUrl.pathname.startsWith('/api/');
        const isStatic = request.nextUrl.pathname.match(
          /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/
        );

        if (cacheControl) {
          response.headers.set('Cache-Control', cacheControl);
        } else if (isStatic) {
          // Static assets - cache for 1 year
          response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
          );
        } else if (isAPI) {
          // API routes - cache based on content
          const apiCacheControl = contentType.includes('application/json')
            ? `public, max-age=${maxAge}, stale-while-revalidate=86400`
            : 'no-cache, no-store, must-revalidate';
          response.headers.set('Cache-Control', apiCacheControl);
        } else {
          // HTML pages - short cache with revalidation
          response.headers.set(
            'Cache-Control',
            'public, max-age=300, stale-while-revalidate=3600'
          );
        }

        // Enable compression if supported
        if (enableCompression) {
          const acceptEncoding = request.headers.get('accept-encoding') || '';
          if (acceptEncoding.includes('gzip')) {
            response.headers.set('Content-Encoding', 'gzip');
          } else if (acceptEncoding.includes('br')) {
            response.headers.set('Content-Encoding', 'br');
          }
        }

        // Add ETag for better caching
        if (enableETags && response.body) {
          const etag = generateETag(response);
          response.headers.set('ETag', etag);

          // Check if client has cached version
          const ifNoneMatch = request.headers.get('if-none-match');
          if (ifNoneMatch === etag) {
            return new NextResponse(null, { status: 304 });
          }
        }

        // Add performance hints
        response.headers.set('X-DNS-Prefetch-Control', 'on');
        response.headers.set(
          'X-Preconnect',
          'https://fonts.googleapis.com, https://api.stripe.com'
        );

        // Server timing for debugging
        if (process.env.NODE_ENV === 'development') {
          response.headers.set('Server-Timing', `total;dur=${processingTime}`);
        }
      }

      return response;
    } catch (_error) {
      // Even errors should have response time headers
      const processingTime = Date.now() - startTime;
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      errorResponse.headers.set('X-Response-Time', `${processingTime}ms`);
      return errorResponse;
    }
  }) as T;
}

/**
 * Generate ETag for response caching
 */
function generateETag(response: NextResponse): string {
  // Simple hash-based ETag generation
  const content = response.body ? response.body.toString() : '';
  let hash = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `"${Math.abs(hash).toString(16)}"`;
}

/**
 * Database query optimization middleware
 */
export function withQueryOptimization<
  T extends (...args: unknown[]) => unknown,
>(
  handler: T,
  options: {
    enableQueryCache?: boolean;
    cacheKeyGenerator?: (request: NextRequest) => string;
    cacheTTL?: number;
  } = {}
): T {
  const {
    enableQueryCache = true,
    cacheKeyGenerator,
    cacheTTL = 300, // 5 minutes
  } = options;

  return (async (request: NextRequest, ...args: unknown[]) => {
    if (!enableQueryCache) {
      return handler(request, ...args);
    }

    // Generate cache key
    const cacheKey = cacheKeyGenerator
      ? cacheKeyGenerator(request)
      : `query:${request.nextUrl.pathname}:${request.nextUrl.search}`;

    // Try to get from cache first
    try {
      // This would integrate with Redis in production
      // For now, we'll use in-memory cache
      const cachedResponse = getFromCache(cacheKey);

      if (cachedResponse) {
        const response = NextResponse.json(cachedResponse);
        response.headers.set('X-Cache', 'HIT');
        return response;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Cache read error:', error);
    }

    // Execute handler and cache result
    const response = await handler(request, ...args);

    if (response instanceof NextResponse && response.status === 200) {
      try {
        const responseData = await response.clone().json();
        setCache(cacheKey, responseData, cacheTTL);
        response.headers.set('X-Cache', 'MISS');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Cache write error:', error);
      }
    }

    return response;
  }) as T;
}

/**
 * Simple in-memory cache (replace with Redis in production)
 */
const cache = new Map<string, { data: unknown; expiry: number }>();

function getFromCache(key: string): unknown | null {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

function setCache(key: string, data: unknown, ttlSeconds: number): void {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiry });

  // Clean up expired entries periodically
  if (cache.size > 1000) {
    cleanupExpiredCache();
  }
}

function cleanupExpiredCache(): void {
  const now = Date.now();

  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
}

/**
 * Resource optimization for API responses
 */
export function optimizeAPIResponse(data: unknown): unknown {
  // Remove undefined values to reduce payload size
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value === undefined) {
        return undefined;
      }
      return value;
    })
  );
}

/**
 * Pagination optimization
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export function optimizePagination(
  request: NextRequest,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationOptions {
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const requestedLimit = parseInt(
    searchParams.get('limit') || defaultLimit.toString(),
    10
  );
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);

  return { page, limit, maxLimit };
}

/**
 * Image optimization helpers
 */
export const imageOptimization = {
  /**
   * Generate optimized image URLs with Next.js Image API
   */
  generateOptimizedUrl: (
    src: string,
    width: number,
    quality: number = 75
  ): string => {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    });

    return `/_next/image?${params.toString()}`;
  },

  /**
   * Generate responsive image srcSet
   */
  generateResponsiveSrcSet: (
    src: string,
    widths: number[] = [320, 640, 1280, 1920],
    quality: number = 75
  ): string => {
    return widths
      .map(width => {
        const url = imageOptimization.generateOptimizedUrl(src, width, quality);
        return `${url} ${width}w`;
      })
      .join(', ');
  },
};

/**
 * Bundle optimization utilities
 */
export const bundleOptimization = {
  /**
   * Critical CSS extraction
   */
  extractCriticalCSS: (
    _html: string
  ): { critical: string; remaining: string } => {
    // This would be implemented with a CSS extraction tool
    // For now, return placeholder
    return {
      critical: '',
      remaining: '',
    };
  },

  /**
   * Resource prioritization
   */
  prioritizeResources: (
    resources: string[]
  ): { critical: string[]; deferred: string[] } => {
    const critical = resources.filter(
      resource =>
        resource.includes('/critical/') || resource.includes('/above-fold/')
    );

    const deferred = resources.filter(resource => !critical.includes(resource));

    return { critical, deferred };
  },
};

/**
 * Runtime performance monitoring
 */
export function trackPerformanceMetrics(
  operation: string,
  startTime: number,
  additionalData?: Record<string, unknown>
): void {
  const duration = Date.now() - startTime;

  // Log performance metrics (in production, send to analytics service)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`Performance: ${operation} took ${duration}ms`, additionalData);
  }

  // Track slow operations
  if (duration > 1000) {
    // eslint-disable-next-line no-console
    console.warn(
      `Slow operation detected: ${operation} took ${duration}ms`,
      additionalData
    );
  }
}
