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

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=service_unavailable',
          request.url
        )
      );
    }

    // Verify state parameter
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('user_id, expires_at')
      .eq('state', state)
      .eq('provider', 'linkedin')
      .single();

    if (stateError || !stateData) {
      logger.error('Invalid OAuth state:', stateError);
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=invalid_state', request.url)
      );
    }

    // Check if state has expired
    if (new Date(stateData.expires_at) < new Date()) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=state_expired', request.url)
      );
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('state', state);

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

    // Store LinkedIn connection in database
    const { error: upsertError } = await supabase
      .from('linkedin_connections')
      .upsert({
        user_id: stateData.user_id,
        linkedin_id: profile.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString(),
        scope: tokenData.scope,
        profile_data: profile,
        connected_at: new Date().toISOString(),
        last_sync_at: new Date().toISOString(),
      });

    if (upsertError) {
      logger.error('Failed to store LinkedIn connection:', upsertError);
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
