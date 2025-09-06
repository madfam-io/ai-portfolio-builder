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
import { type RouteContext } from '@/lib/api/versioning';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import { prisma } from '@/lib/db/prisma';

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

      // Fetch published portfolio by subdomain
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          subdomain: subdomain,
          status: 'PUBLISHED',
        },
      });

      if (!portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Update view count
      try {
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            totalViews: (portfolio.totalViews || 0) + 1,
          },
        });
      } catch (updateError) {
        // Log error but don't fail the request
        logger.error('Failed to update view count:', updateError as Error);
      }

      // Transform to API format
      const responsePortfolio = transformDbPortfolioToApi(portfolio as any);

      // Remove sensitive data for public view
      const publicPortfolio = {
        ...responsePortfolio,
        userId: undefined,
        aiSettings: undefined,
      };

      return apiSuccess({
        portfolio: publicPortfolio,
        meta: {
          views: portfolio.totalViews || 0,
          publishedAt: portfolio.publishedAt,
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
