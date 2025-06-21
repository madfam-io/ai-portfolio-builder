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

import { logger } from '@/lib/utils/logger';

/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 */

const CSRF_COOKIE_NAME = 'prisma-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Methods that require CSRF protection
 */
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Routes that are exempt from CSRF protection
 */
const EXEMPT_ROUTES = [
  '/api/auth/callback', // OAuth callbacks
  '/api/integrations/github/callback', // GitHub OAuth callback
  '/api/webhooks', // Webhook endpoints
];

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  const buffer = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  // Skip CSRF check for non-protected methods
  if (!PROTECTED_METHODS.includes(request.method)) {
    return true;
  }

  // Skip CSRF check for exempt routes
  const pathname = new URL(request.url).pathname;
  if (EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return true;
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Get token from header or body
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    logger.warn('CSRF token missing', {
      method: request.method,
      url: request.url,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });
    return false;
  }

  // Verify tokens match
  const tokensMatch = cookieToken === headerToken;

  if (!tokensMatch) {
    logger.warn('CSRF token mismatch', {
      method: request.method,
      url: request.url,
    });
  }

  return tokensMatch;
}

/**
 * CSRF protection middleware
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Generate CSRF token for GET requests (to set cookie)
  if (request.method === 'GET') {
    const token = generateCSRFToken();
    const response = NextResponse.next();

    // Set CSRF cookie
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Add token to response header for client to read
    response.headers.set(CSRF_HEADER_NAME, token);

    return response;
  }

  // Verify CSRF token for protected methods
  if (!verifyCSRFToken(request)) {
    logger.error('CSRF validation failed', {
      method: request.method,
      url: request.url,
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
    });

    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  return null;
}

/**
 * Helper to get CSRF token for client-side requests
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie =>
    cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`)
  );

  return csrfCookie ? (csrfCookie.split('=')[1] || '').trim() : null;
}
