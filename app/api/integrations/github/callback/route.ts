/**
 * GitHub OAuth Callback API
 * Handles GitHub OAuth callback and stores integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Handle GitHub OAuth callback
 */
export async function GET(request: NextRequest) {
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

    const supabase = createClient();

    // Verify state matches user ID (security check)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=invalid_state`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      logger.error('GitHub token exchange failed', { error: tokenData });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=token_exchange_failed`
      );
    }

    // Fetch GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json();

    if (!userResponse.ok) {
      logger.error('Failed to fetch GitHub user', { error: githubUser });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=user_fetch_failed`
      );
    }

    // Store GitHub integration
    const { error: integrationError } = await supabase
      .from('github_integrations')
      .upsert({
        user_id: user.id,
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        access_token: tokenData.access_token, // TODO: Encrypt in production
        refresh_token: tokenData.refresh_token || null,
        status: 'active',
        permissions: {},
        scope: tokenData.scope,
        rate_limit_remaining: 5000,
        rate_limit_reset_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        last_synced_at: new Date().toISOString(),
      });

    if (integrationError) {
      logger.error('Failed to store GitHub integration', { error: integrationError });
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