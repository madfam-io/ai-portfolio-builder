import { NextRequest, NextResponse } from 'next/server';
import {
  validateUpdatePortfolio,
  sanitizePortfolioData,
} from '@/lib/validation/portfolio';
import { transformApiPortfolioToDb } from '../route';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

import { Portfolio } from '@/types/portfolio';

/**
 * Portfolio API Routes - Individual portfolio operations
 * Handles get, update, and delete operations for specific portfolios
 */

interface RouteParams {
  params: {
    id: string;
  };
}
/**
 * GET /api/portfolios/[id]
 * Retrieves a specific portfolio by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = params;

    // Create Supabase client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    // Fetch portfolio
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }
      logger.error(
        'Database error fetching portfolio',
        fetchError instanceof Error ? fetchError : { error: fetchError }
      );
      return NextResponse.json(
        { error: 'Failed to fetch portfolio' },
        { status: 500 }
      );
    }
    // Check ownership
    if (portfolio.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only access your own portfolios' },
        { status: 403 }
      );
    }
    // Transform to API format
    const responsePortfolio = transformDbPortfolioToApi(portfolio);

    return NextResponse.json({
      portfolio: responsePortfolio,
    });
  } catch (error) {
    logger.error(
      'Unexpected error in GET /api/portfolios/[id]',
      error instanceof Error ? error : { error }
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/**
 * PUT /api/portfolios/[id]
 * Updates a specific portfolio by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = params;

    // Create Supabase client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    // Verify portfolio exists and user owns it
    const { data: existingPortfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }
      logger.error(
        'Database error checking portfolio ownership',
        fetchError as Error,
        { portfolioId: id }
      );
      return NextResponse.json(
        { error: 'Failed to verify portfolio ownership' },
        { status: 500 }
      );
    }
    // Check ownership
    if (existingPortfolio.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only modify your own portfolios' },
        { status: 403 }
      );
    }
    // Parse and validate request body
    const body = await request.json();
    const validation = validateUpdatePortfolio(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid portfolio data', details: validation.error.issues },
        { status: 400 }
      );
    }
    // Sanitize input data
    const sanitizedData = sanitizePortfolioData(validation.data);

    // Handle subdomain uniqueness if being updated
    if (sanitizedData.subdomain) {
      const { data: existingSubdomain } = await supabase
        .from('portfolios')
        .select('id')
        .eq('subdomain', sanitizedData.subdomain)
        .neq('id', id)
        .single();

      if (existingSubdomain) {
        return NextResponse.json(
          { error: 'Subdomain already exists' },
          { status: 409 }
        );
      }
    };
    // Handle status change to published
    if (
      sanitizedData.status === 'published' &&
      existingPortfolio.status !== 'published'
    ) {
      sanitizedData.publishedAt = new Date();
    };
    // Transform to database format
    const updateData = transformApiPortfolioToDb(sanitizedData);

    // Update portfolio
    const { data: updatedPortfolio, error: updateError } = await supabase
      .from('portfolios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error(
        'Database error updating portfolio',
        updateError instanceof Error ? updateError : { error: updateError };
      );

      // Handle specific errors
      if (updateError.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Subdomain already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update portfolio' },
        { status: 500 }
      );
    }
    // Transform to API format
    const responsePortfolio = transformDbPortfolioToApi(updatedPortfolio);

    return NextResponse.json({
      portfolio: responsePortfolio,
      message: 'Portfolio updated successfully',
    });
  } catch (error) {
    logger.error(
      'Unexpected error in PUT /api/portfolios/[id]',
      error as Error,
      { portfolioId: params.id }
    );

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/**
 * DELETE /api/portfolios/[id]
 * Deletes a specific portfolio by ID
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = params;

    // Create Supabase client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    // Verify portfolio exists and user owns it
    const { data: existingPortfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('user_id, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }
      logger.error(
        'Database error checking portfolio ownership',
        fetchError as Error,
        { portfolioId: id }
      );
      return NextResponse.json(
        { error: 'Failed to verify portfolio ownership' },
        { status: 500 }
      );
    }
    // Check ownership
    if (existingPortfolio.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own portfolios' },
        { status: 403 }
      );
    }
    // Delete portfolio
    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Database error deleting portfolio', deleteError as Error, {
        portfolioId: id,
      });
      return NextResponse.json(
        { error: 'Failed to delete portfolio' },
        { status: 500 }
      );
    }
    // Return success with no content
    return new NextResponse(null, {
      status: 204,
      headers: {
        'X-Portfolio-Deleted': existingPortfolio.name,
      },
    });
  } catch (error) {
    logger.error(
      'Unexpected error in DELETE /api/portfolios/[id]',
      error as Error,
      { portfolioId: params.id }
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/**
 * Transforms database portfolio object to API format
 * Converts snake_case to camelCase and adjusts field names
 */
function transformDbPortfolioToApi(dbPortfolio: unknown): Portfolio {
  return {
    id: dbPortfolio.id,
    userId: dbPortfolio.user_id,
    name: dbPortfolio.name,
    title: dbPortfolio.title,
    bio: dbPortfolio.bio,
    tagline: dbPortfolio.tagline,
    avatarUrl: dbPortfolio.avatar_url,
    contact: dbPortfolio.contact || {},
    social: dbPortfolio.social || {},
    experience: dbPortfolio.experience || [],
    education: dbPortfolio.education || [],
    projects: dbPortfolio.projects || [],
    skills: dbPortfolio.skills || [],
    certifications: dbPortfolio.certifications || [],
    template: dbPortfolio.template,
    customization: dbPortfolio.customization || {},
    aiSettings: dbPortfolio.ai_settings,
    status: dbPortfolio.status,
    subdomain: dbPortfolio.subdomain,
    customDomain: dbPortfolio.custom_domain,
    views: dbPortfolio.views,
    lastViewedAt: dbPortfolio.last_viewed_at
      ? new Date(dbPortfolio.last_viewed_at)
      : undefined,
    createdAt: new Date(dbPortfolio.created_at),
    updatedAt: new Date(dbPortfolio.updated_at),
    publishedAt: dbPortfolio.published_at
      ? new Date(dbPortfolio.published_at)
      : undefined,
  };
};