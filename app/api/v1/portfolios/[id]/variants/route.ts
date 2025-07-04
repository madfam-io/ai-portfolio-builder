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
import type { CreateVariantInput } from '@/types/portfolio-variants';

// Using RouteContext from auth middleware

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
    audienceProfile: variant.audience_profile || {
      id: variant.audience_profile_id,
      type: 'general',
      name: 'General Audience',
    },
    aiOptimization: variant.ai_optimization || {},
    analytics: variant.analytics || {},
    createdAt: variant.created_at,
    updatedAt: variant.updated_at,
  };
}

// Helper function to verify portfolio ownership
async function verifyPortfolioOwnership(
  supabase: ReturnType<typeof createClient> extends Promise<infer T>
    ? T
    : never,
  portfolioId: string,
  userId: string
) {
  if (!supabase) {
    return {
      portfolio: null,
      error: new Error('Database connection not available'),
    };
  }

  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .select('id')
    .eq('id', portfolioId)
    .eq('user_id', userId)
    .single();

  return { portfolio, error };
}

// Helper function to create audience profile
async function createAudienceProfile(
  supabase: ReturnType<typeof createClient> extends Promise<infer T>
    ? T
    : never,
  userId: string,
  body: CreateVariantInput
) {
  if (!body.audienceDetails) {
    return { profileId: null };
  }

  const audienceData = {
    user_id: userId,
    type: body.audienceType,
    name: body.audienceDetails.name || body.name,
    description: body.audienceDetails.description,
    industry: body.audienceDetails.industry,
    company_size: body.audienceDetails.companySize,
    key_priorities: body.audienceDetails.keyPriorities || [],
    pain_points: body.audienceDetails.painPoints || [],
    decision_criteria: body.audienceDetails.decisionCriteria || [],
    important_keywords: body.audienceDetails.importantKeywords || [],
    avoid_keywords: body.audienceDetails.avoidKeywords || [],
    communication_style: body.audienceDetails.communicationStyle,
    preferred_length: body.audienceDetails.preferredLength,
  };

  if (!supabase) {
    return { error: new Error('Database connection not available') };
  }

  const { data: profile, error } = await supabase
    .from('audience_profiles')
    .insert(audienceData)
    .select()
    .single();

  if (error) {
    logger.error('Failed to create audience profile:', error as Error);
    return { error };
  }

  return { profileId: profile.id };
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
      const supabase = await createClient();

      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify user owns the portfolio
      const { portfolio, error: portfolioError } =
        await verifyPortfolioOwnership(supabase, portfolioId, request.user.id);

      if (portfolioError || !portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Get all variants with audience profiles
      const { data: variants, error: variantsError } = await supabase
        .from('portfolio_variants')
        .select(
          `
          *,
          audience_profile:audience_profiles(*)
        `
        )
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: true });

      if (variantsError) {
        logger.error('Failed to fetch variants:', variantsError);
        return apiError('Failed to fetch variants', { status: 500 });
      }

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
      const supabase = await createClient();

      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify user owns the portfolio
      const { portfolio, error: portfolioError } =
        await verifyPortfolioOwnership(supabase, portfolioId, request.user.id);

      if (portfolioError || !portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Create or get audience profile
      const { profileId: audienceProfileId, error: profileError } =
        await createAudienceProfile(supabase, request.user.id, body);

      if (profileError) {
        return apiError('Failed to create audience profile', { status: 500 });
      }

      // Generate slug from name
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Copy content overrides from base variant if specified
      let contentOverrides = {};
      if (body.basedOnVariant) {
        const { data: baseVariant } = await supabase
          .from('portfolio_variants')
          .select('content_overrides')
          .eq('id', body.basedOnVariant)
          .single();

        if (baseVariant) {
          contentOverrides = baseVariant.content_overrides || {};
        }
      }

      // Create the variant
      const { data: variant, error: variantError } = await supabase
        .from('portfolio_variants')
        .insert({
          portfolio_id: portfolioId,
          audience_profile_id: audienceProfileId,
          name: body.name,
          slug,
          is_default: false,
          is_published: false,
          content_overrides: contentOverrides,
        })
        .select(
          `
          *,
          audience_profile:audience_profiles(*)
        `
        )
        .single();

      if (variantError) {
        logger.error('Failed to create variant:', variantError);
        return apiError('Failed to create variant', { status: 500 });
      }

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
