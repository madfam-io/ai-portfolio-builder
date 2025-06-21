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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RevenueMetricsService } from '@/lib/services/analytics/RevenueMetricsService';
import { z } from 'zod';
import { handleApiError } from '@/lib/api/error-handler';

// Query validation schema
const querySchema = z.object({
  date: z.string().optional(),
  months: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Admin authentication
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

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const params = {
      date: searchParams.get('date') || undefined,
      months: searchParams.get('months') || undefined,
    };

    // Validate query parameters
    const validatedParams = querySchema.parse(params);

    const revenueService = new RevenueMetricsService(supabase);

    // Parse date if provided
    const date = validatedParams.date
      ? new Date(validatedParams.date)
      : new Date();

    // Get comprehensive metrics
    const [metrics, revenueByPlan, customerMetrics, topCustomers] =
      await Promise.all([
        revenueService.calculateMetrics(date),
        revenueService.getRevenueByPlan(),
        revenueService.getCustomerMetrics(),
        revenueService.getTopCustomers(5),
      ]);

    // Get trends if requested
    let trends = null;
    if (validatedParams.months) {
      const monthCount = parseInt(validatedParams.months);
      if (!isNaN(monthCount) && monthCount > 0 && monthCount <= 24) {
        trends = await revenueService.getRevenueTrends(monthCount);
      }
    }

    // Calculate growth rates
    const previousMonth = new Date(date);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMetrics =
      await revenueService.calculateMetrics(previousMonth);

    const mrrGrowth =
      previousMetrics.mrr > 0
        ? ((metrics.mrr - previousMetrics.mrr) / previousMetrics.mrr) * 100
        : 0;

    const customerGrowth =
      previousMetrics.customerCount > 0
        ? ((metrics.customerCount - previousMetrics.customerCount) /
            previousMetrics.customerCount) *
          100
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        revenueByPlan,
        customerMetrics,
        topCustomers,
        trends,
        growth: {
          mrr: Math.round(mrrGrowth * 100) / 100,
          customers: Math.round(customerGrowth * 100) / 100,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
