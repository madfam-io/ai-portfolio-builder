/**
 * User limits endpoint
 *
 * Returns current usage and limits for the authenticated user.
 * Used by the frontend to show usage indicators and enforce limits.
 */

import { NextResponse } from 'next/server';

import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { createClient } from '@/lib/supabase/server';
import { AppError } from '@/types/errors';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/v1/user/limits
 *
 * Get current user usage and plan limits
 */
async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { user } = request.auth;
    const supabase = await createClient();
    if (!supabase) {
      throw new AppError(
        'DATABASE_NOT_AVAILABLE',
        'Database service unavailable',
        503
      );
    }

    // Call the database function to get limits
    const { data, error } = await supabase.rpc('check_user_plan_limits', {
      user_uuid: user.id,
    });

    if (error) {
      logger.error('Failed to check user limits', {
        error,
        userId: user.id,
      });
      throw new AppError(
        'LIMITS_CHECK_FAILED',
        'Failed to check user limits',
        500
      );
    }

    if (data?.error) {
      logger.error('Database function returned error', {
        error: data.error,
        userId: user.id,
      });
      throw new AppError('USER_NOT_FOUND', data.error, 404);
    }

    logger.info('User limits retrieved successfully', {
      userId: user.id,
      subscriptionTier: data.subscription_tier,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Failed to get user limits', { error });

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to get user limits',
        code: 'LIMITS_FAILED',
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
