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

import { v4 as uuidv4 } from 'uuid';

import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { apiSuccess, versionedApiHandler } from '@/lib/api/response-helpers';
import { prisma } from '@/lib/db/prisma';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import type { CreatePortfolioDTO } from '@/types/portfolio';
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

      // Build query conditions
      const whereConditions: any = { userId: user.id };
      
      if (status !== undefined && status !== null) {
        whereConditions.status = status;
      }
      if (template !== undefined && template !== null) {
        whereConditions.template = template;
      }
      
      // Build search conditions
      const searchConditions = [];
      if (search !== undefined && search !== null) {
        searchConditions.push(
          { name: { contains: search, mode: 'insensitive' as const } },
          { data: { path: ['title'], string_contains: search } },
          { data: { path: ['bio'], string_contains: search } }
        );
      }
      
      // Execute query with pagination
      const [portfolios, totalCount] = await Promise.all([
        prisma.portfolio.findMany({
          where: searchConditions.length > 0 ? {
            ...whereConditions,
            OR: searchConditions
          } : whereConditions,
          orderBy: { updatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.portfolio.count({
          where: searchConditions.length > 0 ? {
            ...whereConditions,
            OR: searchConditions
          } : whereConditions
        })
      ]);

      return apiSuccess({
        portfolios: portfolios ?? [],
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
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

      // User is already authenticated via middleware
      const { user } = request;

      // Check portfolio creation limits by counting existing portfolios
      const existingPortfoliosCount = await prisma.portfolio.count({
        where: { userId: user.id }
      });
      
      // Get user's plan limits
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true }
      });
      
      const maxPortfolios = userProfile?.plan === 'professional' ? 10 : userProfile?.plan === 'business' ? 50 : 3; // free plan: 3
      
      if (existingPortfoliosCount >= maxPortfolios) {
        throw new ValidationError(
          'Portfolio creation limit exceeded. Please upgrade your plan to create more portfolios.',
          { code: 'PORTFOLIO_LIMIT_EXCEEDED' }
        );
      }

      // Parse and validate request body
      let body: unknown;
      try {
        body = await request.json();
      } catch (_error) {
        throw new ValidationError('Invalid JSON in request body');
      }

      const validation = validateCreatePortfolio(body as CreatePortfolioDTO);

      if (!validation.isValid) {
        throw new ValidationError('Invalid portfolio data', {
          errors: validation.errors || [],
        });
      }

      // Sanitize input data
      const sanitizedData = sanitizePortfolioData(body as CreatePortfolioDTO);

      // Generate unique subdomain if not provided
      let subdomain = String(sanitizedData.name || 'portfolio')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Ensure subdomain uniqueness
      const existingPortfolios = await prisma.portfolio.findMany({
        where: {
          subdomain: {
            startsWith: subdomain
          }
        },
        select: { subdomain: true }
      });

      if (existingPortfolios.length > 0) {
        const existingSubdomains = existingPortfolios.map(p => p.subdomain);
        let counter = 1;
        let uniqueSubdomain = subdomain;

        while (existingSubdomains.includes(uniqueSubdomain)) {
          uniqueSubdomain = `${subdomain}-${counter}`;
          counter++;
        }
        subdomain = uniqueSubdomain;
      }
      // Prepare portfolio data for insertion matching Prisma schema
      const portfolioData = {
        id: uuidv4(),
        userId: user.id,
        name: sanitizedData.name,
        slug: subdomain, // Using subdomain as slug for now
        template: sanitizedData.template,
        status: 'draft' as const,
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
        aiSettings: {
          enhanceBio: true,
          enhanceProjectDescriptions: true,
          generateSkillsFromExperience: false,
          tone: 'professional',
          targetLength: 'concise',
        },
        subdomain,
        customDomain: null,
        views: 0,
        lastViewedAt: null,
        publishedAt: null,
      };

      // Insert portfolio into database
      try {
        const portfolio = await prisma.portfolio.create({
          data: portfolioData
        });
        
        // Transform database response to API format
        const responsePortfolio = transformDbPortfolioToApi(portfolio);

        return apiSuccess(
          {
            portfolio: responsePortfolio,
            message: 'Portfolio created successfully',
          },
          { status: 201 }
        );
      } catch (insertError: any) {
        errorLogger.logError(insertError, {
          action: 'create_portfolio',
          userId: user.id,
          metadata: { subdomain, template: sanitizedData.template },
        });

        // Handle specific errors
        if (insertError.code === 'P2002') {
          // Unique constraint violation
          throw new ConflictError(
            'A portfolio with this subdomain already exists'
          );
        }
        throw new ExternalServiceError('Database', insertError);
      }

    })
  )
);

// Transformation functions have been moved to lib/utils/portfolio-transformer.ts
// Import the transformation function from the centralized location
export { transformApiPortfolioToDb } from '@/lib/utils/portfolio-transformer';
