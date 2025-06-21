/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Encryption service for handling field-level encryption across the application
 */

import {
  encryptField,
  decryptField,
  hashForIndex,
  encryptJsonField,
  decryptJsonField,
  ENCRYPTED_FIELDS,
} from '@/lib/utils/encryption';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Define types for encrypted data
export interface EncryptedUser {
  id: string;
  email?: string;
  email_encrypted?: string;
  email_hash?: string;
  phone?: string;
  phone_encrypted?: string;
  stripe_customer_id?: string;
  stripe_customer_id_encrypted?: string;
  stripe_subscription_id?: string;
  stripe_subscription_id_encrypted?: string;
}

export interface EncryptedOAuthTokens {
  access_token?: string;
  access_token_encrypted?: string;
  refresh_token?: string;
  refresh_token_encrypted?: string;
}

export interface EncryptedPortfolioContact {
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Encrypt user sensitive fields
 */
export const encryptUserData = (
  user: Partial<EncryptedUser>
): Partial<EncryptedUser> => {
  const encrypted: Partial<EncryptedUser> = { ...user };

  // Encrypt email
  if (user.email && !user.email_encrypted) {
    const encryptedEmail = encryptField(
      user.email,
      ENCRYPTED_FIELDS.USER_EMAIL
    );
    if (encryptedEmail !== null) {
      encrypted.email_encrypted = encryptedEmail;
    }
    encrypted.email_hash = hashForIndex(user.email);
  }

  // Encrypt phone
  if (user.phone && !user.phone_encrypted) {
    const encryptedPhone = encryptField(
      user.phone,
      ENCRYPTED_FIELDS.USER_PHONE
    );
    if (encryptedPhone !== null) {
      encrypted.phone_encrypted = encryptedPhone;
    }
  }

  // Encrypt Stripe IDs
  if (user.stripe_customer_id && !user.stripe_customer_id_encrypted) {
    const encryptedStripeCustomerId = encryptField(
      user.stripe_customer_id,
      ENCRYPTED_FIELDS.USER_STRIPE_CUSTOMER_ID
    );
    if (encryptedStripeCustomerId !== null) {
      encrypted.stripe_customer_id_encrypted = encryptedStripeCustomerId;
    }
  }

  if (user.stripe_subscription_id && !user.stripe_subscription_id_encrypted) {
    const encryptedStripeSubscriptionId = encryptField(
      user.stripe_subscription_id,
      ENCRYPTED_FIELDS.USER_STRIPE_SUBSCRIPTION_ID
    );
    if (encryptedStripeSubscriptionId !== null) {
      encrypted.stripe_subscription_id_encrypted =
        encryptedStripeSubscriptionId;
    }
  }

  return encrypted;
};

/**
 * Decrypt user sensitive fields
 */
export const decryptUserData = (
  user: Partial<EncryptedUser>
): Partial<EncryptedUser> => {
  const decrypted: Partial<EncryptedUser> = { ...user };

  // Decrypt email
  if (user.email_encrypted && !user.email) {
    const decryptedEmail = decryptField(
      user.email_encrypted,
      ENCRYPTED_FIELDS.USER_EMAIL
    );
    if (decryptedEmail !== null) {
      decrypted.email = decryptedEmail;
    }
  }

  // Decrypt phone
  if (user.phone_encrypted && !user.phone) {
    const decryptedPhone = decryptField(
      user.phone_encrypted,
      ENCRYPTED_FIELDS.USER_PHONE
    );
    if (decryptedPhone !== null) {
      decrypted.phone = decryptedPhone;
    }
  }

  // Decrypt Stripe IDs
  if (user.stripe_customer_id_encrypted && !user.stripe_customer_id) {
    const decryptedStripeCustomerId = decryptField(
      user.stripe_customer_id_encrypted,
      ENCRYPTED_FIELDS.USER_STRIPE_CUSTOMER_ID
    );
    if (decryptedStripeCustomerId !== null) {
      decrypted.stripe_customer_id = decryptedStripeCustomerId;
    }
  }

  if (user.stripe_subscription_id_encrypted && !user.stripe_subscription_id) {
    const decryptedStripeSubscriptionId = decryptField(
      user.stripe_subscription_id_encrypted,
      ENCRYPTED_FIELDS.USER_STRIPE_SUBSCRIPTION_ID
    );
    if (decryptedStripeSubscriptionId !== null) {
      decrypted.stripe_subscription_id = decryptedStripeSubscriptionId;
    }
  }

  return decrypted;
};

/**
 * Encrypt OAuth tokens
 */
export const encryptOAuthTokens = (
  tokens: Partial<EncryptedOAuthTokens>
): Partial<EncryptedOAuthTokens> => {
  const encrypted: Partial<EncryptedOAuthTokens> = { ...tokens };

  if (tokens.access_token && !tokens.access_token_encrypted) {
    const encryptedAccessToken = encryptField(
      tokens.access_token,
      ENCRYPTED_FIELDS.GITHUB_ACCESS_TOKEN
    );
    if (encryptedAccessToken !== null) {
      encrypted.access_token_encrypted = encryptedAccessToken;
    }
    // Clear plaintext
    delete encrypted.access_token;
  }

  if (tokens.refresh_token && !tokens.refresh_token_encrypted) {
    const encryptedRefreshToken = encryptField(
      tokens.refresh_token,
      ENCRYPTED_FIELDS.GITHUB_REFRESH_TOKEN
    );
    if (encryptedRefreshToken !== null) {
      encrypted.refresh_token_encrypted = encryptedRefreshToken;
    }
    // Clear plaintext
    delete encrypted.refresh_token;
  }

  return encrypted;
};

/**
 * Decrypt OAuth tokens
 */
export const decryptOAuthTokens = (
  tokens: Partial<EncryptedOAuthTokens>
): Partial<EncryptedOAuthTokens> => {
  const decrypted: Partial<EncryptedOAuthTokens> = { ...tokens };

  if (tokens.access_token_encrypted) {
    const decryptedAccessToken = decryptField(
      tokens.access_token_encrypted,
      ENCRYPTED_FIELDS.GITHUB_ACCESS_TOKEN
    );
    if (decryptedAccessToken !== null) {
      decrypted.access_token = decryptedAccessToken;
    }
  }

  if (tokens.refresh_token_encrypted) {
    const decryptedRefreshToken = decryptField(
      tokens.refresh_token_encrypted,
      ENCRYPTED_FIELDS.GITHUB_REFRESH_TOKEN
    );
    if (decryptedRefreshToken !== null) {
      decrypted.refresh_token = decryptedRefreshToken;
    }
  }

  return decrypted;
};

/**
 * Encrypt portfolio contact information in JSONB
 */
export const encryptPortfolioContact = (portfolioData: any): any => {
  if (!portfolioData?.contact) return portfolioData;

  let encrypted = { ...portfolioData };

  // Encrypt each contact field
  if (portfolioData.contact.email) {
    encrypted = encryptJsonField(
      encrypted,
      ENCRYPTED_FIELDS.PORTFOLIO_CONTACT_EMAIL
    );
  }

  if (portfolioData.contact.phone) {
    encrypted = encryptJsonField(
      encrypted,
      ENCRYPTED_FIELDS.PORTFOLIO_CONTACT_PHONE
    );
  }

  if (portfolioData.contact.address) {
    encrypted = encryptJsonField(
      encrypted,
      ENCRYPTED_FIELDS.PORTFOLIO_CONTACT_ADDRESS
    );
  }

  return encrypted;
};

/**
 * Decrypt portfolio contact information
 */
export const decryptPortfolioContact = (portfolioData: any): any => {
  if (!portfolioData?.contact) return portfolioData;

  let decrypted = { ...portfolioData };

  // Check if fields are encrypted (they'll be base64 strings)
  const isBase64 = (str: string) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  if (portfolioData.contact.email && isBase64(portfolioData.contact.email)) {
    decrypted = decryptJsonField(
      decrypted,
      ENCRYPTED_FIELDS.PORTFOLIO_CONTACT_EMAIL
    );
  }

  if (portfolioData.contact.phone && isBase64(portfolioData.contact.phone)) {
    decrypted = decryptJsonField(
      decrypted,
      ENCRYPTED_FIELDS.PORTFOLIO_CONTACT_PHONE
    );
  }

  if (
    portfolioData.contact.address &&
    isBase64(portfolioData.contact.address)
  ) {
    decrypted = decryptJsonField(
      decrypted,
      ENCRYPTED_FIELDS.PORTFOLIO_CONTACT_ADDRESS
    );
  }

  return decrypted;
};

/**
 * Find user by encrypted email
 */
export const findUserByEmail = async (email: string): Promise<any | null> => {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  const emailHash = hashForIndex(email);

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email_hash', emailHash)
    .single();

  if (error || !data) return null;

  // Decrypt the data before returning
  return decryptUserData(data);
};

/**
 * Update encrypted records in batch
 */
const updateEncryptedRecords = async (
  supabase: any,
  tableName: string,
  records: any[]
): Promise<{ successCount: number }> => {
  let successCount = 0;

  for (const record of records) {
    const { error: updateError } = await supabase
      .from(tableName)
      .update(record)
      .eq('id', record.id);

    if (updateError) {
      logger.error('Failed to encrypt record', {
        tableName,
        recordId: record.id,
        error: updateError,
      });
    } else {
      successCount++;
    }
  }

  return { successCount };
};

/**
 * Migrate existing data to encrypted format
 */
export const migrateTableToEncryption = async (
  tableName: string,
  batchSize: number = 100
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  try {
    // Update migration status
    await supabase
      .from('encryption_migration_status')
      .update({ status: 'in_progress' })
      .eq('table_name', tableName);

    let offset = 0;
    let hasMore = true;
    let totalEncrypted = 0;

    while (hasMore) {
      // Fetch batch
      const { data: records, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .range(offset, offset + batchSize - 1);

      if (fetchError) throw fetchError;

      if (!records || records.length === 0) {
        hasMore = false;
        break;
      }

      // Encrypt records based on table
      const encryptedRecords = records.map(record => {
        switch (tableName) {
          case 'users':
            return encryptUserData(record);
          case 'linkedin_connections':
          case 'github_integrations':
            return encryptOAuthTokens(record);
          case 'portfolios':
            return encryptPortfolioContact(record);
          default:
            return record;
        }
      });

      // Update records
      const updateResults = await updateEncryptedRecords(
        supabase,
        tableName,
        encryptedRecords
      );
      totalEncrypted += updateResults.successCount;

      // Update progress
      await supabase
        .from('encryption_migration_status')
        .update({ encrypted_records: totalEncrypted })
        .eq('table_name', tableName);

      offset += batchSize;
    }

    // Mark as completed
    await supabase
      .from('encryption_migration_status')
      .update({
        status: 'completed',
        migration_completed_at: new Date().toISOString(),
        encrypted_records: totalEncrypted,
      })
      .eq('table_name', tableName);

    logger.info('Encryption migration completed', {
      tableName,
      totalEncrypted,
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    await supabase
      .from('encryption_migration_status')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('table_name', tableName);

    logger.error('Encryption migration failed', {
      tableName,
      error,
    });

    return { success: false, error: errorMessage };
  }
};

/**
 * Get encryption migration status
 */
export const getEncryptionMigrationStatus = async () => {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase
    .from('encryption_migration_status')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('Failed to get encryption migration status', { error });
    return [];
  }

  return data || [];
};

/**
 * Encrypt AI enhancement logs
 */
export const encryptAILogs = (log: any): any => {
  const encrypted = { ...log };

  if (log.input_text) {
    encrypted.input_text_encrypted = encryptField(
      log.input_text,
      ENCRYPTED_FIELDS.AI_INPUT_TEXT
    );
    delete encrypted.input_text;
  }

  if (log.output_text) {
    encrypted.output_text_encrypted = encryptField(
      log.output_text,
      ENCRYPTED_FIELDS.AI_OUTPUT_TEXT
    );
    delete encrypted.output_text;
  }

  return encrypted;
};

/**
 * Decrypt AI enhancement logs
 */
export const decryptAILogs = (log: any): any => {
  const decrypted = { ...log };

  if (log.input_text_encrypted) {
    decrypted.input_text = decryptField(
      log.input_text_encrypted,
      ENCRYPTED_FIELDS.AI_INPUT_TEXT
    );
  }

  if (log.output_text_encrypted) {
    decrypted.output_text = decryptField(
      log.output_text_encrypted,
      ENCRYPTED_FIELDS.AI_OUTPUT_TEXT
    );
  }

  return decrypted;
};

/**
 * Hash IP address for analytics
 */
export const hashIPAddress = (ipAddress: string): string => {
  return hashForIndex(ipAddress, process.env.IP_HASH_SALT || 'default-salt');
};

// Export all encryption functions for use in other services
export {
  encryptField,
  decryptField,
  encryptObjectFields,
  decryptObjectFields,
  hashForIndex,
} from '@/lib/utils/encryption';
