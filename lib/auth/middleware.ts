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

import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';

/**
 * Authentication middleware to protect routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: unknown) => Promise<NextResponse>
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      logger.warn('Unauthorized access attempt');

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
  try {
    const user = await getCurrentUser();
    return { user, error: null };
  } catch (error) {
    logger.error(
      'Check auth error:',
      error instanceof Error ? error : new Error(String(error))
    );
    return { user: null, error };
  }
}
