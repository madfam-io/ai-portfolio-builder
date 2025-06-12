import { NextRequest, NextResponse } from 'next/server';

import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { logger } from '@/lib/utils/logger';
import {
  authenticateUser,
  unauthorizedResponse,
} from '@/lib/api/middleware/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { id } = params;

    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    // TODO: Verify user owns this portfolio
    // const portfolio = await portfolioService.getPortfolio(id);
    // if (portfolio?.userId !== user.id) {
    //   return forbiddenResponse();
    // }

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
