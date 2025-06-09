/**
 * Analytics Dashboard API
 * Provides aggregated dashboard data for analytics overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { logger } from '@/lib/utils/logger';

/**
 * Get analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const analyticsService = new AnalyticsService(user.id);
    
    try {
      await analyticsService.initialize();
    } catch (error: any) {
      if (error.message.includes('No active GitHub integration')) {
        return NextResponse.json(
          { error: 'GitHub integration required', requiresAuth: true },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get dashboard data
    const dashboardData = await analyticsService.getDashboardData();

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard data', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}