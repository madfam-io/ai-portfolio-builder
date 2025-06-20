import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Authentication middleware to protect routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: unknown) => Promise<NextResponse>
) {
  const supabase = await createClient();

  if (!supabase) {
    logger.warn('Supabase not configured, allowing request to proceed');
    // Allow the request to proceed without authentication in development
    return handler(request, null);
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      logger.warn('Unauthorized access attempt:', { error: error?.message });

      // Redirect to login with return URL
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('next', request.nextUrl.pathname);

      return NextResponse.redirect(url);
    }

    // User is authenticated, proceed with the handler
    return handler(request, user);
  } catch (error) {
    logger.error(
      'Auth middleware error:',
      error instanceof Error ? error : new Error(String(error))
    );

    // Redirect to login on error
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', request.nextUrl.pathname);

    return NextResponse.redirect(url);
  }
}

/**
 * Check if a user is authenticated (for client components)
 */
export async function checkAuth() {
  const supabase = await createClient();

  if (!supabase) {
    return { user: null, error: new Error('Authentication not configured') };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    logger.error(
      'Check auth error:',
      error instanceof Error ? error : new Error(String(error))
    );
    return { user: null, error };
  }
}
