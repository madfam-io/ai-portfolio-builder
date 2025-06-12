/**
 * Cryptographic utilities for secure data storage
 * Implements AES-256-GCM encryption for sensitive data like API tokens
 */

import crypto from 'crypto';

import { logger } from '@/lib/utils/logger';

const algorithm = 'aes-256-gcm';

// Store generated keys in memory for consistency during runtime
let devEncryptionKey: Buffer | null = null;

/**
 * Get or generate the encryption key from environment
 * In production, this should be a stable key stored in environment variables
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;

  if (!envKey) {
    // In production, this should never happen
    if (process.env.NODE_ENV === 'production') {
      logger.error(
        'CRITICAL: ENCRYPTION_KEY not set in production environment'
      );
      throw new Error('ENCRYPTION_KEY must be set in production environment');
    }

    // In development, generate a random key per instance but keep it consistent during runtime
    if (!devEncryptionKey) {
      logger.warn(
        'ENCRYPTION_KEY not found in environment variables. ' +
          'Generating a random key for development. ' +
          'Data will be lost on restart. Set ENCRYPTION_KEY for persistence!'
      );

      // Generate a cryptographically secure random key
      devEncryptionKey = crypto.randomBytes(32);

      // Also log the generated key so developers can set it if needed
      logger.info(
        `Generated development encryption key: ${devEncryptionKey.toString('hex')}\n` +
          'To persist data across restarts, add this to your .env.local:\n' +
          `ENCRYPTION_KEY=${devEncryptionKey.toString('hex')}`
      );
    }

    return devEncryptionKey;
  }

  // Validate key format and length
  if (!/^[0-9a-fA-F]{64}$/.test(envKey)) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)'
    );
  }

  // Convert hex string to buffer
  return Buffer.from(envKey, 'hex');
}

/**
 * Encrypt a string using AES-256-GCM
 * @param text - The plain text to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
export function encrypt(text: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt data encrypted with the encrypt function
 * @param encryptedData - Object containing encrypted data, IV, and auth tag
 * @returns The decrypted plain text
 */
export function decrypt(encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a secure encryption key for production use
 * This should be run once during setup and the result stored securely
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Rotate encryption key by re-encrypting data with a new key
 * This should be used periodically for security
 * @param oldKey - The current encryption key
 * @param newKey - The new encryption key to rotate to
 * @param encryptedData - The data to re-encrypt
 * @returns The re-encrypted data with the new key
 */
export function rotateEncryptionKey(
  oldKey: Buffer,
  newKey: Buffer,
  encryptedData: { encrypted: string; iv: string; tag: string }
): { encrypted: string; iv: string; tag: string } {
  // Temporarily override the key getter to use the old key
  const originalKey = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = oldKey.toString('hex');

  try {
    // Decrypt with old key
    const plainText = decrypt(encryptedData);

    // Set new key
    process.env.ENCRYPTION_KEY = newKey.toString('hex');

    // Encrypt with new key
    return encrypt(plainText);
  } finally {
    // Restore original key
    if (originalKey) {
      process.env.ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  }
}

/**
 * Safely encrypt data with error handling
 * @param text - The text to encrypt
 * @returns Encrypted data or null if encryption fails
 */
export function safeEncrypt(text: string): {
  encrypted: string;
  iv: string;
  tag: string;
} | null {
  try {
    return encrypt(text);
  } catch (error) {
    logger.error('Encryption failed', { error });
    return null;
  }
}

/**
 * Safely decrypt data with error handling
 * @param encryptedData - The encrypted data object
 * @returns Decrypted text or null if decryption fails
 */
export function safeDecrypt(encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): string | null {
  try {
    return decrypt(encryptedData);
  } catch (error) {
    logger.error('Decryption failed', { error });
    return null;
  }
}
