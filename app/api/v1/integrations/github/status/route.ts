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

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GitHub Integration Status API
 * Returns the current GitHub connection status for the authenticated user
 */

export async function GET(): Promise<Response> {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch GitHub integration
    const integration = await prisma.gitHubIntegration.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (!integration) {
      // No active integration found
      return NextResponse.json({
        isConnected: false,
      });
    }

    // Check rate limits using access token
    let rateLimit = null;
    try {
      const accessToken = integration.accessToken;

      // Check GitHub API rate limit
      const rateLimitResponse = await fetch(
        'https://api.github.com/rate_limit',
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json();
        rateLimit = {
          limit: rateLimitData.rate.limit,
          remaining: rateLimitData.rate.remaining,
          reset: new Date(rateLimitData.rate.reset * 1000).toISOString(),
        };

        // Update rate limit in database
        await prisma.gitHubIntegration.update({
          where: { id: integration.id },
          data: {
            // Note: Rate limit tracking would require adding these fields to the schema
          },
        });
      }
    } catch (error) {
      logger.error('Failed to check GitHub rate limit', { error });
    }

    // Return connection status
    return NextResponse.json({
      isConnected: true,
      username: integration.githubUsername,
      installedAt: integration.createdAt,
      lastSync: integration.lastSyncedAt || undefined,
      rateLimit,
    });
  } catch (error) {
    logger.error('GitHub status check failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
