import { v4 as uuidv4 } from 'uuid';

import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { apiSuccess, versionedApiHandler } from '@/lib/api/response-helpers';
import { createClient } from '@/lib/supabase/server';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import {
  validateCreatePortfolio,
  validatePortfolioQuery,
  sanitizePortfolioData,
} from '@/lib/validation/portfolio';
import {
  withErrorHandler,
  ValidationError,
  ConflictError,
  ExternalServiceError,
  errorLogger,
} from '@/lib/services/error';

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
export const GET = versionedApiHandler(
  withAuth(
    withErrorHandler(async (request: AuthenticatedRequest) => {
      // Create Supabase client
      const supabase = await createClient();

      if (!supabase) {
        throw new ExternalServiceError(
          'Supabase',
          new Error('Database service not available')
        );
      }

      // User is already authenticated via middleware
      const { user } = request;

      // Parse and validate query parameters
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const queryValidation = validatePortfolioQuery(queryParams);

      if (!queryValidation.success) {
        throw new ValidationError('Invalid query parameters');
      }

      // Query validation always succeeds based on the implementation
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
      if (status !== undefined && status !== null) {
        query = query.eq('status', status);
      }
      if (template !== undefined && template !== null) {
        query = query.eq('template', template);
      }
      if (search !== undefined && search !== null) {
        query = query.or(
          `name.ilike.%${search}%,data->>title.ilike.%${search}%,data->>bio.ilike.%${search}%`
        );
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Execute query
      const { data: portfolios, error: fetchError } = await query;

      if (fetchError) {
        errorLogger.logError(fetchError, {
          action: 'fetch_portfolios',
          userId: user.id,
          metadata: { queryParams },
        });
        throw new ExternalServiceError('Supabase', fetchError);
      }

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return apiSuccess({
        portfolios: portfolios ?? [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
      });
    })
  )
);

/**
 * POST /api/v1/portfolios
 * Creates a new portfolio for the authenticated user
 */
export const POST = versionedApiHandler(
  withAuth(
    withErrorHandler(async (request: AuthenticatedRequest) => {
      // Create Supabase client
      const supabase = await createClient();
      if (!supabase) {
        throw new ExternalServiceError(
          'Supabase',
          new Error('Database not configured')
        );
      }

      // User is already authenticated via middleware
      const { user } = request;

      // Check portfolio creation limits
      const { data: limitsData, error: limitsError } = await supabase.rpc(
        'check_user_plan_limits',
        { user_uuid: user.id }
      );

      if (limitsError) {
        errorLogger.logError(limitsError, {
          action: 'check_portfolio_limits',
          userId: user.id,
        });
        throw new ExternalServiceError('Database', limitsError);
      }

      if (limitsData?.error) {
        throw new ValidationError(limitsData.error);
      }

      if (!limitsData?.can_create_portfolio) {
        throw new ValidationError(
          'Portfolio creation limit exceeded. Please upgrade your plan to create more portfolios.',
          { code: 'PORTFOLIO_LIMIT_EXCEEDED' }
        );
      }

      // Parse and validate request body
      let body: unknown;
      try {
        body = await request.json();
      } catch (error) {
        throw new ValidationError('Invalid JSON in request body');
      }

      const validation = validateCreatePortfolio(body as any);

      if (!validation.isValid) {
        throw new ValidationError('Invalid portfolio data', {
          errors: validation.errors,
        });
      }

      // Sanitize input data
      const sanitizedData = sanitizePortfolioData(body as any);

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
      // Prepare portfolio data for insertion matching Supabase schema
      const portfolioData = {
        id: uuidv4(),
        user_id: user.id,
        name: sanitizedData.name,
        slug: subdomain, // Using subdomain as slug for now
        template: sanitizedData.template,
        status: 'draft',
        // Store all portfolio content in the data JSONB field
        data: {
          title: sanitizedData.title,
          bio: sanitizedData.bio ?? '',
          tagline: '',
          avatar_url: null,
          contact: {},
          social: {},
          experience: [],
          education: [],
          projects: [],
          skills: [],
          certifications: [],
        },
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
        errorLogger.logError(insertError, {
          action: 'create_portfolio',
          userId: user.id,
          metadata: { subdomain, template: sanitizedData.template },
        });

        // Handle specific errors
        if (insertError.code === '23505') {
          // Unique constraint violation
          throw new ConflictError(
            'A portfolio with this subdomain already exists'
          );
        }
        throw new ExternalServiceError('Supabase', insertError);
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
    })
  )
);

// Transformation functions have been moved to lib/utils/portfolio-transformer.ts
// Import the transformation function from the centralized location
export { transformApiPortfolioToDb } from '@/lib/utils/portfolio-transformer';
