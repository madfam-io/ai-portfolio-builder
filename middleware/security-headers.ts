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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCSPDirectives, generateCSPHeader } from '@/lib/security/csp';

/**
 * Security Headers Middleware
 * Implements comprehensive security headers to protect against common vulnerabilities
 */

/**
 * Apply security headers to the response
 */
export function applySecurityHeaders(
  _request: NextRequest,
  response: NextResponse
): NextResponse {
  const headers = response.headers;

  // X-Content-Type-Options: Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection: Enable XSS filter (for older browsers)
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Restrict browser features
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Content-Security-Policy: Comprehensive CSP
  const cspDirectives = getCSPDirectives();
  const cspHeader = generateCSPHeader(cspDirectives);

  // Add upgrade-insecure-requests for production
  const finalCSP =
    process.env.NODE_ENV === 'production'
      ? `${cspHeader}; upgrade-insecure-requests`
      : cspHeader;

  headers.set('Content-Security-Policy', finalCSP);

  // Strict-Transport-Security: Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // X-DNS-Prefetch-Control: Control DNS prefetching
  headers.set('X-DNS-Prefetch-Control', 'on');

  // X-Permitted-Cross-Domain-Policies: Restrict Adobe Flash/PDF policies
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

/**
 * Check if the request path should have security headers applied
 * Skip for Next.js internal routes and static assets
 */
export function shouldApplySecurityHeaders(pathname: string): boolean {
  // Skip Next.js internal routes
  if (pathname.startsWith('/_next/')) {
    return false;
  }

  // Skip static file extensions that don't need headers
  const staticExtensions = [
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.gif',
    '.webp',
  ];
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return false;
  }

  // Apply to all other routes
  return true;
}
