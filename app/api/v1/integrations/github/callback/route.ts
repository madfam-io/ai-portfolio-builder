import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

/**
 * GitHub OAuth Callback API
 * Handles GitHub OAuth callback and stores integration
 */

interface StateData {
  userId: string;
  timestamp: number;
}

// Helper function to validate OAuth state
async function validateOAuthState(
  state: string,
  userId: string,
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
) {
  const { data: oauthState, error: stateError } = await supabase!
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .eq('user_id', userId)
    .eq('provider', 'github')
    .is('used_at', null)
    .single();

  if (stateError !== null || oauthState === null || oauthState === undefined) {
    logger.error('Invalid OAuth state', { stateError, state });
    return null;
  }

  // Check if state has expired
  if (new Date(oauthState.expires_at) < new Date()) {
    logger.error('OAuth state expired', { state });
    return null;
  }

  // Decrypt and validate state data
  try {
    const encryptedState = JSON.parse(
      Buffer.from(state, 'base64url').toString()
    );
    const stateData = JSON.parse(decrypt(encryptedState)) as StateData;

    // Validate state contents
    if (stateData.userId !== userId) {
      throw new Error('State user ID mismatch');
    }

    // Check timestamp to prevent replay attacks (10 minute window)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new Error('State timestamp expired');
    }

    return oauthState;
  } catch (error) {
    logger.error('State validation failed', { error });
    return null;
  }
}

// Helper function to exchange code for access token
async function exchangeCodeForToken(code: string) {
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
    return null;
  }

  return tokenData;
}

// Helper function to fetch GitHub user info
async function fetchGitHubUser(accessToken: string) {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  const githubUser = await userResponse.json();

  if (!userResponse.ok) {
    logger.error('Failed to fetch GitHub user', { error: githubUser });
    return null;
  }

  return githubUser;
}

// Helper function to store GitHub integration
async function storeGitHubIntegration(
  supabase: ReturnType<typeof createClient> extends Promise<infer T>
    ? T
    : never,
  user: { id: string },
  githubUser: {
    id: number;
    login: string;
    email?: string | null;
    avatar_url?: string | null;
  },
  tokenData: {
    access_token: string;
    refresh_token?: string | null;
    scope: string;
  }
) {
  // Encrypt the access token before storage
  const encryptedToken = encrypt(tokenData.access_token);
  const encryptedRefreshToken =
    tokenData.refresh_token !== undefined && tokenData.refresh_token !== null
      ? encrypt(tokenData.refresh_token)
      : null;

  // Store GitHub integration with encrypted tokens
  const { error: integrationError } = await supabase!
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
      rate_limit_reset_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      last_synced_at: new Date().toISOString(),
      encryption_version: 1, // Track encryption version for future rotation
    });

  return integrationError;
}

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
    const oauthState = await validateOAuthState(state, user.id, supabase);
    if (!oauthState) {
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
    const tokenData = await exchangeCodeForToken(code);
    if (!tokenData) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=token_exchange_failed`
      );
    }

    // Fetch GitHub user info
    const githubUser = await fetchGitHubUser(tokenData.access_token);
    if (!githubUser) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=user_fetch_failed`
      );
    }

    // Store GitHub integration
    const integrationError = await storeGitHubIntegration(
      supabase,
      user,
      githubUser,
      tokenData
    );

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
