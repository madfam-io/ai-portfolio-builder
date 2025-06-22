#!/usr/bin/env tsx

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

/**
 * @fileoverview Supabase Migration Runner
 * @module scripts/run-migration
 *
 * Script to run SQL migrations against the Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

async function runMigration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get migration file path from command line argument
    const migrationFile = process.argv[2];
    if (!migrationFile) {
      console.error(
        'Usage: pnpm tsx scripts/run-migration.ts <migration-file>'
      );
      console.error(
        'Example: pnpm tsx scripts/run-migration.ts supabase/migrations/001_create_portfolios_table.sql'
      );
      process.exit(1);
    }

    // Read migration file
    const migrationPath = path.join(process.cwd(), migrationFile);
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    console.log(`Running migration: ${migrationFile}`);
    console.log('Migration SQL preview (first 200 chars):');
    console.log(migrationSQL.substring(0, 200) + '...');

    // Execute migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('exec_sql RPC not available, trying alternative method...');

      // Split migration into individual statements
      const statements = migrationSQL
        .split(';')
        .filter(stmt => stmt.trim().length > 0)
        .map(stmt => stmt.trim() + ';');

      console.log(`Found ${statements.length} SQL statements to execute`);

      // Note: Direct SQL execution is not available in Supabase client
      // You'll need to run migrations through Supabase Dashboard or CLI
      console.error(
        '\n⚠️  Direct SQL execution is not available through the Supabase JS client.'
      );
      console.error(
        'Please run this migration using one of the following methods:'
      );
      console.error('\n1. Supabase Dashboard:');
      console.error(
        '   - Go to https://app.supabase.com/project/djdioapdziwrjqbqzykf/sql/new'
      );
      console.error('   - Paste the migration SQL and run it');
      console.error('\n2. Supabase CLI:');
      console.error('   - Install: npm install -g supabase');
      console.error('   - Run: supabase db push');

      console.log('\n📋 Migration file location:', migrationPath);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
