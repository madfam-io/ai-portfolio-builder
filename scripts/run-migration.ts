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
 * @fileoverview Prisma Migration Runner
 * @module scripts/run-migration
 *
 * Script to run SQL migrations using Prisma
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

async function runMigration() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Missing DATABASE_URL environment variable');
    }

    // Create Prisma client
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Get migration file path from command line argument
    const migrationFile = process.argv[2];
    if (!migrationFile) {
      console.error(
        'Usage: pnpm tsx scripts/run-migration.ts <migration-file>'
      );
      console.error(
        'Example: pnpm tsx scripts/run-migration.ts prisma/migrations/001_create_portfolios_table.sql'
      );
      process.exit(1);
    }

    // Read migration file
    const migrationPath = path.join(process.cwd(), migrationFile);
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    console.log(`Running migration: ${migrationFile}`);
    console.log('Migration SQL preview (first 200 chars):');
    console.log(migrationSQL.substring(0, 200) + '...');

    // Execute raw SQL migration using Prisma
    try {
      // Split migration into individual statements
      const statements = migrationSQL
        .split(';')
        .filter(stmt => stmt.trim().length > 0)
        .map(stmt => stmt.trim());

      console.log(`Found ${statements.length} SQL statements to execute`);

      // Execute each statement
      for (const [index, statement] of statements.entries()) {
        if (statement.trim()) {
          console.log(`Executing statement ${index + 1}/${statements.length}...`);
          await prisma.$executeRawUnsafe(statement);
        }
      }

      console.log('✅ Migration completed successfully!');
    } catch (migrationError) {
      console.error('❌ Migration execution failed:', migrationError);
      console.error(
        '\n⚠️  If you need to run complex migrations, consider using Prisma migrate:'
      );
      console.error('   - npx prisma migrate dev --name migration_name');
      console.error('   - npx prisma db push');
      console.log('\n📋 Migration file location:', migrationPath);
      throw migrationError;
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
