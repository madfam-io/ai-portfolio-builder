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

import { decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

/**
 * GitHub Token Manager
 * Handles encryption and decryption of GitHub access tokens
 */

export interface EncryptedTokenData {
  encrypted_access_token: string;
  access_token_iv: string;
  access_token_tag: string;
  encrypted_refresh_token?: string | null;
  refresh_token_iv?: string | null;
  refresh_token_tag?: string | null;
}

/**
 * Decrypt a GitHub access token
 */
export function decryptAccessToken(
  tokenData: EncryptedTokenData
): string | null {
  try {
    if (
      !tokenData.encrypted_access_token ||
      !tokenData.access_token_iv ||
      !tokenData.access_token_tag
    ) {
      logger.error('Missing required fields for token decryption');
      return null;
    }

    const decrypted = decrypt({
      encrypted: tokenData.encrypted_access_token,
      iv: tokenData.access_token_iv,
      tag: tokenData.access_token_tag,
    });

    return decrypted;
  } catch (error) {
    logger.error('Failed to decrypt access token', { error });
    return null;
  }
}

/**
 * Check if the integration has encrypted tokens
 */
export function hasEncryptedTokens(
  integration: unknown
): integration is EncryptedTokenData {
  if (!integration || typeof integration !== 'object') {
    return false;
  }
  const obj = integration as Record<string, unknown>;
  return Boolean(
    typeof obj.encrypted_access_token === 'string' &&
      typeof obj.access_token_iv === 'string' &&
      typeof obj.access_token_tag === 'string'
  );
}

/**
 * Check if the integration has legacy unencrypted tokens
 */
export function hasLegacyTokens(integration: unknown): boolean {
  if (!integration || typeof integration !== 'object') {
    return false;
  }
  const obj = integration as Record<string, unknown>;
  return Boolean(typeof obj.access_token === 'string');
}
