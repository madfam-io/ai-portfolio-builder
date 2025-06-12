/**
 * Cryptographic utilities for secure data storage
 * Implements AES-256-GCM encryption for sensitive data like API tokens
 */

import crypto from 'crypto';

import { logger } from '@/lib/utils/logger';

const algorithm = 'aes-256-gcm';

/**
 * Get or generate the encryption key from environment
 * In production, this should be a stable key stored in environment variables
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;

  if (!envKey) {
    logger.warn(
      'ENCRYPTION_KEY not found in environment variables. ' +
        'Using a random key which will change on restart. ' +
        'Set ENCRYPTION_KEY in production!'
    );
    // In development, use a deterministic key based on a seed
    // This prevents data loss during development
    if (process.env.NODE_ENV === 'development') {
      return crypto.scryptSync('dev-encryption-key', 'salt', 32);
    }
    // In production, this should never happen
    throw new Error('ENCRYPTION_KEY must be set in production environment');
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
