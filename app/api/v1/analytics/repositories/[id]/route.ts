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

interface SyncOptions {
  syncMetrics?: boolean;
  syncPullRequests?: boolean;
  syncContributors?: boolean;
  syncCommits?: boolean;
}

interface SyncResult {
  repositoryId: string;
  synced: string[];
  errors: Array<{
    type: string;
    error: string;
  }>;
  timestamp?: string;
}

// Helper function to sync data with error handling
async function syncWithErrorHandling(params: {
  analyticsService: AnalyticsService;
  repositoryId: string;
  syncType: string;
  syncFunction: () => Promise<void>;
  results: SyncResult;
}): Promise<void> {
  const { repositoryId, syncType, syncFunction, results } = params;
  try {
    await syncFunction();
    results.synced.push(syncType);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to sync ${syncType}`, {
      repositoryId,
      error: errorMessage,
    });
    results.errors.push({
      type: syncType,
      error: errorMessage || 'An unexpected error occurred',
    });
  }
}

// Helper function to authenticate user and initialize analytics service
async function authenticateAndInitialize(userId: string) {
  const analyticsService = new AnalyticsService(userId);

  try {
    await analyticsService.initialize();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('No active GitHub integration')
    ) {
      return {
        error: 'GitHub integration required',
        requiresAuth: true,
        status: 400,
      };
    }
    throw error;
  }

  return { analyticsService };
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
    const authResult = await authenticateAndInitialize(user.id);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error, requiresAuth: authResult.requiresAuth },
        { status: authResult.status }
      );
    }

    // Get repository analytics
    const analytics =
      await authResult.analyticsService.getRepositoryAnalytics(repositoryId);

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
    const syncOptions: SyncOptions = {
      syncMetrics: body.syncMetrics !== false,
      syncPullRequests: body.syncPullRequests !== false,
      syncContributors: body.syncContributors !== false,
      syncCommits: body.syncCommits !== false,
    };

    const authResult = await authenticateAndInitialize(user.id);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error, requiresAuth: authResult.requiresAuth },
        { status: authResult.status }
      );
    }

    const { analyticsService } = authResult;

    // Verify repository belongs to user
    const repository = await analyticsService.getRepository(repositoryId);
    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    const results: SyncResult = {
      repositoryId,
      synced: [],
      errors: [],
    };

    // Sync each type of data based on options
    if (syncOptions.syncMetrics) {
      await syncWithErrorHandling({
        analyticsService,
        repositoryId,
        syncType: 'metrics',
        syncFunction: () =>
          analyticsService.syncRepositoryMetrics(repositoryId),
        results,
      });
    }

    if (syncOptions.syncPullRequests) {
      await syncWithErrorHandling({
        analyticsService,
        repositoryId,
        syncType: 'pull_requests',
        syncFunction: () => analyticsService.syncPullRequests(repositoryId),
        results,
      });
    }

    if (syncOptions.syncContributors) {
      await syncWithErrorHandling({
        analyticsService,
        repositoryId,
        syncType: 'contributors',
        syncFunction: () => analyticsService.syncContributors(repositoryId),
        results,
      });
    }

    if (syncOptions.syncCommits) {
      await syncWithErrorHandling({
        analyticsService,
        repositoryId,
        syncType: 'commits',
        syncFunction: () => analyticsService.syncCommitAnalytics(repositoryId),
        results,
      });
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
