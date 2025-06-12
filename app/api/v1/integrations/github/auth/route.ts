/**
 * GitHub OAuth Integration API
 * Handles GitHub OAuth flow for analytics integration
 */

import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

/**
 * Initiate GitHub OAuth flow
 */
export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // GitHub OAuth configuration
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;
    const scope = 'repo,read:user,user:email';

    // Generate cryptographically secure state parameter
    const stateData = {
      userId: user.id,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    // Encrypt the state data to prevent tampering
    const encryptedState = encrypt(JSON.stringify(stateData));
    const state = Buffer.from(JSON.stringify(encryptedState)).toString(
      'base64url'
    );

    // Store state in database for validation on callback
    const { error: stateError } = await supabase.from('oauth_states').insert({
      state,
      user_id: user.id,
      provider: 'github',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    if (stateError) {
      logger.error('Failed to store OAuth state', { error: stateError });
      return NextResponse.json(
        { error: 'Failed to initiate OAuth flow' },
        { status: 500 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'GitHub OAuth not configured' },
        { status: 500 }
      );
    }

    // Build GitHub OAuth URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('scope', scope);
    githubAuthUrl.searchParams.set('state', state);
    githubAuthUrl.searchParams.set('allow_signup', 'false');

    return NextResponse.json({
      success: true,
      authUrl: githubAuthUrl.toString(),
    });
  } catch (error) {
    logger.error('GitHub OAuth initiation failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
