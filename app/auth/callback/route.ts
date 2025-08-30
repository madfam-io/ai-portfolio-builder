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
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Redirect to NextAuth callback handler
  logger.info('Redirecting to NextAuth callback handler');
  
  // Forward all search params to NextAuth callback
  const nextAuthUrl = new URL('/api/auth/callback/github', requestUrl.origin);
  requestUrl.searchParams.forEach((value, key) => {
    nextAuthUrl.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(nextAuthUrl);
}
