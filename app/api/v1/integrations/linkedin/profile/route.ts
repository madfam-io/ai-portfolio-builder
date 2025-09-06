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
import { LinkedInClient } from '@/lib/services/integrations/linkedin/client';
import { LinkedInParser } from '@/lib/services/integrations/linkedin/parser';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/v1/integrations/linkedin/profile
 * Fetch LinkedIn profile data for authenticated user
 */
export async function GET() {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get LinkedIn connection from Account table
    const connection = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'linkedin',
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 404 }
      );
    }

    // Check if token has expired
    const expiresAt = connection.expires_at
      ? new Date(connection.expires_at * 1000)
      : new Date(0);
    if (expiresAt < new Date()) {
      // TODO: Implement token refresh if refresh token is available
      return NextResponse.json(
        { error: 'LinkedIn token expired' },
        { status: 401 }
      );
    }

    // Initialize LinkedIn client
    const linkedInClient = new LinkedInClient();

    // Fetch full profile
    try {
      const linkedInProfile = await linkedInClient.fetchFullProfile(
        connection.access_token || ''
      );

      // Parse profile data into portfolio format
      const parsedProfile = LinkedInParser.parseProfile(linkedInProfile);

      if (!parsedProfile.success) {
        return NextResponse.json(
          { error: parsedProfile.error || 'Failed to parse profile' },
          { status: 400 }
        );
      }

      // Update last sync timestamp (skipping for now as Account model doesn't have last_sync_at)
      // Could be added later if needed

      return NextResponse.json({
        success: true,
        data: parsedProfile.data,
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        'LinkedIn profile fetch failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.json(
        { error: 'Failed to fetch LinkedIn profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error(
      'LinkedIn profile endpoint error:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/integrations/linkedin/profile
 * Disconnect LinkedIn integration
 */
export async function DELETE() {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get LinkedIn connection from Account table
    const connection = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'linkedin',
      },
      select: { id: true, access_token: true },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 404 }
      );
    }

    // Revoke access (LinkedIn doesn't support programmatic revocation)
    const linkedInClient = new LinkedInClient();
    await linkedInClient.revokeAccess(connection.access_token || '');

    // Delete connection from database
    try {
      await prisma.account.delete({
        where: { id: connection.id },
      });
    } catch (deleteError) {
      logger.error('Failed to delete LinkedIn connection:', deleteError as any);
      return NextResponse.json(
        { error: 'Failed to disconnect LinkedIn' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn disconnected successfully',
    });
  } catch (error) {
    logger.error(
      'LinkedIn disconnect error:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
