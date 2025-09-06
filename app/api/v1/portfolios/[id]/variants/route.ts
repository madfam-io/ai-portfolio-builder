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
  withAuth,
  type AuthenticatedRequest,
  type RouteContext,
} from '@/lib/api/middleware/auth';
import {
  apiSuccess,
  apiError,
  versionedApiHandler,
} from '@/lib/api/response-helpers';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/prisma';
import type { CreateVariantInput } from '@/types/portfolio-variants';

// Helper function to transform variant data
function transformVariant(variant: any) {
  return {
    id: variant.id,
    portfolioId: variant.portfolioId,
    name: variant.name,
    description: variant.description,
    content: variant.content,
    customization: variant.customization,
    views: variant.views,
    conversions: variant.conversions,
    conversionRate: variant.conversionRate,
    isActive: variant.isActive,
    isControl: variant.isControl,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };
}

// Helper function to verify portfolio ownership
async function verifyPortfolioOwnership(
  portfolioId: string,
  userId: string
) {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    return { portfolio, error: null };
  } catch (error) {
    return { portfolio: null, error };
  }
}

/**
 * GET /api/v1/portfolios/[id]/variants
 * Get all variants for a portfolio
 */
export const GET = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const portfolioId = params.id;
      if (!portfolioId || typeof portfolioId !== 'string') {
        return apiError('Invalid portfolio ID', { status: 400 });
      }

      // Verify user owns the portfolio
      const { portfolio, error: portfolioError } =
        await verifyPortfolioOwnership(portfolioId, request.user.id);

      if (portfolioError || !portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Get all variants
      const variants = await prisma.portfolioVariant.findMany({
        where: {
          portfolioId: portfolioId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Transform to match TypeScript types
      const transformedVariants = variants?.map(transformVariant) || [];

      return apiSuccess({ variants: transformedVariants });
    } catch (error) {
      logger.error(
        'Failed to get portfolio variants:',
        error instanceof Error ? error : new Error(String(error))
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);

/**
 * POST /api/v1/portfolios/[id]/variants
 * Create a new variant for a portfolio
 */
export const POST = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const portfolioId = params.id;
      if (!portfolioId || typeof portfolioId !== 'string') {
        return apiError('Invalid portfolio ID', { status: 400 });
      }
      const body: CreateVariantInput = await request.json();

      // Verify user owns the portfolio
      const { portfolio, error: portfolioError } =
        await verifyPortfolioOwnership(portfolioId, request.user.id);

      if (portfolioError || !portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Copy content from base variant if specified
      let baseContent = {};
      let baseCustomization = {};
      if (body.basedOnVariant) {
        const baseVariant = await prisma.portfolioVariant.findUnique({
          where: { id: body.basedOnVariant },
          select: { content: true, customization: true },
        });

        if (baseVariant) {
          baseContent = baseVariant.content || {};
          baseCustomization = baseVariant.customization || {};
        }
      }

      // Create the variant
      const variant = await prisma.portfolioVariant.create({
        data: {
          portfolioId: portfolioId,
          name: body.name,
          description: (body as any).description || null,
          content: baseContent,
          customization: baseCustomization,
          isActive: true,
          isControl: false,
        },
      });

      // Transform to match TypeScript types
      const transformedVariant = transformVariant(variant);

      logger.info('Created portfolio variant', {
        userId: request.user.id,
        portfolioId,
        variantId: variant.id,
      });

      return apiSuccess({ variant: transformedVariant });
    } catch (error) {
      logger.error(
        'Failed to create portfolio variant:',
        error instanceof Error ? error : new Error(String(error))
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);