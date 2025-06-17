import { NextRequest, NextResponse } from 'next/server';

// Simple mock middleware for testing
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/editor', '/profile'];
  const authRoutes = ['/auth/signin', '/auth/signup'];
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Mock session from request headers
  const hasSession = req.headers.get('x-mock-session') === 'true';
  
  // Redirect logic
  if (isProtectedRoute && !hasSession) {
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (isAuthRoute && hasSession) {
    const redirectTo = req.nextUrl.searchParams.get('redirectTo');
    if (redirectTo && protectedRoutes.some(route => redirectTo.startsWith(route))) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Default response
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};