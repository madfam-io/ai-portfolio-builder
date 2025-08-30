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

    const supabase = await createClient();
    if (!supabase) {
      logger.error('Supabase client not available');
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const aggregationTasks = [];
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // 1. Aggregate portfolio views
    aggregationTasks.push(
      supabase
        .from('portfolio_views')
        .select('portfolio_id, count')
        .gte('created_at', sixHoursAgo.toISOString())
        .then(async result => {
          if (result.error) throw result.error;

          const viewCounts: Record<string, number> = {};
          result.data?.forEach(view => {
            viewCounts[view.portfolio_id] =
              (viewCounts[view.portfolio_id] || 0) + 1;
          });

          // Update portfolio statistics
          await Promise.all(
            Object.entries(viewCounts).map(async ([portfolioId, count]) => {
              // First, get the current total_views
              const { data: currentData } = await supabase
                .from('portfolios')
                .select('total_views')
                .eq('id', portfolioId)
                .single();

              const currentViews = currentData?.total_views || 0;

              // Then update with the new total
              return supabase
                .from('portfolios')
                .update({
                  total_views: currentViews + count,
                  views_last_6h: count,
                })
                .eq('id', portfolioId);
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
      supabase
        .from('user_activities')
        .select('user_id, action, created_at')
        .gte('created_at', sixHoursAgo.toISOString())
        .then(async result => {
          if (result.error) throw result.error;

          const userMetrics: Record<string, any> = {};
          result.data?.forEach(activity => {
            if (!userMetrics[activity.user_id]) {
              userMetrics[activity.user_id] = {
                actions: [],
                lastActive: activity.created_at,
              };
            }
            userMetrics[activity.user_id].actions.push(activity.action);
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
            totalActions: result.data?.length || 0,
          };
        })
        .catch((error: any) => ({
          task: 'user_engagement',
          processed: 0,
          error,
        }))
    );

    // 3. Generate revenue analytics
    aggregationTasks.push(
      supabase
        .from('payments')
        .select('amount, currency, status, created_at')
        .gte('created_at', sixHoursAgo.toISOString())
        .eq('status', 'succeeded')
        .then(async result => {
          if (result.error) throw result.error;

          const revenue = {
            total: 0,
            byHour: {} as Record<string, number>,
            byCurrency: {} as Record<string, number>,
            count: result.data?.length || 0,
          };

          result.data?.forEach(payment => {
            revenue.total += payment.amount;
            const hour = new Date(payment.created_at).getHours();
            revenue.byHour[hour] = (revenue.byHour[hour] || 0) + payment.amount;
            revenue.byCurrency[payment.currency] =
              (revenue.byCurrency[payment.currency] || 0) + payment.amount;
          });

          // Store in analytics table
          await supabase.from('revenue_analytics').insert({
            period_start: sixHoursAgo,
            period_end: now,
            total_revenue: revenue.total,
            transaction_count: revenue.count,
            metrics: revenue,
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
        })
        .catch((error: any) => ({
          task: 'revenue_analytics',
          processed: 0,
          error,
        }))
    );

    // 4. Calculate conversion funnel metrics
    aggregationTasks.push(
      supabase
        .from('funnel_events')
        .select('event_type, user_id, created_at')
        .gte('created_at', sixHoursAgo.toISOString())
        .then(async result => {
          if (result.error) throw result.error;

          const funnel = {
            visitors: new Set(),
            signups: new Set(),
            created_portfolio: new Set(),
            published: new Set(),
            paid: new Set(),
          };

          result.data?.forEach(event => {
            switch (event.event_type) {
              case 'page_view':
                funnel.visitors.add(event.user_id);
                break;
              case 'signup':
                funnel.signups.add(event.user_id);
                break;
              case 'portfolio_created':
                funnel.created_portfolio.add(event.user_id);
                break;
              case 'portfolio_published':
                funnel.published.add(event.user_id);
                break;
              case 'payment_completed':
                funnel.paid.add(event.user_id);
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
            processed: result.data?.length || 0,
            metrics,
          };
        })
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
