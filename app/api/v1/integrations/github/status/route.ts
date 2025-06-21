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

import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

/**
 * GitHub Integration Status API
 * Returns the current GitHub connection status for the authenticated user
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

    // Fetch GitHub integration
    const { data: integration, error: integrationError } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (integrationError || !integration) {
      // No active integration found
      return NextResponse.json({
        isConnected: false,
      });
    }

    // Decrypt access token to check rate limits
    let rateLimit = null;
    try {
      const decryptedToken = decrypt({
        encrypted: integration.encrypted_access_token,
        iv: integration.access_token_iv,
        tag: integration.access_token_tag,
      });

      // Check GitHub API rate limit
      const rateLimitResponse = await fetch(
        'https://api.github.com/rate_limit',
        {
          headers: {
            Authorization: `token ${decryptedToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json();
        rateLimit = {
          limit: rateLimitData.rate.limit,
          remaining: rateLimitData.rate.remaining,
          reset: new Date(rateLimitData.rate.reset * 1000).toISOString(),
        };

        // Update rate limit in database
        await supabase
          .from('github_integrations')
          .update({
            rate_limit_remaining: rateLimitData.rate.remaining,
            rate_limit_reset_at: new Date(
              rateLimitData.rate.reset * 1000
            ).toISOString(),
          })
          .eq('id', integration.id);
      }
    } catch (error) {
      logger.error('Failed to check GitHub rate limit', { error });
    }

    // Return connection status
    return NextResponse.json({
      isConnected: true,
      username: integration.github_username,
      email: integration.github_email || undefined,
      avatarUrl: integration.avatar_url || undefined,
      installedAt: integration.created_at,
      lastSync: integration.last_synced_at || undefined,
      scope: integration.scope ? integration.scope.split(' ') : [],
      rateLimit,
    });
  } catch (error) {
    logger.error('GitHub status check failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
