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
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    // Verify API key for security
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.CRON_API_KEY) {
      logger.warn('Unauthorized cron job attempt: analytics');
      return new Response('Unauthorized', { status: 401 });
    }

    logger.info('Starting analytics aggregation cron job');

    const aggregationTasks = [];
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // 1. Aggregate portfolio views
    aggregationTasks.push(
      prisma.portfolioView
        .findMany({
          where: {
            createdAt: {
              gte: sixHoursAgo,
            },
          },
          select: {
            portfolioId: true,
          },
        })
        .then(async (result: Array<{ portfolioId: string }>) => {
          const viewCounts: Record<string, number> = {};
          result.forEach(view => {
            viewCounts[view.portfolioId] =
              (viewCounts[view.portfolioId] || 0) + 1;
          });

          // Update portfolio statistics
          await Promise.all(
            Object.entries(viewCounts).map(async ([portfolioId, count]) => {
              // First, get the current total_views
              const currentData = await prisma.portfolio.findUnique({
                where: { id: portfolioId },
                select: { totalViews: true },
              });

              const currentViews = currentData?.totalViews || 0;

              // Then update with the new total
              return prisma.portfolio.update({
                where: { id: portfolioId },
                data: {
                  totalViews: currentViews + count,
                  viewsLast6h: count,
                },
              });
            })
          );

          return {
            task: 'portfolio_views',
            processed: Object.keys(viewCounts).length,
            totalViews: Object.values(viewCounts).reduce((a, b) => a + b, 0),
          };
        })
        .catch((error: any) => ({
          task: 'portfolio_views',
          processed: 0,
          error,
        }))
    );

    // 2. Calculate user engagement metrics
    aggregationTasks.push(
      prisma.userActivity
        .findMany({
          where: {
            createdAt: {
              gte: sixHoursAgo,
            },
          },
          select: {
            userId: true,
            action: true,
            createdAt: true,
          },
        })
        .then(
          async (
            result: Array<{ userId: string; action: string; createdAt: Date }>
          ) => {
            const userMetrics: Record<string, any> = {};
            result.forEach(activity => {
              if (!userMetrics[activity.userId]) {
                userMetrics[activity.userId] = {
                  actions: [],
                  lastActive: activity.createdAt,
                };
              }
              userMetrics[activity.userId].actions.push(activity.action);
            });

            // Cache metrics in Redis/KV
            if (kv) {
              const cachePromises = Object.entries(userMetrics).map(
                ([userId, metrics]) =>
                  kv.set(`user:metrics:${userId}`, metrics, { ex: 21600 }) // 6 hours TTL
              );
              await Promise.all(cachePromises);
            }

            return {
              task: 'user_engagement',
              processed: Object.keys(userMetrics).length,
              totalActions: result.length,
            };
          }
        )
        .catch((error: any) => ({
          task: 'user_engagement',
          processed: 0,
          error,
        }))
    );

    // 3. Generate revenue analytics
    aggregationTasks.push(
      prisma.payment
        .findMany({
          where: {
            createdAt: {
              gte: sixHoursAgo,
            },
            status: 'SUCCEEDED',
          },
          select: {
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        })
        .then(
          async (
            result: Array<{
              amount: number;
              currency: string;
              status: string;
              createdAt: Date;
            }>
          ) => {
            const revenue = {
              total: 0,
              byHour: {} as Record<string, number>,
              byCurrency: {} as Record<string, number>,
              count: result.length,
            };

            result.forEach(payment => {
              revenue.total += payment.amount;
              const hour = new Date(payment.createdAt).getHours();
              revenue.byHour[hour] =
                (revenue.byHour[hour] || 0) + payment.amount;
              revenue.byCurrency[payment.currency] =
                (revenue.byCurrency[payment.currency] || 0) + payment.amount;
            });

            // Store in analytics table
            await prisma.revenueAnalytics.create({
              data: {
                periodStart: sixHoursAgo,
                periodEnd: now,
                totalRevenue: revenue.total,
                transactionCount: revenue.count,
                metrics: revenue,
              },
            });

            // Cache current revenue metrics
            if (kv) {
              await kv.set('analytics:revenue:current', revenue, { ex: 21600 });
            }

            return {
              task: 'revenue_analytics',
              processed: revenue.count,
              totalRevenue: revenue.total,
            };
          }
        )
        .catch((error: any) => ({
          task: 'revenue_analytics',
          processed: 0,
          error,
        }))
    );

    // 4. Calculate conversion funnel metrics
    aggregationTasks.push(
      prisma.funnelEvent
        .findMany({
          where: {
            createdAt: {
              gte: sixHoursAgo,
            },
          },
          select: {
            eventType: true,
            userId: true,
            createdAt: true,
          },
        })
        .then(
          async (
            result: Array<{
              eventType: string;
              userId: string | null;
              createdAt: Date;
            }>
          ) => {
            const funnel = {
              visitors: new Set(),
              signups: new Set(),
              created_portfolio: new Set(),
              published: new Set(),
              paid: new Set(),
            };

            result.forEach(event => {
              switch (event.eventType) {
                case 'PAGE_VIEW':
                  funnel.visitors.add(event.userId);
                  break;
                case 'SIGNUP':
                  funnel.signups.add(event.userId);
                  break;
                case 'PORTFOLIO_CREATED':
                  funnel.created_portfolio.add(event.userId);
                  break;
                case 'PORTFOLIO_PUBLISHED':
                  funnel.published.add(event.userId);
                  break;
                case 'PAYMENT_COMPLETED':
                  funnel.paid.add(event.userId);
                  break;
              }
            });

            const metrics = {
              visitors: funnel.visitors.size,
              signups: funnel.signups.size,
              portfolios_created: funnel.created_portfolio.size,
              portfolios_published: funnel.published.size,
              conversions: funnel.paid.size,
              conversion_rate:
                funnel.visitors.size > 0
                  ? ((funnel.paid.size / funnel.visitors.size) * 100).toFixed(2)
                  : 0,
            };

            // Cache funnel metrics
            if (kv) {
              await kv.set('analytics:funnel:current', metrics, { ex: 21600 });
            }

            return {
              task: 'conversion_funnel',
              processed: result.length,
              metrics,
            };
          }
        )
        .catch((error: any) => ({
          task: 'conversion_funnel',
          processed: 0,
          error,
        }))
    );

    // Execute all aggregation tasks in parallel
    const results = await Promise.allSettled(aggregationTasks);

    const summary = results.map(result =>
      result.status === 'fulfilled' ? result.value : { error: 'Task failed' }
    );

    const totalProcessed = summary.reduce(
      (acc, task) =>
        acc +
        (typeof task === 'object' && 'processed' in task ? task.processed : 0),
      0
    );

    logger.info('Analytics aggregation completed', {
      totalProcessed,
      tasks: summary,
    });

    return NextResponse.json({
      success: true,
      message: 'Analytics aggregation completed',
      totalProcessed,
      tasks: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Analytics cron job failed', { error });
    return NextResponse.json(
      {
        error: 'Analytics aggregation failed',
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
    endpoint: '/api/cron/analytics',
    schedule: '0 */6 * * *', // Every 6 hours
  });
}
