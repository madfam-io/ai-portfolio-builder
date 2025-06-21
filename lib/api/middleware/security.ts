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

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview Security middleware for API routes
 * Provides CSRF protection, rate limiting, and other security measures
 */

/**
 * CSRF Token Configuration
 */
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = '_csrf_token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const tokenFromHeader = request.headers.get(CSRF_TOKEN_HEADER);
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!tokenFromHeader || !tokenFromCookie) {
    logger.warn('CSRF validation failed: missing tokens', {
      hasHeader: !!tokenFromHeader,
      hasCookie: !!tokenFromCookie,
      method: request.method,
      path: request.nextUrl.pathname,
    });
    return false;
  }

  // Use timing-safe comparison
  try {
    if (!tokenFromHeader || !tokenFromCookie) {
      return false;
    }

    const headerBuffer = Buffer.from(tokenFromHeader, 'hex');
    const cookieBuffer = Buffer.from(tokenFromCookie, 'hex');

    if (headerBuffer.length !== cookieBuffer.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < headerBuffer.length; i++) {
      result |= (headerBuffer[i] ?? 0) ^ (cookieBuffer[i] ?? 0);
    }

    return result === 0;
  } catch (error) {
    logger.error('CSRF token validation error:', error as Error);
    return false;
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try multiple headers to get the real client IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  if (xRealIP) {
    return xRealIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to connection remote address if available
  return 'unknown';
}

/**
 * Request fingerprinting for additional security
 */
export function generateRequestFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || '',
    getClientIP(request),
  ];

  return createHash('sha256').update(components.join('|')).digest('hex');
}

/**
 * Check for suspicious request patterns
 */
export function detectSuspiciousActivity(request: NextRequest): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for suspicious user agents
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousUAPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /^$/,
  ];

  if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('suspicious_user_agent');
  }

  // Check for missing expected headers
  if (!request.headers.get('accept')) {
    reasons.push('missing_accept_header');
  }

  // Check for suspicious referer patterns
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const currentHost = request.nextUrl.host;

      // Allow common staging/development patterns
      const allowedHosts = [
        'localhost',
        'prisma.madfam.io',
        '*.vercel.app',
        '*.netlify.app',
      ];

      const isAllowed = allowedHosts.some(pattern => {
        if (pattern.startsWith('*')) {
          return refererUrl.hostname.endsWith(pattern.slice(1));
        }
        return (
          refererUrl.hostname === pattern || refererUrl.hostname === currentHost
        );
      });

      if (!isAllowed) {
        reasons.push('suspicious_referer');
      }
    } catch (_error) {
      // Invalid referer URL
      reasons.push('invalid_referer');
    }
  }

  // Check for rapid sequential requests (basic rate limiting check)
  // This would ideally use Redis, but for now we'll just flag it

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const forwardedIPs = forwardedFor.split(',');
    if (forwardedIPs.length > 5) {
      reasons.push('multiple_proxies');
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Security middleware wrapper for API routes
 */
export function withSecurity<T extends (...args: unknown[]) => unknown>(
  handler: T,
  options: {
    requireCSRF?: boolean;
    allowedMethods?: string[];
    checkSuspiciousActivity?: boolean;
  } = {}
): T {
  const {
    requireCSRF = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    checkSuspiciousActivity = true,
  } = options;

  return (async (request: NextRequest, ...args: unknown[]) => {
    try {
      // Method validation
      if (!allowedMethods.includes(request.method)) {
        logger.warn('Method not allowed', {
          method: request.method,
          path: request.nextUrl.pathname,
          ip: getClientIP(request),
        });

        return NextResponse.json(
          { error: 'Method not allowed' },
          {
            status: 405,
            headers: {
              Allow: allowedMethods.join(', '),
            },
          }
        );
      }

      // CSRF protection
      if (requireCSRF && !validateCSRFToken(request)) {
        logger.warn('CSRF validation failed', {
          method: request.method,
          path: request.nextUrl.pathname,
          ip: getClientIP(request),
        });

        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }

      // Suspicious activity detection
      if (checkSuspiciousActivity) {
        const { isSuspicious, reasons } = detectSuspiciousActivity(request);

        if (isSuspicious) {
          logger.warn('Suspicious activity detected', {
            reasons,
            method: request.method,
            path: request.nextUrl.pathname,
            ip: getClientIP(request),
            userAgent: request.headers.get('user-agent'),
          });

          // For now, just log it. In production, might want to rate limit or block
        }
      }

      // Add security headers to response
      const response = await handler(request, ...args);

      if (response instanceof NextResponse) {
        // Add CSRF token for future requests
        if (!request.cookies.get(CSRF_COOKIE_NAME)) {
          const csrfToken = generateCSRFToken();
          response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
          });

          response.headers.set('X-CSRF-Token', csrfToken);
        }

        // Add additional security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set(
          'Referrer-Policy',
          'strict-origin-when-cross-origin'
        );
      }

      return response;
    } catch (error) {
      logger.error('Security middleware error:', error as Error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }) as T;
}

/**
 * Content validation for API requests
 */
export function validateRequestContent(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  const contentType = request.headers.get('content-type');

  // For POST/PUT/PATCH requests, require proper content type
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (!contentType) {
      return { isValid: false, error: 'Content-Type header required' };
    }

    if (
      !contentType.includes('application/json') &&
      !contentType.includes('multipart/form-data') &&
      !contentType.includes('application/x-www-form-urlencoded')
    ) {
      return { isValid: false, error: 'Unsupported content type' };
    }
  }

  // Check for reasonable content length
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (length > 10 * 1024 * 1024) {
      // 10MB limit
      return { isValid: false, error: 'Request too large' };
    }
  }

  return { isValid: true };
}

/**
 * Security-hardened error response
 */
export function secureErrorResponse(
  message: string = 'An error occurred',
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  // In production, don't leak sensitive information
  const response =
    process.env.NODE_ENV === 'production'
      ? { error: message }
      : { error: message, details };

  return NextResponse.json(response, { status });
}
