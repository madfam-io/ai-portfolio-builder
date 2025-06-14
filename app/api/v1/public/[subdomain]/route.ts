import { apiSuccess, apiError, versionedApiHandler } from '@/lib/api/response-helpers';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';

interface RouteParams {
  params: {
    subdomain: string;
  };
}

/**
 * GET /api/v1/public/[subdomain]
 * Fetch a public portfolio by subdomain (no auth required)
 */
export const GET = versionedApiHandler(
  async (_request: Request, { params }: RouteParams) => {
    try {
      const { subdomain } = params;

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
          last_viewed_at: new Date().toISOString()
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
        }
      });

    } catch (error) {
      logger.error('Unexpected error in GET /api/v1/public/[subdomain]:', error as Error);
      return apiError('Internal server error', { status: 500 });
    }
  }
);