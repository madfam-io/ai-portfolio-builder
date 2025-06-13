import { NextRequest, NextResponse } from 'next/server';

import { AnalyticsService } from '@/lib/services/analyticsService';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Individual Repository Analytics API
 * Manages specific repository analytics and sync
 */

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Get analytics for a specific repository
 */
export async function GET(
  _: NextRequest,
  { params }: RouteParams
): Promise<Response> {
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

    const repositoryId = params.id;
    const analyticsService = new AnalyticsService(user.id);

    try {
      await analyticsService.initialize();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('No active GitHub integration')
      ) {
        return NextResponse.json(
          { error: 'GitHub integration required', requiresAuth: true },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get repository analytics
    const analytics =
      await analyticsService.getRepositoryAnalytics(repositoryId);

    if (!analytics) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch repository analytics', {
      repositoryId: params.id,
      error: errorMessage,
    });
    return NextResponse.json(
      { error: errorMessage || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Sync specific repository data
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
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

    const repositoryId = params.id;
    const body = await request.json().catch(() => ({}));
    const {
      syncMetrics = true,
      syncPullRequests = true,
      syncContributors = true,
      syncCommits = true,
    } = body;

    const analyticsService = new AnalyticsService(user.id);

    try {
      await analyticsService.initialize();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('No active GitHub integration')
      ) {
        return NextResponse.json(
          { error: 'GitHub integration required', requiresAuth: true },
          { status: 400 }
        );
      }
      throw error;
    }

    // Verify repository belongs to user
    const repository = await analyticsService.getRepository(repositoryId);
    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    const results: {
      repositoryId: string;
      synced: string[];
      errors: Array<{
        type: string;
        error: string;
      }>;
      timestamp?: string;
    } = {
      repositoryId,
      synced: [],
      errors: [],
    };

    // Sync metrics
    if (syncMetrics) {
      try {
        await analyticsService.syncRepositoryMetrics(repositoryId);
        results.synced.push('metrics');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to sync metrics', {
          repositoryId,
          error: errorMessage,
        });
        results.errors.push({
          type: 'metrics',
          error: errorMessage || 'An unexpected error occurred',
        });
      }
    }

    // Sync pull requests
    if (syncPullRequests) {
      try {
        await analyticsService.syncPullRequests(repositoryId);
        results.synced.push('pull_requests');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to sync pull requests', {
          repositoryId,
          error: errorMessage,
        });
        results.errors.push({
          type: 'pull_requests',
          error: errorMessage || 'An unexpected error occurred',
        });
      }
    }

    // Sync contributors
    if (syncContributors) {
      try {
        await analyticsService.syncContributors(repositoryId);
        results.synced.push('contributors');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to sync contributors', {
          repositoryId,
          error: errorMessage,
        });
        results.errors.push({
          type: 'contributors',
          error: errorMessage || 'An unexpected error occurred',
        });
      }
    }

    // Sync commit analytics
    if (syncCommits) {
      try {
        await analyticsService.syncCommitAnalytics(repositoryId);
        results.synced.push('commits');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to sync commits', {
          repositoryId,
          error: errorMessage,
        });
        results.errors.push({
          type: 'commits',
          error: errorMessage || 'An unexpected error occurred',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to sync repository', {
      repositoryId: params.id,
      error: errorMessage,
    });
    return NextResponse.json(
      { error: errorMessage || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
