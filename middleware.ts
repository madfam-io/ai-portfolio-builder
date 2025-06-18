import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { logger } from '@/lib/utils/logger';
import { apiVersionMiddleware } from './middleware/api-version';
import {
  securityMiddleware,
  applySecurityToResponse,
} from './middleware/security';

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
  const hostname = req.headers.get('host') || '';

  // Check if this is a custom domain request
  const isCustomDomain =
    !hostname.includes('prisma.madfam.io') &&
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

  // Import environment config at the top of the function to avoid module initialization issues
  const { env, services } = await import('@/lib/config');

  // Handle custom domain routing
  if (isCustomDomain) {
    // Create a Supabase client for custom domain lookup
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    try {
      // Look up the domain in the database
      const { data: domain } = await supabase
        .from('custom_domains')
        .select('portfolio_id, status')
        .eq('domain', hostname)
        .eq('status', 'active')
        .single();

      if (domain && domain.portfolio_id) {
        // Get portfolio details
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('subdomain')
          .eq('id', domain.portfolio_id)
          .single();

        if (portfolio && portfolio.subdomain) {
          // Track page view analytics (async, don't block request)
          const userAgent = req.headers.get('user-agent') || '';
          const referrer = req.headers.get('referer') || '';

          // Fire and forget analytics tracking
          void supabase
            .from('domain_analytics')
            .insert({
              domain_id: domain.portfolio_id,
              event_type: 'page_view',
              path: pathname,
              referrer: referrer || null,
              user_agent: userAgent,
              visitor_id: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
              session_id:
                req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            });

          // Rewrite to the portfolio route
          const url = req.nextUrl.clone();
          url.pathname = `/p/${portfolio.subdomain}${pathname}`;
          return NextResponse.rewrite(url);
        }
      }
    } catch (error) {
      logger.error('Custom domain lookup failed', { error, hostname });
    }

    // If domain not found or not active, show error page
    const url = req.nextUrl.clone();
    url.pathname = '/domain-not-found';
    return NextResponse.rewrite(url);
  }

  // If Supabase is not configured, skip authentication checks (development mode)
  if (!services.supabase) {
    logger.warn(
      'Supabase service not configured. Authentication middleware disabled.'
    );
    return response;
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // Refresh session if expired - required for Server Components
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    logger.warn('Error getting session', { error: (error as Error).message });
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

  // Apply comprehensive security headers to response
  response = applySecurityToResponse(req, response);

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
