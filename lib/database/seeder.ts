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

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';
import type { PrismaClient } from '@prisma/client';

/**
 * @fileoverview Database Seeding Engine
 * @module database/seeder
 *
 * Provides intelligent database seeding with detection, validation,
 * and incremental data population for development environments.
 */

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
  private client: PrismaClient | null = null;
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
    this.client = prisma;
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
      if (!this.client) {
        logger.error('Database client not initialized');
        return false;
      }

      try {
        const userCount = await this.client.user.count();
        const portfolioCount = await this.client.portfolio.count();

        if (userCount === 0) {
          logger.info('User table is empty, seeding needed');
          return true;
        }

        if (portfolioCount === 0) {
          logger.info('Portfolio table is empty, seeding needed');
          return true;
        }
      } catch (error) {
        logger.warn('Error checking tables:', {
          error: (error as Error).message,
        });
        return true; // Assume seeding is needed if we can't check
      }

      logger.info('Database appears to be populated');
      return false;
    } catch (error) {
      logger.error(
        'Error checking if seeding is needed:',
        error instanceof Error ? error : new Error(String(error))
      );
      return true; // Assume seeding is needed if we can't check
    }
  }

  /**
   * Check database connectivity and schema
   */
  async validateDatabase(): Promise<boolean> {
    try {
      // Test basic connectivity
      if (!this.client) {
        logger.error('Database client not initialized');
        return false;
      }

      // Test basic connectivity with a simple query
      await this.client.user.findFirst();


      logger.info('Database connectivity validated');
      return true;
    } catch (error) {
      logger.error(
        'Database validation error:',
        error instanceof Error ? error : new Error(String(error))
      );
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
      result.errors = seedingResult.failed.map(
        name => `Failed to seed ${name}`
      );
      result.success = seedingResult.success;
      logger.info(
        `Seeding completed. Success: ${result.success}, Records: ${result.recordsCreated}`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(
        'Seeding failed:',
        error instanceof Error ? error : new Error(String(error))
      );
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
        if (!this.client) {
          logger.error('Database client not initialized');
          continue;
        }

        try {
          // Use Prisma deleteMany for clearing tables
          switch (table) {
            case 'users':
              await this.client.user.deleteMany({
                where: {
                  NOT: {
                    id: '00000000-0000-0000-0000-000000000000'
                  }
                }
              });
              break;
            case 'portfolios':
              await this.client.portfolio.deleteMany({
                where: {
                  NOT: {
                    id: '00000000-0000-0000-0000-000000000000'
                  }
                }
              });
              break;
            default:
              logger.warn(`Table ${table} not handled in Prisma migration`);
              continue;
          }
          logger.info(`Cleared table ${table}`);
        } catch (error) {
          logger.warn(`Error clearing table ${table}:`, {
            error: (error as Error).message,
          });
        }
      }

      logger.info('Database reset completed');
    } catch (error) {
      logger.error(
        'Database reset failed:',
        error instanceof Error ? error : new Error(String(error))
      );
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
      const tableStats: Record<string, number> = {};
      let totalRecords = 0;

      if (!this.client) {
        logger.error('Database client not initialized');
        return {
          isSeeded: false,
          tableStats: {},
        };
      }

      try {
        // Get counts using Prisma for main tables
        const userCount = await this.client.user.count();
        const portfolioCount = await this.client.portfolio.count();

        tableStats['users'] = userCount;
        tableStats['portfolios'] = portfolioCount;
        
        totalRecords = userCount + portfolioCount;
        
        // Note: repositories, github_integrations, and code_metrics would need 
        // to be added to Prisma schema if they exist
      } catch (error) {
        logger.warn('Error getting table counts:', {
          error: (error as Error).message,
        });
      }

      return {
        isSeeded: totalRecords > 0,
        tableStats,
        // Could track last seeded time in a metadata table
      };
    } catch (error) {
      logger.error(
        'Error getting seeding status:',
        error instanceof Error ? error : new Error(String(error))
      );
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
export async function quickSeed(
  options?: Partial<SeedingOptions>
): Promise<SeedingResult> {
  const seeder = new DatabaseSeeder({
    mode: 'demo',
    ...options,
  });

  await seeder.initialize();
  return seeder.seed();
}

/**
 * Check if database needs seeding (utility function)
 */
export async function isDatabaseEmpty(): Promise<boolean> {
  const seeder = new DatabaseSeeder();
  await seeder.initialize();
  return seeder.needsSeeding();
}
