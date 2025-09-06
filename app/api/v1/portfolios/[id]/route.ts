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
  type AuthenticatedRequest,
  type RouteContext,
} from '@/lib/api/middleware/auth';
import {
  apiSuccess,
  apiError,
  versionedApiHandler,
} from '@/lib/api/response-helpers';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';
import {
  transformDbPortfolioToApi,
  transformApiPortfolioToDb,
} from '@/lib/utils/portfolio-transformer';
import {
  validateUpdatePortfolio,
  sanitizePortfolioData,
} from '@/lib/validation/portfolio';
import { prisma } from '@/lib/db/prisma';

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

      // Fetch portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: { id },
      });

      if (!portfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Check ownership
      if (portfolio.userId !== user.id) {
        return apiError('You can only access your own portfolios', {
          status: 403,
        });
      }

      // Transform to API format
      const responsePortfolio = transformDbPortfolioToApi(portfolio as any);

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

      // Verify portfolio exists and user owns it
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: { id },
        select: {
          userId: true,
          status: true,
        },
      });

      if (!existingPortfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Check ownership
      if (existingPortfolio.userId !== user.id) {
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
        const existingSubdomain = await prisma.portfolio.findFirst({
          where: {
            subdomain: sanitizedData.subdomain,
            NOT: {
              id: id,
            },
          },
          select: { id: true },
        });

        if (existingSubdomain) {
          return apiError('Subdomain already exists', { status: 409 });
        }
      }

      // Handle status change to published
      if (
        sanitizedData.status === 'PUBLISHED' &&
        existingPortfolio.status !== 'PUBLISHED'
      ) {
        sanitizedData.publishedAt = new Date();
      }

      // Transform to database format
      const updateData = transformApiPortfolioToDb(sanitizedData);

      // Update portfolio
      const updatedPortfolio = await prisma.portfolio.update({
        where: { id },
        data: updateData as any,
      });

      // Transform to API format
      const responsePortfolio = transformDbPortfolioToApi(updatedPortfolio as any);

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

      // Verify portfolio exists and user owns it
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: { id },
        select: {
          userId: true,
          name: true,
        },
      });

      if (!existingPortfolio) {
        return apiError('Portfolio not found', { status: 404 });
      }

      // Check ownership
      if (existingPortfolio.userId !== user.id) {
        return apiError('You can only delete your own portfolios', {
          status: 403,
        });
      }

      // Delete portfolio
      await prisma.portfolio.delete({
        where: { id },
      });

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
