/**
 * Field-level encryption utility for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';
import { logger } from '@/lib/utils/logger';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

// Get encryption key from environment
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment variables');
  }

  // Derive a consistent 256-bit key from the provided key
  return createHash('sha256').update(key).digest();
};

// Field-specific key derivation for additional security
const deriveFieldKey = (
  masterKey: Buffer,
  fieldName: string,
  salt: Buffer
): Buffer => {
  const context = Buffer.concat([Buffer.from(fieldName, 'utf8'), salt]);

  return createHash('sha256')
    .update(Buffer.concat([masterKey, context]))
    .digest();
};

/**
 * Encrypts a string value with field-specific encryption
 * @param value - The value to encrypt
 * @param fieldName - The field name (used for key derivation)
 * @returns Base64 encoded encrypted data with IV, tag, and salt
 */
export const encryptField = (
  value: string | null | undefined,
  fieldName: string
): string | null => {
  if (!value) return null;

  try {
    const masterKey = getEncryptionKey();
    const salt = randomBytes(SALT_LENGTH);
    const fieldKey = deriveFieldKey(masterKey, fieldName, salt);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, fieldKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);

    return combined.toString('base64');
  } catch (error) {
    logger.error('Encryption failed', { error, fieldName });
    throw new Error('Failed to encrypt field');
  }
};

/**
 * Decrypts a field-encrypted value
 * @param encryptedValue - Base64 encoded encrypted data
 * @param fieldName - The field name (used for key derivation)
 * @returns Decrypted string value
 */
export const decryptField = (
  encryptedValue: string | null | undefined,
  fieldName: string
): string | null => {
  if (!encryptedValue) return null;

  try {
    const masterKey = getEncryptionKey();
    const combined = Buffer.from(encryptedValue, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const fieldKey = deriveFieldKey(masterKey, fieldName, salt);
    const decipher = createDecipheriv(ALGORITHM, fieldKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Decryption failed', { error, fieldName });
    throw new Error('Failed to decrypt field');
  }
};

/**
 * Encrypts a JSON object's specified fields
 * @param obj - Object to encrypt fields on
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns Object with specified fields encrypted
 */
export const encryptObjectFields = <T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T => {
  const encrypted = { ...obj };

  for (const field of fieldsToEncrypt) {
    if (
      field in encrypted &&
      encrypted[field] !== null &&
      encrypted[field] !== undefined
    ) {
      const fieldName = String(field);
      encrypted[field] = encryptField(
        String(encrypted[field]),
        fieldName
      ) as T[keyof T];
    }
  }

  return encrypted;
};

/**
 * Decrypts a JSON object's specified fields
 * @param obj - Object to decrypt fields on
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns Object with specified fields decrypted
 */
export const decryptObjectFields = <T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T => {
  const decrypted = { ...obj };

  for (const field of fieldsToDecrypt) {
    if (
      field in decrypted &&
      decrypted[field] !== null &&
      decrypted[field] !== undefined
    ) {
      const fieldName = String(field);
      decrypted[field] = decryptField(
        String(decrypted[field]),
        fieldName
      ) as T[keyof T];
    }
  }

  return decrypted;
};

/**
 * Hash sensitive data for indexing (one-way)
 * @param value - Value to hash
 * @param salt - Optional salt for hashing
 * @returns Hashed value
 */
export const hashForIndex = (value: string, salt?: string): string => {
  const saltedValue = salt ? `${value}:${salt}` : value;
  return createHash('sha256').update(saltedValue).digest('hex');
};

/**
 * Encrypt JSON data within a JSONB field
 * @param data - JSON data to encrypt
 * @param fieldPath - Dot-notation path to encrypt (e.g., 'contact.email')
 * @returns Encrypted JSON data
 */
export const encryptJsonField = (data: any, fieldPath: string): any => {
  if (!data) return data;

  const cloned = JSON.parse(JSON.stringify(data));
  const pathParts = fieldPath.split('.');
  let current = cloned;

  // Navigate to the parent of the field
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (!key || !current[key]) return cloned;
    current = current[key];
  }

  // Encrypt the field
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart && current[lastPart]) {
    current[lastPart] = encryptField(current[lastPart], fieldPath);
  }

  return cloned;
};

/**
 * Decrypt JSON data within a JSONB field
 * @param data - JSON data containing encrypted fields
 * @param fieldPath - Dot-notation path to decrypt
 * @returns Decrypted JSON data
 */
export const decryptJsonField = (data: any, fieldPath: string): any => {
  if (!data) return data;

  const cloned = JSON.parse(JSON.stringify(data));
  const pathParts = fieldPath.split('.');
  let current = cloned;

  // Navigate to the parent of the field
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (!key || !current[key]) return cloned;
    current = current[key];
  }

  // Decrypt the field
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart && current[lastPart]) {
    current[lastPart] = decryptField(current[lastPart], fieldPath);
  }

  return cloned;
};

/**
 * Batch encrypt multiple fields efficiently
 * @param records - Array of records to encrypt
 * @param fieldsToEncrypt - Fields to encrypt on each record
 * @returns Array of records with encrypted fields
 */
export const batchEncryptFields = <T extends Record<string, any>>(
  records: T[],
  fieldsToEncrypt: (keyof T)[]
): T[] => {
  return records.map(record => encryptObjectFields(record, fieldsToEncrypt));
};

/**
 * Batch decrypt multiple fields efficiently
 * @param records - Array of records to decrypt
 * @param fieldsToDecrypt - Fields to decrypt on each record
 * @returns Array of records with decrypted fields
 */
export const batchDecryptFields = <T extends Record<string, any>>(
  records: T[],
  fieldsToDecrypt: (keyof T)[]
): T[] => {
  return records.map(record => decryptObjectFields(record, fieldsToDecrypt));
};

// Export field names that require encryption for type safety
export const ENCRYPTED_FIELDS = {
  // OAuth tokens
  GITHUB_ACCESS_TOKEN: 'access_token',
  GITHUB_REFRESH_TOKEN: 'refresh_token',
  LINKEDIN_ACCESS_TOKEN: 'access_token',
  LINKEDIN_REFRESH_TOKEN: 'refresh_token',

  // User data
  USER_EMAIL: 'email',
  USER_PHONE: 'phone',
  USER_STRIPE_CUSTOMER_ID: 'stripe_customer_id',
  USER_STRIPE_SUBSCRIPTION_ID: 'stripe_subscription_id',

  // MFA
  MFA_SECRET: 'mfa_secret',
  MFA_BACKUP_CODES: 'backup_codes',

  // Webhooks
  WEBHOOK_SECRET: 'webhook_secret',

  // AI logs
  AI_INPUT_TEXT: 'input_text',
  AI_OUTPUT_TEXT: 'output_text',

  // File uploads
  FILE_EXTRACTED_DATA: 'extracted_data',

  // Analytics
  ANALYTICS_IP_ADDRESS: 'ip_address',

  // Portfolio contact
  PORTFOLIO_CONTACT_EMAIL: 'contact.email',
  PORTFOLIO_CONTACT_PHONE: 'contact.phone',
  PORTFOLIO_CONTACT_ADDRESS: 'contact.address',
} as const;

// Type for encrypted field names
export type EncryptedFieldName =
  (typeof ENCRYPTED_FIELDS)[keyof typeof ENCRYPTED_FIELDS];
