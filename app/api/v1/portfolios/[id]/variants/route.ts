import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { apiSuccess, apiError, versionedApiHandler } from '@/lib/api/response-helpers';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import type { CreateVariantInput } from '@/types/portfolio-variants';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/v1/portfolios/[id]/variants
 * Get all variants for a portfolio
 */
export const GET = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      const portfolioId = params.id;
      const supabase = await createClient();
      
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify user owns the portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('id', portfolioId)
        .eq('user_id', request.user.id)
        .single();

      if (portfolioError || !portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Get all variants with audience profiles
      const { data: variants, error: variantsError } = await supabase
        .from('portfolio_variants')
        .select(`
          *,
          audience_profile:audience_profiles(*)
        `)
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: true });

      if (variantsError) {
        logger.error('Failed to fetch variants:', variantsError);
        return apiError('Failed to fetch variants', { status: 500 });
      }

      // Transform to match TypeScript types
      const transformedVariants = variants?.map(variant => ({
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
      })) || [];

      return apiSuccess({ variants: transformedVariants });
    } catch (error) {
      logger.error('Failed to get portfolio variants:', error instanceof Error ? error : new Error(String(error)));
      return apiError('Internal server error', { status: 500 });
    }
  })
);

/**
 * POST /api/v1/portfolios/[id]/variants
 * Create a new variant for a portfolio
 */
export const POST = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      const portfolioId = params.id;
      const body: CreateVariantInput = await request.json();
      const supabase = await createClient();
      
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify user owns the portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('id', portfolioId)
        .eq('user_id', request.user.id)
        .single();

      if (portfolioError || !portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Create or get audience profile
      let audienceProfileId = null;
      if (body.audienceDetails) {
        const audienceData = {
          user_id: request.user.id,
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

        const { data: profile, error: profileError } = await supabase
          .from('audience_profiles')
          .insert(audienceData)
          .select()
          .single();

        if (profileError) {
          logger.error('Failed to create audience profile:', profileError);
          return apiError('Failed to create audience profile', { status: 500 });
        }

        audienceProfileId = profile.id;
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
        .select(`
          *,
          audience_profile:audience_profiles(*)
        `)
        .single();

      if (variantError) {
        logger.error('Failed to create variant:', variantError);
        return apiError('Failed to create variant', { status: 500 });
      }

      // Transform to match TypeScript types
      const transformedVariant = {
        id: variant.id,
        portfolioId: variant.portfolio_id,
        name: variant.name,
        slug: variant.slug,
        isDefault: variant.is_default,
        isPublished: variant.is_published,
        contentOverrides: variant.content_overrides || {},
        audienceProfile: variant.audience_profile || {
          id: audienceProfileId,
          type: body.audienceType,
          name: body.audienceDetails?.name || body.name,
        },
        aiOptimization: variant.ai_optimization || {},
        analytics: variant.analytics || {},
        createdAt: variant.created_at,
        updatedAt: variant.updated_at,
      };

      logger.info('Created portfolio variant', {
        userId: request.user.id,
        portfolioId,
        variantId: variant.id,
      });

      return apiSuccess({ variant: transformedVariant });
    } catch (error) {
      logger.error('Failed to create portfolio variant:', error instanceof Error ? error : new Error(String(error)));
      return apiError('Internal server error', { status: 500 });
    }
  })
);