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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RevenueMetricsService } from '@/lib/services/analytics/RevenueMetricsService';
import { z } from 'zod';
import { handleApiError } from '@/lib/api/error-handler';

// Query validation schema
const querySchema = z.object({
  months: z
    .string()
    .transform(val => parseInt(val))
    .default('12'),
  interval: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const params = querySchema.parse({
      months: searchParams.get('months') || '12',
      interval: searchParams.get('interval') || 'monthly',
    });

    const revenueService = new RevenueMetricsService(supabase);

    // Get revenue trends
    const trends = await revenueService.getRevenueTrends(params.months);

    // Calculate period-over-period growth
    const growth = trends.map((current, index) => {
      if (index === 0) return { ...current, growth: 0 };

      const previous = trends[index - 1];
      if (!previous) return { ...current, growth: 0 };

      const mrrGrowth =
        previous.mrr > 0
          ? ((current.mrr - previous.mrr) / previous.mrr) * 100
          : 0;

      return {
        ...current,
        growth: Math.round(mrrGrowth * 100) / 100,
      };
    });

    // Calculate summary statistics
    const firstTrend = trends[0];
    const lastTrend = trends[trends.length - 1];

    const summary = {
      totalGrowth:
        trends.length > 1 && firstTrend && lastTrend && firstTrend.mrr > 0
          ? Math.round(
              ((lastTrend.mrr - firstTrend.mrr) / firstTrend.mrr) * 10000
            ) / 100
          : 0,
      averageMonthlyGrowth:
        growth.length > 1
          ? Math.round(
              (growth.slice(1).reduce((sum, item) => sum + item.growth, 0) /
                (growth.length - 1)) *
                100
            ) / 100
          : 0,
      highestMrr: Math.max(...trends.map(t => t.mrr)),
      lowestMrr: Math.min(...trends.map(t => t.mrr)),
      averageChurnRate:
        Math.round(
          (trends.reduce((sum, t) => sum + t.churnRate, 0) / trends.length) *
            100
        ) / 100,
    };

    return NextResponse.json({
      success: true,
      data: {
        trends: growth,
        summary,
        period: {
          months: params.months,
          interval: params.interval,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
