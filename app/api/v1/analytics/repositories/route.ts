import { NextResponse } from 'next/server';

import { AnalyticsService } from '@/lib/services/analyticsService';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Analytics Repositories API
 * Manages repository sync and retrieval for analytics
 */

/**
 * Get user's repositories for analytics
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

    const analyticsService = new AnalyticsService(user.id);

    try {
      await analyticsService.initialize();
    } catch (error: unknown) {
      if (error.message.includes('No active GitHub integration')) {
        return NextResponse.json(
          { error: 'GitHub integration required', requiresAuth: true },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get repositories from database
    const repositories = await analyticsService.getRepositories();

    return NextResponse.json({
      success: true,
      data: {
        repositories,
        total: repositories.length,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch repositories', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Sync repositories from GitHub
 */
export async function POST(request: Request): Promise<Response> {
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

    const analyticsService = new AnalyticsService(user.id);

    try {
      await analyticsService.initialize();
    } catch (error: unknown) {
      if (error.message.includes('No active GitHub integration')) {
        return NextResponse.json(
          { error: 'GitHub integration required', requiresAuth: true },
          { status: 400 }
        );
      }
      throw error;
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { force = false } = body;

    // Check if we should force sync or if enough time has passed
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('last_synced_at')
      .eq('user_id', user.id)
      .single();

    const lastSynced = integration?.last_synced_at
      ? new Date(integration.last_synced_at)
      : new Date(0);
    const hoursSinceSync =
      (Date.now() - lastSynced.getTime()) / (1000 * 60 * 60);

    if (!force && hoursSinceSync < 1) {
      return NextResponse.json(
        { error: 'Sync too recent, wait at least 1 hour or use force=true' },
        { status: 429 }
      );
    }

    // Sync repositories
    const repositories = await analyticsService.syncRepositories();

    return NextResponse.json({
      success: true,
      data: {
        repositories,
        synced: repositories.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to sync repositories', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
