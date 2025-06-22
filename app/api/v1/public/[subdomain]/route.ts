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

import {
  apiSuccess,
  apiError,
  versionedApiHandler,
} from '@/lib/api/response-helpers';
import { RouteContext } from '@/lib/api/versioning';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';

// Using RouteContext from versioning

/**
 * GET /api/v1/public/[subdomain]
 * Fetch a public portfolio by subdomain (no auth required)
 */
export const GET = versionedApiHandler(
  async (_request, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const subdomain = params.subdomain;
      if (!subdomain || typeof subdomain !== 'string') {
        return apiError('Invalid subdomain', { status: 400 });
      }

      if (!subdomain) {
        return apiError('Subdomain is required', { status: 400 });
      }

      // Create Supabase client
      const supabase = await createClient();
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Fetch published portfolio by subdomain
      const { data: portfolio, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('status', 'published')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return apiError('Portfolio not found', { status: 404 });
        }
        logger.error('Database error fetching public portfolio:', fetchError);
        return apiError('Failed to fetch portfolio', { status: 500 });
      }

      if (!portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Update view count
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          views: (portfolio.views || 0) + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('id', portfolio.id);

      if (updateError) {
        // Log error but don't fail the request
        logger.error('Failed to update view count:', updateError);
      }

      // Transform to API format
      const responsePortfolio = transformDbPortfolioToApi(portfolio);

      // Remove sensitive data for public view
      const publicPortfolio = {
        ...responsePortfolio,
        userId: undefined,
        aiSettings: undefined,
      };

      return apiSuccess({
        portfolio: publicPortfolio,
        meta: {
          views: portfolio.views || 0,
          publishedAt: portfolio.published_at,
        },
      });
    } catch (error) {
      logger.error(
        'Unexpected error in GET /api/v1/public/[subdomain]:',
        error as Error
      );
      return apiError('Internal server error', { status: 500 });
    }
  }
);
