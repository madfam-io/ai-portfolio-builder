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

// Helper function to transform variant data
function transformVariant(variant: any) {
  return {
    id: variant.id,
    portfolioId: variant.portfolioId,
    name: variant.name,
    slug: variant.slug,
    isDefault: variant.isDefault,
    isPublished: variant.isPublished,
    contentOverrides: variant.contentOverrides || {},
    audienceProfile: variant.audienceProfile || {},
    aiOptimization: variant.aiOptimization || {},
    analytics: variant.analytics || {},
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };
}

// Helper function to verify variant ownership
async function verifyVariantOwnership(
  variantId: string,
  userId: string
) {
  try {
    const variant = await prisma.portfolioVariant.findUnique({
      where: { id: variantId },
      include: {
        portfolio: {
          select: { userId: true },
        },
      },
    });

    if (!variant) {
      return { error: 'Variant not found', status: 404 };
    }

    // Verify user owns the portfolio
    if (variant.portfolio.userId !== userId) {
      return { error: 'Unauthorized', status: 403 };
    }

    return { variant };
  } catch (error) {
    return { error: 'Database error', status: 500 };
  }
}

// Using RouteContext from auth middleware

/**
 * GET /api/v1/variants/[id]
 * Get a specific variant
 */
export const GET = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const variantId = params.id;
      if (!variantId || typeof variantId !== 'string') {
        return apiError('Invalid variant ID', { status: 400 });
      }
      const result = await verifyVariantOwnership(
        variantId,
        request.user.id
      );

      if ('error' in result) {
        return apiError(result.error || 'Unknown error', {
          status: result.status,
        });
      }

      // Transform to match TypeScript types
      const transformedVariant = transformVariant(result.variant);

      return apiSuccess({ variant: transformedVariant });
    } catch (error) {
      logger.error(
        'Failed to get variant:',
        error instanceof Error ? error : new Error(String(error))
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);

/**
 * PATCH /api/v1/variants/[id]
 * Update a variant
 */
export const PATCH = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const variantId = params.id;
      if (!variantId || typeof variantId !== 'string') {
        return apiError('Invalid variant ID', { status: 400 });
      }
      const updates = await request.json();

      // Verify ownership first
      const existingVariant = await prisma.portfolioVariant.findUnique({
        where: { id: variantId },
        include: {
          portfolio: {
            select: { userId: true },
          },
        },
      });

      if (!existingVariant) {
        return apiError('Variant not found', { status: 404 });
      }

      // Verify user owns the portfolio
      if (existingVariant.portfolio.userId !== request.user.id) {
        return apiError('Unauthorized', { status: 403 });
      }

      // Prepare updates
      const dbUpdates: any = {};

      if ('name' in updates) dbUpdates.name = updates.name;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('content' in updates) dbUpdates.content = updates.content;
      if ('customization' in updates) dbUpdates.customization = updates.customization;
      if ('isActive' in updates) dbUpdates.isActive = updates.isActive;
      if ('isControl' in updates) dbUpdates.isControl = updates.isControl;

      // Update the variant
      const variant = await prisma.portfolioVariant.update({
        where: { id: variantId },
        data: dbUpdates,
      });

      // Transform to match TypeScript types
      const transformedVariant = transformVariant(variant);

      logger.info('Updated portfolio variant', {
        userId: request.user.id,
        variantId,
      });

      return apiSuccess({ variant: transformedVariant });
    } catch (error) {
      logger.error(
        'Failed to update variant:',
        error instanceof Error ? error : new Error(String(error))
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);

/**
 * DELETE /api/v1/variants/[id]
 * Delete a variant
 */
export const DELETE = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const variantId = params.id;
      if (!variantId || typeof variantId !== 'string') {
        return apiError('Invalid variant ID', { status: 400 });
      }
      // Get variant with portfolio to verify ownership
      const variant = await prisma.portfolioVariant.findUnique({
        where: { id: variantId },
        include: {
          portfolio: {
            select: { userId: true },
          },
        },
      });

      if (!variant) {
        return apiError('Variant not found', { status: 404 });
      }

      // Verify user owns the portfolio
      if (variant.portfolio.userId !== request.user.id) {
        return apiError('Unauthorized', { status: 403 });
      }

      // Prevent deleting control variant
      if (variant.isControl) {
        return apiError('Cannot delete control variant', { status: 400 });
      }

      // Delete the variant
      await prisma.portfolioVariant.delete({
        where: { id: variantId },
      });

      logger.info('Deleted portfolio variant', {
        userId: request.user.id,
        variantId,
      });

      return apiSuccess({ message: 'Variant deleted successfully' });
    } catch (error) {
      logger.error(
        'Failed to delete variant:',
        error instanceof Error ? error : new Error(String(error))
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);
