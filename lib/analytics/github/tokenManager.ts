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
 * Decrypt a GitHub refresh token
 */
export function decryptRefreshToken(
  tokenData: EncryptedTokenData
): string | null {
  try {
    if (
      !tokenData.encrypted_refresh_token ||
      !tokenData.refresh_token_iv ||
      !tokenData.refresh_token_tag
    ) {
      // No refresh token stored
      return null;
    }

    const decrypted = decrypt({
      encrypted: tokenData.encrypted_refresh_token,
      iv: tokenData.refresh_token_iv,
      tag: tokenData.refresh_token_tag,
    });

    return decrypted;
  } catch (error) {
    logger.error('Failed to decrypt refresh token', { error });
    return null;
  }
}

/**
 * Check if the integration has encrypted tokens
 */
export function hasEncryptedTokens(
  integration: unknown
): integration is EncryptedTokenData {
  return Boolean(
    integration &&
      typeof (integration as any).encrypted_access_token === 'string' &&
      typeof (integration as any).access_token_iv === 'string' &&
      typeof (integration as any).access_token_tag === 'string'
  );
}

/**
 * Check if the integration has legacy unencrypted tokens
 */
export function hasLegacyTokens(integration: unknown): boolean {
  return Boolean(
    integration && typeof (integration as any).access_token === 'string'
  );
}
