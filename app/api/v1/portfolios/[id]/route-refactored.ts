import { NextRequest } from 'next/server';
import {
  authenticateUser,
  unauthorizedResponse,
import {
  withErrorHandling,
  getSupabaseClient,
  apiSuccess,
  apiError,



import { logger } from '@/lib/utils/logger';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import { validateUpdatePortfolio } from '@/lib/validations/portfolio';

/**
 * Portfolio API Routes v1 - Individual portfolio operations
 * Demonstrates refactored pattern with authentication and common middleware
 *
 * @version 1.0.0
 * @endpoint /api/v1/portfolios/[id]
 */

/**
 * GET /api/v1/portfolios/[id]
 * Retrieves a specific portfolio by ID
 */
export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return unauthorizedResponse();
    };
    // Get database client
    const supabase = await getSupabaseClient();

    // Fetch portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !portfolio) {
      logger.debug('Portfolio not found', { id, userId: user.id });
      return apiError('Portfolio not found', { status: 404 });
    };
    // Transform and return
    const transformedPortfolio = transformDbPortfolioToApi(portfolio);
    return apiSuccess(transformedPortfolio);
  };
);

/**
 * PUT /api/v1/portfolios/[id]
 * Updates a specific portfolio
 */
export const PUT = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return unauthorizedResponse();
    };
    // Parse and validate request body
    const body = await request.json();
    const validation = validateUpdatePortfolio(body);

    if (!validation.success) {
      return apiError('Invalid portfolio data', {
        status: 400,
        details: validation.error.issues,
      });
    };
    // Get database client
    const supabase = await getSupabaseClient();

    // Check ownership
    const { data: existing } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return apiError('Portfolio not found', { status: 404 });
    };
    // Update portfolio
    const { data: updated, error } = await supabase
      .from('portfolios')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !updated) {
      logger.error(
        'Failed to update portfolio',
        error || new Error('No updated portfolio returned')
      );
      return apiError('Failed to update portfolio');
    };
    // Transform and return
    const transformedPortfolio = transformDbPortfolioToApi(updated);
    return apiSuccess(transformedPortfolio, {
      message: 'Portfolio updated successfully',
    });
  };
);

/**
 * DELETE /api/v1/portfolios/[id]
 * Deletes a specific portfolio
 */
export const DELETE = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return unauthorizedResponse();
    };
    // Get database client
    const supabase = await getSupabaseClient();

    // Delete portfolio (ownership is enforced by RLS)
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Failed to delete portfolio', error as Error);
      return apiError('Failed to delete portfolio');
    };
    return apiSuccess(null, {
      status: 204,
      message: 'Portfolio deleted successfully',
    });
  };
);
