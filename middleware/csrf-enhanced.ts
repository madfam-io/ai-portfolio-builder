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

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { logger } from '@/lib/utils/logger';

/**
 * Enhanced CSRF Protection Middleware
 * Implements encrypted double-submit cookie pattern for CSRF protection
 */

const CSRF_COOKIE_NAME = 'prisma-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_FORM_FIELD_NAME = '_csrf';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET =
  process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

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
  '/api/health', // Health check endpoints
];

/**
 * Content types that can contain CSRF tokens in body
 */
const BODY_PARSEABLE_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

interface CSRFToken {
  value: string;
  timestamp: number;
  sessionId?: string;
}

/**
 * Encrypt token data - simplified version using HMAC
 */
function encryptToken(data: CSRFToken): string {
  const payload = JSON.stringify(data);
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

/**
 * Decrypt token data - verify and parse
 */
function decryptToken(encrypted: string): CSRFToken | null {
  try {
    const [payload, signature] = encrypted.split('.');
    if (!payload || !signature) return null;

    const data = Buffer.from(payload, 'base64').toString('utf8');
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      logger.error('CSRF token signature mismatch');
      return null;
    }

    return JSON.parse(data) as CSRFToken;
  } catch (error) {
    logger.error('Failed to decrypt CSRF token', error as Error);
    return null;
  }
}

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCSRFToken(sessionId?: string): string {
  const buffer = crypto.randomBytes(CSRF_TOKEN_LENGTH);
  const rawToken = buffer.toString('hex');

  const tokenData: CSRFToken = {
    value: rawToken,
    timestamp: Date.now(),
    sessionId,
  };

  return encryptToken(tokenData);
}

/**
 * Extract CSRF token from request body
 */
async function extractTokenFromBody(
  request: NextRequest
): Promise<string | null> {
  const contentType = request.headers.get('content-type') || '';

  if (!BODY_PARSEABLE_TYPES.some(type => contentType.includes(type))) {
    return null;
  }

  try {
    const body = await request.clone().json();
    return body[CSRF_FORM_FIELD_NAME] || null;
  } catch {
    // If JSON parsing fails, try form data
    try {
      const formData = await request.clone().formData();
      return formData.get(CSRF_FORM_FIELD_NAME) as string | null;
    } catch {
      return null;
    }
  }
}

/**
 * Verify CSRF token from request
 */
export async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
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
  if (!cookieToken) {
    logger.warn('CSRF cookie missing', {
      method: request.method,
      url: request.url,
    });
    return false;
  }

  // Decrypt and validate cookie token
  const cookieTokenData = decryptToken(cookieToken);
  if (!cookieTokenData) {
    logger.warn('Invalid CSRF cookie token', {
      method: request.method,
      url: request.url,
    });
    return false;
  }

  // Check token age (24 hours)
  const tokenAge = Date.now() - cookieTokenData.timestamp;
  if (tokenAge > 24 * 60 * 60 * 1000) {
    logger.warn('CSRF token expired', {
      method: request.method,
      url: request.url,
      tokenAge,
    });
    return false;
  }

  // Get token from header or body
  let submittedToken = request.headers.get(CSRF_HEADER_NAME);
  if (!submittedToken) {
    submittedToken = await extractTokenFromBody(request);
  }

  if (!submittedToken) {
    logger.warn('CSRF token missing from request', {
      method: request.method,
      url: request.url,
    });
    return false;
  }

  // Decrypt submitted token
  const submittedTokenData = decryptToken(submittedToken);
  if (!submittedTokenData) {
    logger.warn('Invalid submitted CSRF token', {
      method: request.method,
      url: request.url,
    });
    return false;
  }

  // Verify tokens match (value and session)
  const tokensMatch =
    cookieTokenData.value === submittedTokenData.value &&
    cookieTokenData.sessionId === submittedTokenData.sessionId;

  if (!tokensMatch) {
    logger.warn('CSRF token mismatch', {
      method: request.method,
      url: request.url,
    });
  }

  return tokensMatch;
}

/**
 * Enhanced CSRF protection middleware
 */
async function csrfMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Generate CSRF token for GET requests (to set cookie)
  if (request.method === 'GET') {
    // Extract session ID from auth cookie or generate one
    const sessionId =
      request.cookies.get('session-id')?.value ||
      crypto.randomBytes(16).toString('hex');

    const token = generateCSRFToken(sessionId);
    const response = NextResponse.next();

    // Set CSRF cookie (httpOnly)
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also set a readable token for client (not httpOnly)
    response.cookies.set(`${CSRF_COOKIE_NAME}-client`, token, {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  }

  // Verify CSRF token for protected methods
  const isValid = await verifyCSRFToken(request);
  if (!isValid) {
    logger.error('CSRF validation failed', {
      method: request.method,
      url: request.url,
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
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
    cookie.trim().startsWith(`${CSRF_COOKIE_NAME}-client=`)
  );

  return csrfCookie ? (csrfCookie.split('=')[1] || '').trim() : null;
}

/**
 * Hook to include CSRF token in requests
 */
export function useCSRFToken(): {
  token: string | null;
  headers: { [key: string]: string };
} {
  const token = getCSRFToken();

  return {
    token,
    headers: token ? { [CSRF_HEADER_NAME]: token } : {},
  };
}

// Export the middleware as default
export default csrfMiddleware;
