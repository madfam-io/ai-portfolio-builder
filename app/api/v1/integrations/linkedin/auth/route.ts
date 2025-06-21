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
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/v1/integrations/linkedin/auth
 * Initiate LinkedIn OAuth flow
 */
export async function GET(request: NextRequest) {
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize LinkedIn client
    const linkedInClient = new LinkedInClient();

    if (!linkedInClient.isConfigured()) {
      return NextResponse.json(
        { error: 'LinkedIn integration not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = uuidv4();

    // Store state in database for verification
    const { error: stateError } = await supabase.from('oauth_states').insert({
      state,
      user_id: user.id,
      provider: 'linkedin',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    if (stateError) {
      logger.error('Failed to store OAuth state:', stateError);
      return NextResponse.json(
        { error: 'Failed to initiate OAuth flow' },
        { status: 500 }
      );
    }

    // Get redirect URL from query params (for redirect after callback)
    const redirectUrl =
      request.nextUrl.searchParams.get('redirect') || '/dashboard/integrations';

    // Store redirect URL in session
    const response = NextResponse.json({
      authUrl: linkedInClient.getAuthorizationUrl(state),
    });

    // Set redirect URL as cookie for callback
    response.cookies.set('linkedin_redirect', redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    logger.error(
      'LinkedIn auth initialization failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'Failed to initialize LinkedIn authentication' },
      { status: 500 }
    );
  }
}
