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

import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/prisma';


export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolioId = params.id;

    try {
      // Get portfolio with custom domain info
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId: user.id,
        },
        select: {
          id: true,
          customDomain: true,
          subdomain: true,
        },
      });

      if (!portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      if (!portfolio.customDomain) {
        return NextResponse.json(
          { error: 'No custom domain configured' },
          { status: 404 }
        );
      }

      // Since custom domains are not fully implemented in the new infrastructure,
      // return a pending status with appropriate message
      return NextResponse.json({
        status: 'pending',
        domain: portfolio.customDomain,
        ssl: false,
        message: 'Custom domains are currently being migrated to the new infrastructure. Please contact support for updates.',
      });
    } catch (error) {
      logger.error(
        'Failed to check domain status',
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.json(
        { error: 'Failed to check domain status' },
        { status: 500 }
      );
    }
  }
);
