import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (in production, use Redis or external storage)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting function
 * Implements sliding window rate limiting
 */
function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 900000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Middleware for handling authentication, route protection, and rate limiting
 * 
 * This middleware:
 * 1. Implements rate limiting for auth endpoints
 * 2. Creates a Supabase client for server-side auth
 * 3. Refreshes the session if needed
 * 4. Protects dashboard and editor routes
 * 5. Redirects unauthenticated users to sign in
 * 6. Redirects authenticated users away from auth pages
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Apply rate limiting to authentication endpoints
  const authEndpoints = ['/auth/signin', '/auth/signup', '/auth/reset-password'];
  const isAuthEndpoint = authEndpoints.some(endpoint => pathname.startsWith(endpoint));
  
  if (isAuthEndpoint) {
    // Use IP address for rate limiting (with forwarded IP support)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || // Cloudflare
               'unknown';
    
    const identifier = `auth:${ip}`;
    
    if (!checkRateLimit(identifier, 5, 900000)) { // 5 requests per 15 minutes for auth
      console.warn(`Rate limit exceeded for IP: ${ip} on ${pathname}`);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: '15 minutes'
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900', // 15 minutes
          }
        }
      );
    }
  }
  // Create a response that we can modify
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/editor', '/profile'];
  
  // Auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/auth/signin', '/auth/signup'];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

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
    if (redirectTo && protectedRoutes.some(route => redirectTo.startsWith(route))) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
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
    // Protected routes
    '/dashboard/:path*',
    '/editor/:path*',
    '/profile/:path*',
    // Auth routes
    '/auth/signin',
    '/auth/signup',
    '/auth/callback',
    '/auth/reset-password',
  ],
};