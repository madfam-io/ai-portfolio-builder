/**
 * Portfolio API Routes - Main CRUD operations
 * Handles portfolio listing and creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  validateCreatePortfolio,
  validatePortfolioQuery,
  sanitizePortfolioData 
} from '@/lib/validations/portfolio';
import { Portfolio } from '@/types/portfolio';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/portfolios
 * Retrieves all portfolios for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service not available' },
        { status: 503 }
      );
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const queryValidation = validatePortfolioQuery(queryParams);

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { page = 1, limit = 10, status, template, search } = queryValidation.data;

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
      query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: portfolios, error: fetchError } = await query;

    if (fetchError) {
      console.error('Database error fetching portfolios:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch portfolios' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      portfolios: portfolios || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/portfolios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolios
 * Creates a new portfolio for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCreatePortfolio(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid portfolio data', details: validation.error.issues },
        { status: 400 }
      );
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
      console.error('Database error creating portfolio:', insertError);
      
      // Handle specific errors
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'A portfolio with this subdomain already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create portfolio' },
        { status: 500 }
      );
    }

    // Transform database response to API format
    const responsePortfolio = transformDbPortfolioToApi(portfolio);

    return NextResponse.json(
      { 
        portfolio: responsePortfolio,
        message: 'Portfolio created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in POST /api/portfolios:', error);
    
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
 * Transforms database portfolio object to API format
 * Converts snake_case to camelCase and adjusts field names
 */
function transformDbPortfolioToApi(dbPortfolio: any): Portfolio {
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
    lastViewedAt: dbPortfolio.last_viewed_at ? new Date(dbPortfolio.last_viewed_at) : undefined,
    createdAt: new Date(dbPortfolio.created_at),
    updatedAt: new Date(dbPortfolio.updated_at),
    publishedAt: dbPortfolio.published_at ? new Date(dbPortfolio.published_at) : undefined,
  };
}

/**
 * Transforms API portfolio object to database format
 * Converts camelCase to snake_case and adjusts field names
 */
export function transformApiPortfolioToDb(apiPortfolio: Partial<Portfolio>): any {
  const dbData: any = {};

  if (apiPortfolio.userId) dbData.user_id = apiPortfolio.userId;
  if (apiPortfolio.name) dbData.name = apiPortfolio.name;
  if (apiPortfolio.title) dbData.title = apiPortfolio.title;
  if (apiPortfolio.bio !== undefined) dbData.bio = apiPortfolio.bio;
  if (apiPortfolio.tagline !== undefined) dbData.tagline = apiPortfolio.tagline;
  if (apiPortfolio.avatarUrl !== undefined) dbData.avatar_url = apiPortfolio.avatarUrl;
  if (apiPortfolio.contact) dbData.contact = apiPortfolio.contact;
  if (apiPortfolio.social) dbData.social = apiPortfolio.social;
  if (apiPortfolio.experience) dbData.experience = apiPortfolio.experience;
  if (apiPortfolio.education) dbData.education = apiPortfolio.education;
  if (apiPortfolio.projects) dbData.projects = apiPortfolio.projects;
  if (apiPortfolio.skills) dbData.skills = apiPortfolio.skills;
  if (apiPortfolio.certifications) dbData.certifications = apiPortfolio.certifications;
  if (apiPortfolio.template) dbData.template = apiPortfolio.template;
  if (apiPortfolio.customization) dbData.customization = apiPortfolio.customization;
  if (apiPortfolio.aiSettings) dbData.ai_settings = apiPortfolio.aiSettings;
  if (apiPortfolio.status) dbData.status = apiPortfolio.status;
  if (apiPortfolio.subdomain !== undefined) dbData.subdomain = apiPortfolio.subdomain;
  if (apiPortfolio.customDomain !== undefined) dbData.custom_domain = apiPortfolio.customDomain;
  if (apiPortfolio.views !== undefined) dbData.views = apiPortfolio.views;
  if (apiPortfolio.lastViewedAt) dbData.last_viewed_at = apiPortfolio.lastViewedAt.toISOString();
  if (apiPortfolio.publishedAt) dbData.published_at = apiPortfolio.publishedAt.toISOString();

  // Always update the updated_at timestamp
  dbData.updated_at = new Date().toISOString();

  return dbData;
}