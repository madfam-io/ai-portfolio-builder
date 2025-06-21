#!/usr/bin/env node

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
 * Script to migrate existing data to encrypted format
 * Run with: pnpm tsx scripts/migrate-encryption.ts
 */

import { config } from 'dotenv';
import {
  migrateTableToEncryption,
  getEncryptionMigrationStatus,
} from '@/lib/services/encryption-service';

// Load environment variables
config();

// Tables to migrate in order of priority
const TABLES_TO_MIGRATE = [
  'github_integrations', // OAuth tokens
  'linkedin_connections', // OAuth tokens
  'users', // User PII
  'repositories', // Webhook secrets
  'ai_enhancement_logs', // AI content
  'file_uploads', // Extracted CV data
  'contributors', // Contributor emails
  'portfolio_analytics', // IP addresses
];

// Batch size for migration
const BATCH_SIZE = 100;

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function printStatus() {
  console.log(
    `\n${colors.cyan}${colors.bright}Encryption Migration Status${colors.reset}`
  );
  console.log('─'.repeat(60));

  const statuses = await getEncryptionMigrationStatus();

  for (const status of statuses) {
    const icon =
      status.status === 'completed'
        ? '✓'
        : status.status === 'failed'
          ? '✗'
          : status.status === 'in_progress'
            ? '⟳'
            : '○';

    const color =
      status.status === 'completed'
        ? colors.green
        : status.status === 'failed'
          ? colors.red
          : status.status === 'in_progress'
            ? colors.yellow
            : '';

    const progress =
      status.total_records > 0
        ? `${status.encrypted_records}/${status.total_records} (${Math.round((status.encrypted_records / status.total_records) * 100)}%)`
        : '0/0';

    console.log(
      `${color}${icon} ${status.table_name.padEnd(25)} ${progress.padEnd(15)} ${status.status}${colors.reset}`
    );

    if (status.error_message) {
      console.log(
        `  ${colors.red}Error: ${status.error_message}${colors.reset}`
      );
    }
  }

  console.log('─'.repeat(60));
}

async function runMigration() {
  console.log(`${colors.bright}Starting Encryption Migration${colors.reset}\n`);

  // Check if encryption key is set
  if (!process.env.ENCRYPTION_KEY) {
    console.error(
      `${colors.red}Error: ENCRYPTION_KEY environment variable is not set${colors.reset}`
    );
    console.log('\nPlease set ENCRYPTION_KEY in your .env file:');
    console.log('ENCRYPTION_KEY=your-32-character-encryption-key');
    process.exit(1);
  }

  // Check Supabase connection
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error(
      `${colors.red}Error: Supabase environment variables are not set${colors.reset}`
    );
    process.exit(1);
  }

  // Show initial status
  await printStatus();

  // Ask for confirmation
  console.log(
    `\n${colors.yellow}⚠️  Warning: This will encrypt sensitive data in your database.${colors.reset}`
  );
  console.log(
    'Make sure you have backed up your database before proceeding.\n'
  );

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>(resolve => {
    readline.question('Do you want to continue? (yes/no): ', resolve);
  });

  readline.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('\nMigration cancelled.');
    process.exit(0);
  }

  console.log('\nStarting migration...\n');

  // Migrate each table
  for (const tableName of TABLES_TO_MIGRATE) {
    console.log(`\n${colors.bright}Migrating ${tableName}...${colors.reset}`);

    const startTime = Date.now();
    const result = await migrateTableToEncryption(tableName, BATCH_SIZE);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success) {
      console.log(
        `${colors.green}✓ ${tableName} migrated successfully in ${duration}s${colors.reset}`
      );
    } else {
      console.log(
        `${colors.red}✗ ${tableName} migration failed: ${result.error}${colors.reset}`
      );

      // Ask if we should continue
      const continueAnswer = await new Promise<string>(resolve => {
        const rl = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question(
          '\nDo you want to continue with other tables? (yes/no): ',
          (answer: string) => {
            rl.close();
            resolve(answer);
          }
        );
      });

      if (continueAnswer.toLowerCase() !== 'yes') {
        console.log('\nMigration stopped.');
        break;
      }
    }
  }

  // Show final status
  console.log('\n');
  await printStatus();

  console.log(`\n${colors.bright}Migration Complete!${colors.reset}`);
  console.log('\nNext steps:');
  console.log(
    '1. Test your application to ensure encryption is working correctly'
  );
  console.log('2. Update your API routes to use the encryption middleware');
  console.log(
    '3. Remove plaintext columns after confirming encrypted data is correct'
  );
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
      await printStatus();
      break;

    case 'migrate':
      await runMigration();
      break;

    case 'rollback':
      console.log(
        `${colors.yellow}Rollback functionality not implemented yet.${colors.reset}`
      );
      console.log('Please restore from your database backup.');
      break;

    default:
      console.log('Encryption Migration Tool\n');
      console.log('Usage:');
      console.log(
        '  pnpm tsx scripts/migrate-encryption.ts status   - Show migration status'
      );
      console.log(
        '  pnpm tsx scripts/migrate-encryption.ts migrate  - Run encryption migration'
      );
      console.log(
        '  pnpm tsx scripts/migrate-encryption.ts rollback - Rollback migration (not implemented)'
      );
  }

  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
