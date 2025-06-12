import { NextRequest, NextResponse } from 'next/server';

import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { logger } from '@/lib/utils/logger';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { id } = params;

    // TODO: Add authentication check here
    // const user = await authenticate(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
