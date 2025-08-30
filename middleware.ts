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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { logger } from '@/lib/utils/logger';
import { apiVersionMiddleware } from './middleware/api-version';
import {
  securityMiddleware,
  applySecurityToResponse,
} from './middleware/security';
import { prisma } from '@/lib/db/prisma';

/**
 * Middleware for handling authentication, route protection, rate limiting, CSRF, and API versioning
 *
 * This middleware:
 * 1. Implements Redis-based rate limiting for all endpoints
 * 2. Implements CSRF protection for state-changing operations
 * 3. Implements API versioning with automatic redirection and deprecation warnings
 * 4. Uses NextAuth for authentication
 * 5. Protects dashboard and editor routes
 * 6. Redirects unauthenticated users to sign in
 * 7. Redirects authenticated users away from auth pages
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Check if this is a custom domain request
  const isCustomDomain =
    !hostname.includes('portfolio-builder.madfam.io') &&
    !hostname.includes('localhost') &&
    !hostname.includes('vercel.app') &&
    !hostname.includes('127.0.0.1');

  // Apply API versioning middleware first
  if (pathname.startsWith('/api/')) {
    const versionResponse = await apiVersionMiddleware(req);
    // If version middleware returns a response (redirect or error), return it
    if (
      versionResponse.status !== 200 ||
      versionResponse.headers.get('location')
    ) {
      return versionResponse;
    }
  }

  // Apply comprehensive security middleware
  const securityResponse = await securityMiddleware(req);
  if (securityResponse) {
    return securityResponse;
  }
  // Create a response that we can modify
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Handle custom domain routing
  if (isCustomDomain) {
    try {
      const result = await handleCustomDomain(hostname, pathname, req);
      if (result) {
        return result;
      }
    } catch (error) {
      logger.error('Custom domain lookup failed', { error, hostname });
    }

    // If domain not found or not active, show error page
    const url = req.nextUrl.clone();
    url.pathname = '/domain-not-found';
    return NextResponse.rewrite(url);
  }

  // Get session using NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/editor', '/profile'];

  // Auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/auth/signin', '/auth/signup'];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/auth/signin', req.url);
    // Add the original URL as a redirect parameter
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthRoute && token) {
    // Check if there's a redirectTo parameter
    const redirectTo = req.nextUrl.searchParams.get('redirectTo');
    if (
      redirectTo &&
      protectedRoutes.some(route => redirectTo.startsWith(route))
    ) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Apply comprehensive security headers to response
  response = applySecurityToResponse(req, response);

  return response;
}

/**
 * Handle custom domain requests
 */
async function handleCustomDomain(
  hostname: string,
  pathname: string,
  req: NextRequest
): Promise<NextResponse | null> {
  // Look up the domain in the database using Prisma
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      customDomain: hostname,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      subdomain: true,
    },
  });

  if (!portfolio || !portfolio.subdomain) {
    return null;
  }

  // Track page view analytics (async, don't block request)
  const userAgent = req.headers.get('user-agent') || '';
  const referrer = req.headers.get('referer') || '';
  const visitorId =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // Fire and forget analytics tracking
  void prisma.portfolioView
    .create({
      data: {
        portfolioId: portfolio.id,
        visitorId,
        userAgent,
        referrer: referrer || null,
        ipAddress: visitorId,
        sessionId: visitorId,
      },
    })
    .catch(error => {
      logger.error('Failed to track portfolio view', { error });
    });

  // Rewrite to the portfolio route
  const url = req.nextUrl.clone();
  url.pathname = `/p/${portfolio.subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

/**
 * Configuration for which routes should run this middleware
 *
 * This matcher ensures the middleware only runs on:
 * - Protected routes (/dashboard, /editor)
 * - Auth routes (/auth/signin, /auth/signup, /auth/callback, /auth/reset-password)
 *
 * It excludes:
 * - Static assets (_next/static, favicon.ico, etc.)
 * - API routes (already handled separately)
 * - Public routes (landing page, about, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)',
  ],
};
