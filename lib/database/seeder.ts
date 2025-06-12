/**
 * @fileoverview Database Seeding Engine
 * @module database/seeder
 * 
 * Provides intelligent database seeding with detection, validation,
 * and incremental data population for development environments.
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export interface SeedingOptions {
  mode: 'minimal' | 'demo' | 'full' | 'custom';
  force?: boolean;
  skipExisting?: boolean;
  batchSize?: number;
}

export interface SeedingResult {
  success: boolean;
  tablesSeeded: string[];
  recordsCreated: number;
  errors: string[];
  duration: number;
}

/**
 * Database Seeding Engine
 * 
 * Handles intelligent seeding with conflict detection and incremental updates
 */
export class DatabaseSeeder {
  private client: any;
  private options: SeedingOptions;

  constructor(options: SeedingOptions = { mode: 'demo' }) {
    this.options = {
      batchSize: 100,
      skipExisting: true,
      ...options,
    };
  }

  /**
   * Initialize the seeder with database connection
   */
  async initialize(): Promise<void> {
    this.client = await createClient();
    if (!this.client) {
      throw new Error('Failed to initialize database connection');
    }
    logger.info('Database seeder initialized');
  }

  /**
   * Check if database needs seeding
   */
  async needsSeeding(): Promise<boolean> {
    try {
      // Check if core tables have data
      const tables = ['users', 'portfolios', 'subscription_plans'];
      
      for (const table of tables) {
        const { count, error } = await this.client
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          logger.warn(`Error checking table ${table}:`, error);
          continue;
        }

        if (count === 0) {
          logger.info(`Table ${table} is empty, seeding needed`);
          return true;
        }
      }

      logger.info('Database appears to be populated');
      return false;
    } catch (error) {
      logger.error('Error checking if seeding is needed:', error instanceof Error ? error : new Error(String(error)));
      return true; // Assume seeding is needed if we can't check
    }
  }

  /**
   * Check database connectivity and schema
   */
  async validateDatabase(): Promise<boolean> {
    try {
      // Test basic connectivity
      const { error } = await this.client
        .from('subscription_plans')
        .select('id')
        .limit(1);

      if (error) {
        logger.error('Database validation failed:', error);
        return false;
      }

      logger.info('Database connectivity validated');
      return true;
    } catch (error) {
      logger.error('Database validation error:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Execute seeding process
   */
  async seed(): Promise<SeedingResult> {
    const startTime = Date.now();
    const result: SeedingResult = {
      success: false,
      tablesSeeded: [],
      recordsCreated: 0,
      errors: [],
      duration: 0,
    };

    try {
      logger.info(`Starting database seeding in ${this.options.mode} mode`);

      // Check if seeding is needed
      if (!this.options.force && !(await this.needsSeeding())) {
        logger.info('Database already contains data, skipping seeding');
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Validate database connection
      if (!(await this.validateDatabase())) {
        throw new Error('Database validation failed');
      }

      // Use the centralized seeding orchestrator
      const { executeSeeding } = await import('@/lib/data/seeds/index');
      
      const seedingResult = await executeSeeding(this.client, this.options);
      
      result.tablesSeeded = seedingResult.completed;
      result.recordsCreated = seedingResult.totalRecords;
      result.errors = seedingResult.failed.map(name => `Failed to seed ${name}`);
      result.success = seedingResult.success;
      logger.info(`Seeding completed. Success: ${result.success}, Records: ${result.recordsCreated}`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Seeding failed:', error instanceof Error ? error : new Error(String(error)));
      result.errors.push(errorMsg);
      result.success = false;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Reset all seed data (use with caution)
   */
  async reset(): Promise<void> {
    logger.warn('Resetting all seed data...');
    
    try {
      // Delete in reverse dependency order
      const tables = [
        'analytics_cache',
        'commit_analytics', 
        'repository_contributors',
        'pull_requests',
        'code_metrics',
        'repositories',
        'github_integrations',
        'portfolio_analytics',
        'ai_enhancement_logs',
        'file_uploads',
        'portfolios',
        'users',
      ];

      for (const table of tables) {
        const { error } = await this.client
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except system records

        if (error) {
          logger.warn(`Error clearing table ${table}:`, error);
        } else {
          logger.info(`Cleared table ${table}`);
        }
      }

      logger.info('Database reset completed');
    } catch (error) {
      logger.error('Database reset failed:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get seeding status and statistics
   */
  async getStatus(): Promise<{
    isSeeded: boolean;
    tableStats: Record<string, number>;
    lastSeeded?: Date;
  }> {
    try {
      const tables = [
        'users', 'portfolios', 'repositories', 
        'github_integrations', 'code_metrics'
      ];
      
      const tableStats: Record<string, number> = {};
      let totalRecords = 0;

      for (const table of tables) {
        const { count, error } = await this.client
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          tableStats[table] = count || 0;
          totalRecords += count || 0;
        }
      }

      return {
        isSeeded: totalRecords > 0,
        tableStats,
        // Could track last seeded time in a metadata table
      };
    } catch (error) {
      logger.error('Error getting seeding status:', error instanceof Error ? error : new Error(String(error)));
      return {
        isSeeded: false,
        tableStats: {},
      };
    }
  }
}

/**
 * Quick seeding function for development
 */
export async function quickSeed(options?: Partial<SeedingOptions>): Promise<SeedingResult> {
  const seeder = new DatabaseSeeder({
    mode: 'demo',
    ...options,
  });

  await seeder.initialize();
  return await seeder.seed();
}

/**
 * Check if database needs seeding (utility function)
 */
export async function isDatabaseEmpty(): Promise<boolean> {
  const seeder = new DatabaseSeeder();
  await seeder.initialize();
  return await seeder.needsSeeding();
}