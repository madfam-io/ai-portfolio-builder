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

import {
  withAuth,
  AuthenticatedRequest,
  RouteContext,
} from '@/lib/api/middleware/auth';
import {
  apiSuccess,
  apiError,
  versionedApiHandler,
} from '@/lib/api/response-helpers';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Helper function to transform variant data
function transformVariant(variant: Record<string, unknown>) {
  return {
    id: variant.id,
    portfolioId: variant.portfolio_id,
    name: variant.name,
    slug: variant.slug,
    isDefault: variant.is_default,
    isPublished: variant.is_published,
    contentOverrides: variant.content_overrides || {},
    audienceProfile: variant.audience_profile || {},
    aiOptimization: variant.ai_optimization || {},
    analytics: variant.analytics || {},
    createdAt: variant.created_at,
    updatedAt: variant.updated_at,
  };
}

// Helper function to verify variant ownership
async function verifyVariantOwnership(
  supabase: ReturnType<typeof createClient> extends Promise<infer T>
    ? T
    : never,
  variantId: string,
  userId: string
) {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data: variant, error } = await supabase
    .from('portfolio_variants')
    .select(
      `
      *,
      audience_profile:audience_profiles(*),
      portfolio:portfolios(user_id)
    `
    )
    .eq('id', variantId)
    .single();

  if (error || !variant) {
    return { error: 'Variant not found', status: 404 };
  }

  // Verify user owns the portfolio
  const portfolioData = Array.isArray(variant.portfolio)
    ? variant.portfolio[0]
    : variant.portfolio;

  if (!portfolioData || portfolioData.user_id !== userId) {
    return { error: 'Unauthorized', status: 403 };
  }

  return { variant };
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
      const supabase = await createClient();

      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      const result = await verifyVariantOwnership(
        supabase,
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
      const supabase = await createClient();

      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify ownership first
      const { data: existingVariant, error: fetchError } = await supabase
        .from('portfolio_variants')
        .select(
          `
          id,
          portfolio:portfolios(user_id)
        `
        )
        .eq('id', variantId)
        .single();

      if (fetchError || !existingVariant) {
        return apiError('Variant not found', { status: 404 });
      }

      // Verify user owns the portfolio
      const portfolioData = Array.isArray(existingVariant.portfolio)
        ? existingVariant.portfolio[0]
        : existingVariant.portfolio;
      if (!portfolioData || portfolioData.user_id !== request.user.id) {
        return apiError('Unauthorized', { status: 403 });
      }

      // Prepare updates
      const dbUpdates: Record<string, unknown> = {};

      if ('name' in updates) dbUpdates.name = updates.name;
      if ('slug' in updates) dbUpdates.slug = updates.slug;
      if ('isDefault' in updates) dbUpdates.is_default = updates.isDefault;
      if ('isPublished' in updates)
        dbUpdates.is_published = updates.isPublished;
      if ('contentOverrides' in updates)
        dbUpdates.content_overrides = updates.contentOverrides;
      if ('aiOptimization' in updates)
        dbUpdates.ai_optimization = updates.aiOptimization;
      if ('analytics' in updates) dbUpdates.analytics = updates.analytics;

      // Update the variant
      const { data: variant, error: updateError } = await supabase
        .from('portfolio_variants')
        .update(dbUpdates)
        .eq('id', variantId)
        .select(
          `
          *,
          audience_profile:audience_profiles(*)
        `
        )
        .single();

      if (updateError) {
        logger.error('Failed to update variant:', updateError);
        return apiError('Failed to update variant', { status: 500 });
      }

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
      const supabase = await createClient();

      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Get variant with portfolio to verify ownership
      const { data: variant, error: fetchError } = await supabase
        .from('portfolio_variants')
        .select(
          `
          id,
          is_default,
          portfolio:portfolios(user_id)
        `
        )
        .eq('id', variantId)
        .single();

      if (fetchError || !variant) {
        return apiError('Variant not found', { status: 404 });
      }

      // Verify user owns the portfolio
      const portfolioDataDelete = Array.isArray(variant.portfolio)
        ? variant.portfolio[0]
        : variant.portfolio;
      if (
        !portfolioDataDelete ||
        portfolioDataDelete.user_id !== request.user.id
      ) {
        return apiError('Unauthorized', { status: 403 });
      }

      // Prevent deleting default variant
      if (variant.is_default) {
        return apiError('Cannot delete default variant', { status: 400 });
      }

      // Delete the variant
      const { error: deleteError } = await supabase
        .from('portfolio_variants')
        .delete()
        .eq('id', variantId);

      if (deleteError) {
        logger.error('Failed to delete variant:', deleteError);
        return apiError('Failed to delete variant', { status: 500 });
      }

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
