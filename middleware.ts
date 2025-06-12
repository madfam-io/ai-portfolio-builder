import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import { logger } from '@/lib/utils/logger';

import { apiVersionMiddleware } from './middleware/api-version';
import { csrfMiddleware } from './middleware/csrf';
import { edgeRateLimitMiddleware } from './middleware/edge-rate-limiter';
import { applySecurityHeaders, shouldApplySecurityHeaders } from './middleware/security-headers';

import type { NextRequest } from 'next/server';

/**
 * Middleware for handling authentication, route protection, rate limiting, CSRF, and API versioning
 *
 * This middleware:
 * 1. Implements Redis-based rate limiting for all endpoints
 * 2. Implements CSRF protection for state-changing operations
 * 3. Implements API versioning with automatic redirection and deprecation warnings
 * 4. Creates a Supabase client for server-side auth
 * 5. Refreshes the session if needed
 * 6. Protects dashboard and editor routes
 * 7. Redirects unauthenticated users to sign in
 * 8. Redirects authenticated users away from auth pages
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

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

  // Apply edge-compatible rate limiting to all API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = edgeRateLimitMiddleware(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Apply CSRF protection to API routes
  if (pathname.startsWith('/api/')) {
    const csrfResponse = csrfMiddleware(req);
    if (csrfResponse) {
      return csrfResponse;
    }
  }
  // Create a response that we can modify
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, skip authentication checks (development mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn(
      'Supabase environment variables not configured. Authentication middleware disabled.'
    );
    return response;
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        req.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        req.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Refresh session if expired - required for Server Components
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    logger.warn('Error getting session', error as Error);
    // Continue without session if there's an error
  }

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
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url);
    // Add the original URL as a redirect parameter
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthRoute && session) {
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

  // Apply security headers to all responses (except static assets)
  if (shouldApplySecurityHeaders(pathname)) {
    response = applySecurityHeaders(req, response);
  }

  return response;
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
