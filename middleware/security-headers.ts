/**
 * Security Headers Middleware
 * Implements comprehensive security headers to protect against common vulnerabilities
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: self, Next.js inline scripts, and trusted CDNs
    `script-src 'self' ${isDevelopment ? "'unsafe-eval'" : ""} 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com`,
    // Styles: self, inline styles for Tailwind
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Images: self, data URIs, and common image CDNs
    "img-src 'self' data: blob: https: http://localhost:*",
    // Fonts: self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Connect: API endpoints and analytics
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://api.github.com https://api.huggingface.co wss://*.supabase.co ${isDevelopment ? 'ws://localhost:*' : ''}`,
    // Media: self
    "media-src 'self'",
    // Objects: none
    "object-src 'none'",
    // Base URI: self
    "base-uri 'self'",
    // Form action: self
    "form-action 'self'",
    // Frame ancestors: none (same as X-Frame-Options: DENY)
    "frame-ancestors 'none'",
    // Upgrade insecure requests in production
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ];

  headers.set('Content-Security-Policy', cspDirectives.join('; '));

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
  const staticExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return false;
  }

  // Apply to all other routes
  return true;
}