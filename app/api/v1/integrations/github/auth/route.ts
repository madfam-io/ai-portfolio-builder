/**
 * GitHub OAuth Integration API
 * Handles GitHub OAuth flow for analytics integration
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Initiate GitHub OAuth flow
 */
export async function GET() {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // GitHub OAuth configuration
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;
    const scope = 'repo,read:user,user:email';
    const state = user.id; // Use user ID as state for security

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