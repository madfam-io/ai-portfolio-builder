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
// getCurrentUser import removed as it's not used in this simplified callback
import { prisma } from '@/lib/db/prisma';
import { LinkedInClient } from '@/lib/services/integrations/linkedin/client';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/v1/integrations/linkedin/callback
 * Handle LinkedIn OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      logger.error('LinkedIn OAuth error:', { error, errorDescription });
      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=missing_parameters', request.url)
      );
    }

    // Verify state parameter from session
    const sessionData = await prisma.session.findUnique({
      where: { sessionToken: state },
      select: { userId: true, expires: true },
    });

    if (!sessionData) {
      logger.error('Invalid OAuth state: session not found');
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=invalid_state', request.url)
      );
    }

    // Check if state has expired
    if (sessionData.expires < new Date()) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=state_expired', request.url)
      );
    }

    // Delete used state
    await prisma.session.delete({ where: { sessionToken: state } });

    // Exchange code for access token
    const linkedInClient = new LinkedInClient();
    let tokenData;

    try {
      tokenData = await linkedInClient.exchangeCodeForToken(code);
    } catch (error) {
      logger.error(
        'Token exchange failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=token_exchange_failed',
          request.url
        )
      );
    }

    // Fetch user profile to get LinkedIn ID
    let profile;
    try {
      profile = await linkedInClient.fetchProfile(tokenData.access_token);
    } catch (error) {
      logger.error(
        'Profile fetch failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=profile_fetch_failed',
          request.url
        )
      );
    }

    // Store LinkedIn connection in Account table
    try {
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'linkedin',
            providerAccountId: profile.id,
          },
        },
        create: {
          userId: sessionData.userId,
          type: 'oauth',
          provider: 'linkedin',
          providerAccountId: profile.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          scope: tokenData.scope,
          token_type: 'Bearer',
        },
        update: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          scope: tokenData.scope,
        },
      });
    } catch (upsertError) {
      logger.error('Failed to store LinkedIn connection:', upsertError as any);
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=storage_failed', request.url)
      );
    }

    // Get redirect URL from cookie
    const redirectUrl =
      request.cookies.get('linkedin_redirect')?.value ||
      '/dashboard/integrations';

    // Clear the redirect cookie
    const response = NextResponse.redirect(
      new URL(`${redirectUrl}?linkedin=connected`, request.url)
    );
    response.cookies.delete('linkedin_redirect');

    return response;
  } catch (error) {
    logger.error(
      'LinkedIn callback error:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=callback_failed', request.url)
    );
  }
}
