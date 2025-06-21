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
import { logger } from '@/lib/utils/logger';

/**
 * GitHub Integration Disconnect API
 * Removes GitHub integration for the authenticated user
 */

export async function POST(): Promise<Response> {
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

    // Delete GitHub integration
    const { error: deleteError } = await supabase
      .from('github_integrations')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      logger.error('Failed to delete GitHub integration', {
        error: deleteError,
      });
      return NextResponse.json(
        { error: 'Failed to disconnect GitHub' },
        { status: 500 }
      );
    }

    // Delete associated repositories
    const { error: repoDeleteError } = await supabase
      .from('repositories')
      .delete()
      .eq('user_id', user.id);

    if (repoDeleteError) {
      logger.error('Failed to delete repositories', { error: repoDeleteError });
      // Non-critical error, continue
    }

    // Clean up any OAuth states
    await supabase
      .from('oauth_states')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'github');

    // Log analytics event
    try {
      await fetch('/api/v1/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'github_disconnected',
          properties: {
            user_id: user.id,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      // Non-critical error
      logger.error('Failed to log analytics event', { error });
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub integration disconnected successfully',
    });
  } catch (error) {
    logger.error('GitHub disconnect failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
