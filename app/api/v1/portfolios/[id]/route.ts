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
import {
  transformDbPortfolioToApi,
  transformApiPortfolioToDb,
} from '@/lib/utils/portfolio-transformer';
import {
  validateUpdatePortfolio,
  sanitizePortfolioData,
} from '@/lib/validation/portfolio';

/**
 * Portfolio API Routes - Individual portfolio operations
 * Handles get, update, and delete operations for specific portfolios
 */

// Import RouteContext from auth middleware

/**
 * GET /api/v1/portfolios/[id]
 * Retrieves a specific portfolio by ID
 */
export const GET = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const id = params.id;
      if (!id || typeof id !== 'string') {
        return apiError('Invalid portfolio ID', { status: 400 });
      }
      const { user } = request;

      // Create Supabase client
      const supabase = await createClient();
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Fetch portfolio
      const { data: portfolio, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return apiError('Portfolio not found', { status: 404 });
        }
        logger.error('Database error fetching portfolio:', fetchError);
        return apiError('Failed to fetch portfolio', { status: 500 });
      }

      // Check ownership
      if (portfolio.user_id !== user.id) {
        return apiError('You can only access your own portfolios', {
          status: 403,
        });
      }

      // Transform to API format
      const responsePortfolio = transformDbPortfolioToApi(portfolio);

      return apiSuccess({ portfolio: responsePortfolio });
    } catch (error) {
      logger.error(
        'Unexpected error in GET /api/v1/portfolios/[id]:',
        error as Error
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);
/**
 * PUT /api/v1/portfolios/[id]
 * Updates a specific portfolio by ID
 */
export const PUT = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const id = params.id;
      if (!id || typeof id !== 'string') {
        return apiError('Invalid portfolio ID', { status: 400 });
      }
      const { user } = request;

      // Create Supabase client
      const supabase = await createClient();
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify portfolio exists and user owns it
      const { data: existingPortfolio, error: fetchError } = await supabase
        .from('portfolios')
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return apiError('Portfolio not found', { status: 404 });
        }
        logger.error(
          'Database error checking portfolio ownership:',
          fetchError
        );
        return apiError('Failed to verify portfolio ownership', {
          status: 500,
        });
      }

      // Check ownership
      if (existingPortfolio.user_id !== user.id) {
        return apiError('You can only modify your own portfolios', {
          status: 403,
        });
      }

      // Parse and validate request body
      const body = await request.json();
      const validation = validateUpdatePortfolio(body);

      if (!validation.isValid) {
        return apiError('Invalid portfolio data', {
          status: 400,
          data: { details: validation.errors },
        });
      }

      // Sanitize input data
      const sanitizedData = sanitizePortfolioData(body);

      // Handle subdomain uniqueness if being updated
      if (
        sanitizedData.subdomain !== undefined &&
        sanitizedData.subdomain !== null
      ) {
        const { data: existingSubdomain } = await supabase
          .from('portfolios')
          .select('id')
          .eq('subdomain', sanitizedData.subdomain)
          .neq('id', id)
          .single();

        if (existingSubdomain) {
          return apiError('Subdomain already exists', { status: 409 });
        }
      }

      // Handle status change to published
      if (
        sanitizedData.status === 'published' &&
        existingPortfolio.status !== 'published'
      ) {
        sanitizedData.publishedAt = new Date();
      }

      // Transform to database format
      const updateData = {
        ...transformApiPortfolioToDb(sanitizedData),
        updated_at: new Date().toISOString(),
      };

      // Update portfolio
      const { data: updatedPortfolio, error: updateError } = await supabase
        .from('portfolios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        logger.error('Database error updating portfolio:', updateError);
        if (updateError.code === '23505') {
          return apiError('Subdomain already exists', { status: 409 });
        }
        return apiError('Failed to update portfolio', { status: 500 });
      }

      // Transform to API format
      const responsePortfolio = transformDbPortfolioToApi(updatedPortfolio);

      return apiSuccess({
        portfolio: responsePortfolio,
        message: 'Portfolio updated successfully',
      });
    } catch (error) {
      logger.error(
        'Unexpected error in PUT /api/v1/portfolios/[id]:',
        error as Error
      );
      if (error instanceof SyntaxError) {
        return apiError('Invalid JSON in request body', { status: 400 });
      }
      return apiError('Internal server error', { status: 500 });
    }
  })
);
/**
 * DELETE /api/v1/portfolios/[id]
 * Deletes a specific portfolio by ID
 */
export const DELETE = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest, context?: RouteContext) => {
    if (!context) {
      return apiError('Invalid route context', { status: 500 });
    }
    const params = await context.params;
    try {
      const id = params.id;
      if (!id || typeof id !== 'string') {
        return apiError('Invalid portfolio ID', { status: 400 });
      }
      const { user } = request;

      // Create Supabase client
      const supabase = await createClient();
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Verify portfolio exists and user owns it
      const { data: existingPortfolio, error: fetchError } = await supabase
        .from('portfolios')
        .select('user_id, name')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return apiError('Portfolio not found', { status: 404 });
        }
        logger.error(
          'Database error checking portfolio ownership:',
          fetchError
        );
        return apiError('Failed to verify portfolio ownership', {
          status: 500,
        });
      }

      // Check ownership
      if (existingPortfolio.user_id !== user.id) {
        return apiError('You can only delete your own portfolios', {
          status: 403,
        });
      }

      // Delete portfolio
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (deleteError) {
        logger.error('Database error deleting portfolio:', deleteError);
        return apiError('Failed to delete portfolio', { status: 500 });
      }

      // Return success
      return apiSuccess(
        { message: 'Portfolio deleted successfully' },
        {
          status: 200,
          headers: { 'X-Portfolio-Deleted': existingPortfolio.name },
        }
      );
    } catch (error) {
      logger.error(
        'Unexpected error in DELETE /api/v1/portfolios/[id]:',
        error as Error
      );
      return apiError('Internal server error', { status: 500 });
    }
  })
);
