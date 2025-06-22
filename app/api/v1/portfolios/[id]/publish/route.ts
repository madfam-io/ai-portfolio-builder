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

import { NextRequest, NextResponse } from 'next/server';

import {
  authenticateUser,
  unauthorizedResponse,
} from '@/lib/api/middleware/auth';

import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { logger } from '@/lib/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { id } = params;

    const user = await authenticateUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    // Verify user owns this portfolio
    const portfolio = await portfolioService.getPortfolio(id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found or access denied' },
        { status: 403 }
      );
    }

    const published = await portfolioService.publishPortfolio(id);

    if (!published) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: published,
      message: 'Portfolio published successfully',
    });
  } catch (error) {
    logger.error(
      'Failed to publish portfolio',
      error instanceof Error ? error : { error }
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
