import { NextResponse } from 'next/server';

/**
 * Cache Header Utilities
 * Implements comprehensive caching strategies for API routes
 */

export interface CacheOptions {
  /**
   * Cache duration in seconds
   * @default 300 (5 minutes)
   */
  maxAge?: number;

  /**
   * Stale-while-revalidate duration in seconds
   * @default 86400 (24 hours)
   */
  swr?: number;

  /**
   * Whether to cache on CDN
   * @default true
   */
  public?: boolean;

  /**
   * Whether to allow caching of responses with cookies
   * @default false
   */
  private?: boolean;

  /**
   * Revalidation time for static pages
   * @default undefined
   */
  revalidate?: number;

  /**
   * Entity tag for cache validation
   */
  etag?: string;

  /**
   * Last modified timestamp
   */
  lastModified?: Date;
}

/**
 * Apply cache headers to API response
 */
export function withCacheHeaders(
  response: NextResponse,
  options: CacheOptions = {}
): NextResponse {
  const {
    maxAge = 300, // 5 minutes default
    swr = 86400, // 24 hours default
    public: isPublic = true,
    private: isPrivate = false,
    etag,
    lastModified,
  } = options;

  // Build Cache-Control header
  const cacheDirectives: string[] = [];

  if (isPrivate) {
    cacheDirectives.push('private');
  } else if (isPublic) {
    cacheDirectives.push('public');
  }

  cacheDirectives.push(`max-age=${maxAge}`);

  if (swr > 0) {
    cacheDirectives.push(`stale-while-revalidate=${swr}`);
  }

  response.headers.set('Cache-Control', cacheDirectives.join(', '));

  // Set ETag if provided
  if (etag) {
    response.headers.set('ETag', etag);
  }

  // Set Last-Modified if provided
  if (lastModified) {
    response.headers.set('Last-Modified', lastModified.toUTCString());
  }

  // Add Vary header for content negotiation
  response.headers.set('Vary', 'Accept-Encoding, Accept, Authorization');

  return response;
}

/**
 * Cache configurations for different API endpoints
 */
export const CACHE_CONFIGS = {
  // Public data that rarely changes
  templates: {
    maxAge: 3600, // 1 hour
    swr: 604800, // 1 week
    public: true,
  },

  // Analytics data that updates periodically
  analytics: {
    maxAge: 300, // 5 minutes
    swr: 3600, // 1 hour
    public: false,
  },

  // AI model information
  aiModels: {
    maxAge: 1800, // 30 minutes
    swr: 86400, // 24 hours
    public: true,
  },

  // User portfolios (authenticated)
  portfolios: {
    maxAge: 60, // 1 minute
    swr: 300, // 5 minutes
    private: true,
  },

  // Static API responses
  static: {
    maxAge: 86400, // 24 hours
    swr: 604800, // 1 week
    public: true,
  },

  // Real-time data
  realtime: {
    maxAge: 0,
    swr: 0,
    private: true,
  },
};

/**
 * Generate ETag from content
 */
export function generateETag(content: unknown): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(JSON.stringify(content))
    .digest('hex');
  return `"${hash}"`;
}

/**
 * Check if request has valid cache
 */
export function checkCacheValidity(
  request: Request,
  etag?: string,
  lastModified?: Date
): boolean {
  // Check If-None-Match header
  if (etag) {
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return true;
    }
  }

  // Check If-Modified-Since header
  if (lastModified) {
    const ifModifiedSince = request.headers.get('If-Modified-Since');
    if (ifModifiedSince) {
      const clientDate = new Date(ifModifiedSince);
      if (clientDate >= lastModified) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Create 304 Not Modified response
 */
export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, { status: 304 });
}
