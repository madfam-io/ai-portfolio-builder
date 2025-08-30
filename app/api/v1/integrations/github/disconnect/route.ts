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
 * GitHub Integration Disconnect API
 * Removes GitHub integration for the authenticated user
 */

export async function POST(): Promise<Response> {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete GitHub integration
    try {
      await prisma.gitHubIntegration.delete({
        where: {
          userId: user.id,
        },
      });
    } catch (deleteError) {
      logger.error('Failed to delete GitHub integration', {
        error: deleteError,
      });
      return NextResponse.json(
        { error: 'Failed to disconnect GitHub' },
        { status: 500 }
      );
    }

    // Note: Repository deletion would go here if we had a Repository model

    // Clean up any OAuth sessions (not needed since we use regular sessions)

    // Log analytics event
    try {
      await fetch('/api/v1/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'github_disconnected',
          properties: {
            user_id: user.id,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      // Non-critical error
      logger.error('Failed to log analytics event', { error });
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub integration disconnected successfully',
    });
  } catch (error) {
    logger.error('GitHub disconnect failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
