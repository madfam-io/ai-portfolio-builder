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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (!code) {
    logger.error('No code provided in auth callback');
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=No authorization code provided`,
        requestUrl.origin
      )
    );
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      logger.error('Supabase client not configured');
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=Authentication service not configured`,
          requestUrl.origin
        )
      );
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    logger.info('Auth callback successful, redirecting to:', { next });
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    logger.error('Unexpected error in auth callback:', { error });
    return NextResponse.redirect(
      new URL(`/auth/login?error=Authentication failed`, requestUrl.origin)
    );
  }
}
