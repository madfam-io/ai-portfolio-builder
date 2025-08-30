/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    // Verify API key for security
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.CRON_API_KEY) {
      logger.warn('Unauthorized cron job attempt: cleanup');
      return new Response('Unauthorized', { status: 401 });
    }

    logger.info('Starting daily cleanup cron job');

    const supabase = await createClient();
    if (!supabase) {
      logger.error('Supabase client not available');
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const cleanupTasks = [];

    // 1. Clean up expired sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    cleanupTasks.push(
      supabase
        .from('sessions')
        .delete()
        .lt('updated_at', thirtyDaysAgo.toISOString())
        .then(result => ({
          task: 'expired_sessions',
          deleted: result.count || 0,
          error: result.error,
        }))
        .catch((error: any) => ({
          task: 'expired_sessions',
          deleted: 0,
          error,
        }))
    );

    // 2. Clean up orphaned portfolio drafts (older than 90 days with no updates)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    cleanupTasks.push(
      supabase
        .from('portfolios')
        .delete()
        .eq('status', 'draft')
        .lt('updated_at', ninetyDaysAgo.toISOString())
        .then(result => ({
          task: 'orphaned_drafts',
          deleted: result.count || 0,
          error: result.error,
        }))
        .catch((error: any) => ({
          task: 'orphaned_drafts',
          deleted: 0,
          error,
        }))
    );

    // 3. Clean up old analytics events (older than 180 days)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    cleanupTasks.push(
      supabase
        .from('analytics_events')
        .delete()
        .lt('created_at', sixMonthsAgo.toISOString())
        .then(result => ({
          task: 'old_analytics',
          deleted: result.count || 0,
          error: result.error,
        }))
        .catch((error: any) => ({
          task: 'old_analytics',
          deleted: 0,
          error,
        }))
    );

    // 4. Clean up failed payment attempts (older than 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    cleanupTasks.push(
      supabase
        .from('payment_attempts')
        .delete()
        .eq('status', 'failed')
        .lt('created_at', sixtyDaysAgo.toISOString())
        .then(result => ({
          task: 'failed_payments',
          deleted: result.count || 0,
          error: result.error,
        }))
        .catch((error: any) => ({
          task: 'failed_payments',
          deleted: 0,
          error,
        }))
    );

    // Execute all cleanup tasks in parallel
    const results = await Promise.allSettled(cleanupTasks);

    const summary = results.map(result =>
      result.status === 'fulfilled' ? result.value : { error: 'Task failed' }
    );

    const totalDeleted = summary.reduce(
      (acc, task) =>
        acc +
        (typeof task === 'object' && 'deleted' in task ? task.deleted : 0),
      0
    );

    logger.info('Daily cleanup completed', {
      totalDeleted,
      tasks: summary,
    });

    return NextResponse.json({
      success: true,
      message: 'Daily cleanup completed',
      totalDeleted,
      tasks: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cleanup cron job failed', { error });
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/cron/cleanup',
    schedule: '0 2 * * *', // Daily at 2 AM
  });
}
