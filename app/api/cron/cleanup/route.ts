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
import { prisma } from '@/lib/db/prisma';
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

    // Database is available through Prisma

    const cleanupTasks = [];

    // 1. Clean up expired sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    cleanupTasks.push(
      prisma.session.deleteMany({
        where: {
          updatedAt: {
            lt: thirtyDaysAgo,
          },
        },
      })
        .then(result => ({
          task: 'expired_sessions',
          deleted: result.count,
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
      prisma.portfolio.deleteMany({
        where: {
          status: 'DRAFT',
          updatedAt: {
            lt: ninetyDaysAgo,
          },
        },
      })
        .then(result => ({
          task: 'orphaned_drafts',
          deleted: result.count,
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
      prisma.analyticsEvent.deleteMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo,
          },
        },
      })
        .then(result => ({
          task: 'old_analytics',
          deleted: result.count,
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
      prisma.payment.deleteMany({
        where: {
          status: 'FAILED',
          createdAt: {
            lt: sixtyDaysAgo,
          },
        },
      })
        .then(result => ({
          task: 'failed_payments',
          deleted: result.count,
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
