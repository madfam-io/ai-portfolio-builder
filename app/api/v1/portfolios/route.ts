import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  apiSuccess,
  apiError,
  versionedApiHandler,
import {
  validateCreatePortfolio,
  validatePortfolioQuery,
  sanitizePortfolioData,

} from '@/lib/api/versioning';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
} from '@/lib/validations/portfolio';
import { Portfolio } from '@/types/portfolio';

/**
 * Portfolio API Routes v1 - Main CRUD operations
 * Handles portfolio listing and creation
 *
 * @version 1.0.0
 * @endpoint /api/v1/portfolios
 */

/**
 * GET /api/v1/portfolios
 * Retrieves all portfolios for the authenticated user
 */
export const GET = versionedApiHandler(async (request: NextRequest) => {
  try {
    // Create Supabase client
    const supabase = await createClient();

    if (!supabase) {
      return apiError('Database service not available', { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user || authError) {
      return apiError('Unauthorized - Please sign in', { status: 401 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const queryValidation = validatePortfolioQuery(queryParams);

    if (!queryValidation.success) {
      return apiError('Invalid query parameters', {
        status: 400,
        data: { details: queryValidation.error.issues },
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      template,
      search,
    } = queryValidation.data;

    // Build query
    let query = supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (template) {
      query = query.eq('template', template);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,title.ilike.%${search}%,bio.ilike.%${search}%`
      );
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: portfolios, error: fetchError } = await query;

    if (fetchError) {
      logger.error('Database error fetching portfolios:', fetchError);
      return apiError('Failed to fetch portfolios', { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return apiSuccess({
      portfolios: portfolios || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/v1/portfolios:', error as Error);
    return apiError('Internal server error', { status: 500 });
  }
});

/**
 * POST /api/v1/portfolios
 * Creates a new portfolio for the authenticated user
 */
export const POST = versionedApiHandler(async (request: NextRequest) => {
  try {
    // Create Supabase client
    const supabase = await createClient();
    if (!supabase) {
      return apiError('Database not configured', { status: 500 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user || authError) {
      return apiError('Unauthorized - Please sign in', { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCreatePortfolio(body);

    if (!validation.success) {
      return apiError('Invalid portfolio data', {
        status: 400,
        data: { details: validation.error.issues },
      });
    }

    // Sanitize input data
    const sanitizedData = sanitizePortfolioData(validation.data);

    // Generate unique subdomain if not provided
    let subdomain = sanitizedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure subdomain uniqueness
    const { data: existingPortfolios } = await supabase
      .from('portfolios')
      .select('subdomain')
      .like('subdomain', `${subdomain}%`);

    if (existingPortfolios && existingPortfolios.length > 0) {
      const existingSubdomains = existingPortfolios.map(p => p.subdomain);
      let counter = 1;
      let uniqueSubdomain = subdomain;

      while (existingSubdomains.includes(uniqueSubdomain)) {
        uniqueSubdomain = `${subdomain}-${counter}`;
        counter++;
      }

      subdomain = uniqueSubdomain;
    }

    // Prepare portfolio data for insertion
    const portfolioData = {
      id: uuidv4(),
      user_id: user.id,
      name: sanitizedData.name,
      title: sanitizedData.title,
      bio: sanitizedData.bio || '',
      tagline: '',
      avatar_url: null,
      contact: {},
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      template: sanitizedData.template,
      customization: {
        primaryColor: '#1a73e8',
        secondaryColor: '#34a853',
        fontFamily: 'Inter',
        headerStyle: 'minimal',
      },
      ai_settings: {
        enhanceBio: true,
        enhanceProjectDescriptions: true,
        generateSkillsFromExperience: false,
        tone: 'professional',
        targetLength: 'concise',
      },
      status: 'draft',
      subdomain,
      custom_domain: null,
      views: 0,
      last_viewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
    };

    // Insert portfolio into database
    const { data: portfolio, error: insertError } = await supabase
      .from('portfolios')
      .insert(portfolioData)
      .select()
      .single();

    if (insertError) {
      logger.error('Database error creating portfolio:', insertError);

      // Handle specific errors
      if (insertError.code === '23505') {
        // Unique constraint violation
        return apiError('A portfolio with this subdomain already exists', {
          status: 409,
        });
      }

      return apiError('Failed to create portfolio', { status: 500 });
    }

    // Transform database response to API format
    const responsePortfolio = transformDbPortfolioToApi(portfolio);

    return apiSuccess(
      {
        portfolio: responsePortfolio,
        message: 'Portfolio created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Unexpected error in POST /api/v1/portfolios', error as Error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return apiError('Invalid JSON in request body', { status: 400 });
    }

    return apiError('Internal server error', { status: 500 });
  }
});

// Transformation functions moved to lib/utils/portfolio-transformer.ts

/**
 * Transforms API portfolio object to database format
 * Converts camelCase to snake_case and adjusts field names
 */
export function transformApiPortfolioToDb(
  apiPortfolio: Partial<Portfolio>
): unknown {
  const dbData: unknown = {};

  if (apiPortfolio.userId) dbData.user_id = apiPortfolio.userId;
  if (apiPortfolio.name) dbData.name = apiPortfolio.name;
  if (apiPortfolio.title) dbData.title = apiPortfolio.title;
  if (apiPortfolio.bio !== undefined) dbData.bio = apiPortfolio.bio;
  if (apiPortfolio.tagline !== undefined) dbData.tagline = apiPortfolio.tagline;
  if (apiPortfolio.avatarUrl !== undefined)
    dbData.avatar_url = apiPortfolio.avatarUrl;
  if (apiPortfolio.contact) dbData.contact = apiPortfolio.contact;
  if (apiPortfolio.social) dbData.social = apiPortfolio.social;
  if (apiPortfolio.experience) dbData.experience = apiPortfolio.experience;
  if (apiPortfolio.education) dbData.education = apiPortfolio.education;
  if (apiPortfolio.projects) dbData.projects = apiPortfolio.projects;
  if (apiPortfolio.skills) dbData.skills = apiPortfolio.skills;
  if (apiPortfolio.certifications)
    dbData.certifications = apiPortfolio.certifications;
  if (apiPortfolio.template) dbData.template = apiPortfolio.template;
  if (apiPortfolio.customization)
    dbData.customization = apiPortfolio.customization;
  if (apiPortfolio.aiSettings) dbData.ai_settings = apiPortfolio.aiSettings;
  if (apiPortfolio.status) dbData.status = apiPortfolio.status;
  if (apiPortfolio.subdomain !== undefined)
    dbData.subdomain = apiPortfolio.subdomain;
  if (apiPortfolio.customDomain !== undefined)
    dbData.custom_domain = apiPortfolio.customDomain;
  if (apiPortfolio.views !== undefined) dbData.views = apiPortfolio.views;
  if (apiPortfolio.lastViewedAt)
    dbData.last_viewed_at = apiPortfolio.lastViewedAt.toISOString();
  if (apiPortfolio.publishedAt)
    dbData.published_at = apiPortfolio.publishedAt.toISOString();

  // Always update the updated_at timestamp
  dbData.updated_at = new Date().toISOString();

  return dbData;
}
