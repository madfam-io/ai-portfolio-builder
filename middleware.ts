import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for handling authentication and route protection
 * 
 * This middleware:
 * 1. Creates a Supabase client for server-side auth
 * 2. Refreshes the session if needed
 * 3. Protects dashboard and editor routes
 * 4. Redirects unauthenticated users to sign in
 * 5. Redirects authenticated users away from auth pages
 */
export async function middleware(req: NextRequest) {
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

  const { pathname } = req.nextUrl;

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