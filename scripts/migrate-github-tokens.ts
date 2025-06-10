#!/usr/bin/env node

/**
 * Migration script to encrypt existing GitHub tokens
 * This should be run once to migrate legacy unencrypted tokens
 */

import { createClient } from '@supabase/supabase-js';
import { encrypt } from '../lib/utils/crypto';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Ensure encryption key is set
if (!process.env.ENCRYPTION_KEY) {
  console.error('ENCRYPTION_KEY must be set in environment variables');
  console.log('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateTokens() {
  console.log('Starting GitHub token encryption migration...');

  try {
    // Fetch all integrations with unencrypted tokens
    const { data: integrations, error: fetchError } = await supabase
      .from('github_integrations')
      .select('*')
      .not('access_token', 'is', null)
      .is('encrypted_access_token', null);

    if (fetchError) {
      console.error('Failed to fetch integrations:', fetchError);
      return;
    }

    if (!integrations || integrations.length === 0) {
      console.log('No unencrypted tokens found. Migration complete!');
      return;
    }

    console.log(`Found ${integrations.length} integrations to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const integration of integrations) {
      try {
        console.log(`Migrating integration ${integration.id} for user ${integration.user_id}`);

        // Encrypt access token
        const encryptedAccessToken = encrypt(integration.access_token);
        
        // Encrypt refresh token if present
        let encryptedRefreshToken = null;
        if (integration.refresh_token) {
          encryptedRefreshToken = encrypt(integration.refresh_token);
        }

        // Update the integration with encrypted tokens
        const updateData: any = {
          encrypted_access_token: encryptedAccessToken.encrypted,
          access_token_iv: encryptedAccessToken.iv,
          access_token_tag: encryptedAccessToken.tag,
        };

        if (encryptedRefreshToken) {
          updateData.encrypted_refresh_token = encryptedRefreshToken.encrypted;
          updateData.refresh_token_iv = encryptedRefreshToken.iv;
          updateData.refresh_token_tag = encryptedRefreshToken.tag;
        }

        const { error: updateError } = await supabase
          .from('github_integrations')
          .update(updateData)
          .eq('id', integration.id);

        if (updateError) {
          console.error(`Failed to update integration ${integration.id}:`, updateError);
          errorCount++;
          
          // Update migration status
          await supabase
            .from('token_migration_status')
            .upsert({
              table_name: 'github_integrations',
              record_id: integration.id,
              migration_status: 'failed',
              error_message: updateError.message,
            });
        } else {
          console.log(`Successfully migrated integration ${integration.id}`);
          successCount++;
          
          // Update migration status
          await supabase
            .from('token_migration_status')
            .upsert({
              table_name: 'github_integrations',
              record_id: integration.id,
              migration_status: 'completed',
            });
        }
      } catch (error) {
        console.error(`Error migrating integration ${integration.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\nAll tokens migrated successfully!');
      console.log('You can now remove the legacy columns with:');
      console.log('ALTER TABLE github_integrations DROP COLUMN access_token;');
      console.log('ALTER TABLE github_integrations DROP COLUMN refresh_token;');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });