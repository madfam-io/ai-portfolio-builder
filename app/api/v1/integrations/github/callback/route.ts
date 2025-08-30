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
import { prisma } from '@/lib/db/prisma';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

/**
 * GitHub OAuth Callback API
 * Handles GitHub OAuth callback and stores integration
 */

interface StateData {
  userId: string;
  timestamp: number;
}

// Helper function to validate OAuth state
async function validateOAuthState(state: string, userId: string) {
  const oauthState = await prisma.session.findFirst({
    where: {
      sessionToken: state,
      userId,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!oauthState) {
    logger.error('Invalid OAuth state', { state });
    return null;
  }

  // Decrypt and validate state data
  try {
    const encryptedState = JSON.parse(
      Buffer.from(state, 'base64url').toString()
    );
    const stateData = JSON.parse(decrypt(encryptedState)) as StateData;

    // Validate state contents
    if (stateData.userId !== userId) {
      throw new Error('State user ID mismatch');
    }

    // Check timestamp to prevent replay attacks (10 minute window)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new Error('State timestamp expired');
    }

    return oauthState;
  } catch (error) {
    logger.error('State validation failed', { error });
    return null;
  }
}

// Helper function to exchange code for access token
async function exchangeCodeForToken(code: string) {
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.error !== undefined && tokenData.error !== null) {
    logger.error('GitHub token exchange failed', { error: tokenData });
    return null;
  }

  return tokenData;
}

// Helper function to fetch GitHub user info
async function fetchGitHubUser(accessToken: string) {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  const githubUser = await userResponse.json();

  if (!userResponse.ok) {
    logger.error('Failed to fetch GitHub user', { error: githubUser });
    return null;
  }

  return githubUser;
}

// Helper function to store GitHub integration
async function storeGitHubIntegration(
  user: { id: string },
  githubUser: {
    id: number;
    login: string;
    email?: string | null;
    avatar_url?: string | null;
  },
  tokenData: {
    access_token: string;
    refresh_token?: string | null;
    scope: string;
  }
) {
  // Encrypt the access token before storage
  const encryptedToken = encrypt(tokenData.access_token);
  const encryptedRefreshToken =
    tokenData.refresh_token !== undefined && tokenData.refresh_token !== null
      ? encrypt(tokenData.refresh_token)
      : null;

  // Store GitHub integration with encrypted tokens
  try {
    await prisma.gitHubIntegration.upsert({
      where: {
        userId: user.id,
      },
      update: {
        githubUserId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        accessToken: encryptedToken.encrypted,
        refreshToken: encryptedRefreshToken?.encrypted || null,
        lastSyncedAt: new Date(),
        isActive: true,
      },
      create: {
        userId: user.id,
        githubUserId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        accessToken: encryptedToken.encrypted,
        refreshToken: encryptedRefreshToken?.encrypted || null,
        lastSyncedAt: new Date(),
        isActive: true,
      },
    });
    return null; // Success
  } catch (integrationError) {
    return integrationError;
  }
}

/**
 * Handle GitHub OAuth callback
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      logger.error('GitHub OAuth error', { error });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=invalid_callback`
      );
    }

    // Verify state parameter for CSRF protection
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=unauthorized`
      );
    }

    // Retrieve and validate OAuth state from database
    const oauthState = await validateOAuthState(state, user.id);
    if (!oauthState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=invalid_state`
      );
    }

    // Mark state as used to prevent reuse (delete it)
    await prisma.session.delete({
      where: { id: oauthState.id },
    });

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    if (!tokenData) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=token_exchange_failed`
      );
    }

    // Fetch GitHub user info
    const githubUser = await fetchGitHubUser(tokenData.access_token);
    if (!githubUser) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=user_fetch_failed`
      );
    }

    // Store GitHub integration
    const integrationError = await storeGitHubIntegration(
      user,
      githubUser,
      tokenData
    );

    if (integrationError) {
      logger.error('Failed to store GitHub integration', {
        error: integrationError,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=integration_store_failed`
      );
    }

    // Redirect to analytics dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/analytics?connected=true`
    );
  } catch (error) {
    logger.error('GitHub OAuth callback failed', { error });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/analytics?error=callback_failed`
    );
  }
}
