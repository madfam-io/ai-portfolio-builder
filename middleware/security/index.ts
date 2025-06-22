/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Comprehensive Security Middleware
 *
 * Combines all security features into a single middleware:
 * - CSRF protection
 * - Rate limiting
 * - Security headers
 * - Request validation
 * - IP blocking
 *
 * @module middleware/security
 */

import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

import { csrfMiddleware } from '../csrf';
import { edgeRateLimitMiddleware } from '../edge-rate-limiter';
import { applySecurityHeaders } from '../security-headers';

/**
 * Security configuration
 */
const SECURITY_CONFIG = {
  // Blocked IPs (could be loaded from database)
  blockedIPs: new Set<string>(),

  // Suspicious patterns in URLs
  suspiciousPatterns: [
    /\.\.\//g, // Directory traversal
    /<script/gi, // Script injection
    /javascript:/gi, // JavaScript protocol
    /on\w+=/gi, // Event handlers
  ],

  // Maximum request size (10MB)
  maxRequestSize: 10 * 1024 * 1024,

  // Allowed origins for CORS
  allowedOrigins: env.CORS_ALLOWED_ORIGINS?.split(',') || [],
};

/**
 * Check if IP is blocked
 */
function isIPBlocked(request: NextRequest): boolean {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return SECURITY_CONFIG.blockedIPs.has(ip);
}

/**
 * Check for suspicious patterns in request
 */
function hasSuspiciousContent(request: NextRequest): boolean {
  const url = request.url;
  const pathname = new URL(url).pathname;

  // Check URL for suspicious patterns
  for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(pathname)) {
      return true;
    }
  }

  // Check query parameters
  const searchParams = new URL(url).searchParams;
  for (const [key, value] of searchParams) {
    for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
      if (pattern.test(key) || pattern.test(value)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate request size
 */
function isRequestTooLarge(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > SECURITY_CONFIG.maxRequestSize) {
      return true;
    }
  }

  return false;
}

/**
 * Apply CORS headers based on configuration
 */
function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin');

  // Allow configured origins or same origin
  if (
    origin &&
    (SECURITY_CONFIG.allowedOrigins.includes(origin) ||
      origin === new URL(request.url).origin)
  ) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set other CORS headers
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Log security events
 */
function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: Record<string, any>
) {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  logger.warn(`Security Event: ${event}`, {
    ip,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ...details,
  });
}

/**
 * Comprehensive security middleware
 */
export function securityMiddleware(request: NextRequest): NextResponse | null {
  try {
    // 1. Check if IP is blocked
    if (isIPBlocked(request)) {
      logSecurityEvent('BLOCKED_IP', request);
      return new NextResponse(null, { status: 403 });
    }

    // 2. Check for suspicious content
    if (hasSuspiciousContent(request)) {
      logSecurityEvent('SUSPICIOUS_CONTENT', request);
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 3. Check request size
    if (isRequestTooLarge(request)) {
      logSecurityEvent('REQUEST_TOO_LARGE', request);
      return NextResponse.json(
        { error: 'Request entity too large' },
        { status: 413 }
      );
    }

    // 4. Apply rate limiting
    const rateLimitResponse = edgeRateLimitMiddleware(request);
    if (rateLimitResponse) {
      logSecurityEvent('RATE_LIMITED', request);
      return rateLimitResponse;
    }

    // 5. Apply CSRF protection for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const csrfResponse = csrfMiddleware(request);
      if (csrfResponse) {
        logSecurityEvent('CSRF_FAILED', request);
        return csrfResponse;
      }
    }

    // 6. Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      return applyCORSHeaders(request, response);
    }

    // Request passed all security checks
    return null;
  } catch (error) {
    logger.error('Security middleware error', { error });
    // Fail closed - return error if security checks fail
    return NextResponse.json(
      { error: 'Security check failed' },
      { status: 500 }
    );
  }
}

/**
 * Apply security headers to response
 */
export function applySecurityToResponse(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  // Apply security headers
  response = applySecurityHeaders(request, response);

  // Apply CORS headers
  response = applyCORSHeaders(request, response);

  // Add additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

/**
 * Security utilities for use in API routes
 */
export const securityUtils = {
  /**
   * Validate API key
   */
  validateAPIKey(request: NextRequest, apiKey: string): boolean {
    const providedKey = request.headers.get('x-api-key');
    return providedKey === apiKey;
  },

  /**
   * Get client IP address
   */
  getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    );
  },

  /**
   * Check if request is from allowed origin
   */
  isAllowedOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return true; // Same-origin requests

    return (
      SECURITY_CONFIG.allowedOrigins.includes(origin) ||
      origin === new URL(request.url).origin
    );
  },

  /**
   * Add IP to blocklist
   */
  blockIP(ip: string): void {
    SECURITY_CONFIG.blockedIPs.add(ip);
    logger.warn('IP added to blocklist', { ip });
  },

  /**
   * Remove IP from blocklist
   */
  unblockIP(ip: string): void {
    SECURITY_CONFIG.blockedIPs.delete(ip);
    logger.info('IP removed from blocklist', { ip });
  },
};
