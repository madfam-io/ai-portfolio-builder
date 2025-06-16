import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

/**
 * GitHub OAuth Callback API
 * Handles GitHub OAuth callback and stores integration
 */

/**
 * Handle GitHub OAuth callback
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      logger.error('GitHub OAuth error', { error });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=invalid_callback`
      );
    }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Verify state parameter for CSRF protection
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=unauthorized`
      );
    }

    // Retrieve and validate OAuth state from database
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('user_id', user.id)
      .eq('provider', 'github')
      .is('used_at', null)
      .single();

    if (
      stateError !== null ||
      oauthState === null ||
      oauthState === undefined
    ) {
      logger.error('Invalid OAuth state', { stateError, state });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=invalid_state`
      );
    }

    // Check if state has expired
    if (new Date(oauthState.expires_at) < new Date()) {
      logger.error('OAuth state expired', { state });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=state_expired`
      );
    }

    // Decrypt and validate state data
    try {
      const encryptedState = JSON.parse(
        Buffer.from(state, 'base64url').toString()
      );
      const stateData = JSON.parse(decrypt(encryptedState));

      // Validate state contents
      if (stateData.userId !== user.id) {
        throw new Error('State user ID mismatch');
      }

      // Check timestamp to prevent replay attacks (10 minute window)
      if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
        throw new Error('State timestamp expired');
      }
    } catch (error) {
      logger.error('State validation failed', { error });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=invalid_state`
      );
    }

    // Mark state as used to prevent reuse
    await supabase
      .from('oauth_states')
      .update({ used_at: new Date().toISOString() })
      .eq('id', oauthState.id);

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error !== undefined && tokenData.error !== null) {
      logger.error('GitHub token exchange failed', { error: tokenData });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=token_exchange_failed`
      );
    }

    // Fetch GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json();

    if (!userResponse.ok) {
      logger.error('Failed to fetch GitHub user', { error: githubUser });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=user_fetch_failed`
      );
    }

    // Encrypt the access token before storage
    const encryptedToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken =
      tokenData.refresh_token !== undefined && tokenData.refresh_token !== null
        ? encrypt(tokenData.refresh_token)
        : null;

    // Store GitHub integration with encrypted tokens
    const { error: integrationError } = await supabase
      .from('github_integrations')
      .upsert({
        user_id: user.id,
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        github_email: githubUser.email || null,
        avatar_url: githubUser.avatar_url || null,
        encrypted_access_token: encryptedToken.encrypted,
        access_token_iv: encryptedToken.iv,
        access_token_tag: encryptedToken.tag,
        encrypted_refresh_token: encryptedRefreshToken?.encrypted || null,
        refresh_token_iv: encryptedRefreshToken?.iv || null,
        refresh_token_tag: encryptedRefreshToken?.tag || null,
        status: 'active',
        permissions: {},
        scope: tokenData.scope,
        rate_limit_remaining: 5000,
        rate_limit_reset_at: new Date(
          Date.now() + 60 * 60 * 1000
        ).toISOString(), // 1 hour from now
        last_synced_at: new Date().toISOString(),
        encryption_version: 1, // Track encryption version for future rotation
      });

    if (integrationError) {
      logger.error('Failed to store GitHub integration', {
        error: integrationError,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=integration_store_failed`
      );
    }

    // Redirect to analytics dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/analytics?connected=true`
    );
  } catch (error) {
    logger.error('GitHub OAuth callback failed', { error });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=callback_failed`
    );
  }
}
