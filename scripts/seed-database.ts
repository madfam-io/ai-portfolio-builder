#!/usr/bin/env tsx
/**
 * @fileoverview Database Seeding CLI Script
 * @module scripts/seed-database
 * 
 * Command-line tool for seeding the database with development data.
 * Supports different modes and configuration options.
 */

import { DatabaseSeeder } from '@/lib/database/seeder';
import { logger } from '@/lib/utils/logger';
import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * Parse command line arguments
 */
function parseArgs(): SeedingOptions & { help?: boolean; status?: boolean; reset?: boolean } {
  const args = process.argv.slice(2);
  const options: SeedingOptions & { help?: boolean; status?: boolean; reset?: boolean } = {
    mode: 'demo',
    force: false,
    skipExisting: true,
    batchSize: 100,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      
      case '--mode':
      case '-m':
        if (nextArg && ['minimal', 'demo', 'full', 'custom'].includes(nextArg)) {
          options.mode = nextArg as SeedingOptions['mode'];
          i++; // Skip next argument
        } else {
          throw new Error('Invalid mode. Use: minimal, demo, full, or custom');
        }
        break;
      
      case '--force':
      case '-f':
        options.force = true;
        break;
      
      case '--no-skip-existing':
        options.skipExisting = false;
        break;
      
      case '--batch-size':
      case '-b':
        if (nextArg && !isNaN(parseInt(nextArg))) {
          options.batchSize = parseInt(nextArg);
          i++; // Skip next argument
        } else {
          throw new Error('Invalid batch size. Must be a number.');
        }
        break;
      
      case '--status':
      case '-s':
        options.status = true;
        break;
      
      case '--reset':
      case '-r':
        options.reset = true;
        break;
      
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
🌱 Database Seeding CLI

USAGE:
  pnpm seed [OPTIONS]

OPTIONS:
  -h, --help              Show this help message
  -m, --mode MODE         Seeding mode: minimal, demo, full, custom (default: demo)
  -f, --force             Force seeding even if data exists
  --no-skip-existing      Don't skip existing records (may cause conflicts)
  -b, --batch-size SIZE   Batch size for inserts (default: 100)
  -s, --status            Show current seeding status
  -r, --reset             Reset all seed data (DESTRUCTIVE!)

MODES:
  minimal    - 3 users, 1 portfolio each, 7 days analytics
  demo       - 10 users, 3 portfolios each, 30 days analytics  
  full       - 50 users, 5 portfolios each, 90 days analytics
  custom     - Use environment variables for configuration

ENVIRONMENT VARIABLES (custom mode):
  SEED_USERS_COUNT           - Number of users to create
  SEED_PORTFOLIOS_PER_USER   - Portfolios per user
  SEED_REPOS_PER_USER        - GitHub repositories per user
  SEED_ANALYTICS_DAYS        - Days of analytics data

EXAMPLES:
  pnpm seed                           # Seed with demo data
  pnpm seed --mode minimal            # Minimal dataset
  pnpm seed --mode full --force       # Full dataset, overwrite existing
  pnpm seed --status                  # Check current status
  pnpm seed --reset                   # Reset all data (be careful!)

NOTE: Make sure your database is running and environment variables are set.
`);
}

/**
 * Display seeding status
 */
async function showStatus(): Promise<void> {
  try {
    const seeder = new DatabaseSeeder();
    await seeder.initialize();
    
    const status = await seeder.getStatus();
    
    console.log('📊 Database Seeding Status\n');
    console.log(`Seeded: ${status.isSeeded ? '✅ Yes' : '❌ No'}`);
    
    if (Object.keys(status.tableStats).length > 0) {
      console.log('\nTable Statistics:');
      Object.entries(status.tableStats).forEach(([table, count]) => {
        console.log(`  ${table.padEnd(20)} ${count.toString().padStart(8)} records`);
      });
    }
    
    if (status.lastSeeded) {
      console.log(`\nLast Seeded: ${status.lastSeeded.toISOString()}`);
    }
    
  } catch (error) {
    logger.error('Failed to get seeding status:', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

/**
 * Reset all seed data
 */
async function resetData(): Promise<void> {
  try {
    console.log('⚠️  WARNING: This will delete all seed data!');
    console.log('This action cannot be undone.\n');
    
    // Simple confirmation in Node.js environment
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      readline.question('Type "RESET" to confirm: ', resolve);
    });
    
    readline.close();
    
    if (answer !== 'RESET') {
      console.log('Reset cancelled.');
      return;
    }
    
    console.log('🗑️  Resetting database...');
    
    const seeder = new DatabaseSeeder();
    await seeder.initialize();
    await seeder.reset();
    
    console.log('✅ Database reset completed');
    
  } catch (error) {
    logger.error('Failed to reset database:', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

/**
 * Main seeding function
 */
async function seedDatabase(options: SeedingOptions): Promise<void> {
  try {
    console.log(`🌱 Starting database seeding in "${options.mode}" mode...\n`);
    
    const seeder = new DatabaseSeeder(options);
    await seeder.initialize();
    
    const result = await seeder.seed();
    
    console.log('\n📈 Seeding Results:');
    console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Tables Seeded: ${result.tablesSeeded.join(', ')}`);
    console.log(`Records Created: ${result.recordsCreated}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.success) {
      console.log('\n🎉 Database seeding completed successfully!');
      console.log('\nNext steps:');
      console.log('  - Start your development server: pnpm dev');
      console.log('  - Visit the analytics page to see the seeded data');
      console.log('  - Check portfolio galleries for generated content');
    } else {
      console.log('\n💥 Seeding failed. Check the logs above for details.');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('Seeding failed:', error instanceof Error ? error : new Error(String(error)));
    console.log('\n💥 Fatal error during seeding. Check your database connection and configuration.');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const options = parseArgs();
    
    if (options.help) {
      showHelp();
      return;
    }
    
    if (options.status) {
      await showStatus();
      return;
    }
    
    if (options.reset) {
      await resetData();
      return;
    }
    
    // Remove CLI-specific options before passing to seeder
    const { help, status, reset, ...seedingOptions } = options;
    await seedDatabase(seedingOptions);
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error('❌ Unknown error occurred');
    }
    console.log('\nUse --help for usage information.');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}