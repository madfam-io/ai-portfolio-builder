import { logger } from '@/lib/utils/logger';

import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * @fileoverview Seed Data Orchestrator
 * @module data/seeds/index
 *
 * Central orchestrator for all seeding operations.
 * Manages dependencies and execution order.
 */

export type SeedFunction = (
  client: unknown,
  options: SeedingOptions
) => Promise<number>;

/**
 * Seed execution configuration
 */
interface SeedConfig {
  name: string;
  dependencies: string[];
  fn: SeedFunction;
  critical: boolean; // If true, failure stops the entire seeding process
}

/**
 * Master seed configuration
 * Defines execution order and dependencies
 */
export const SEED_CONFIG: SeedConfig[] = [
  {
    name: 'subscription_plans',
    dependencies: [],
    fn: async client => {
      // Subscription plans are inserted via migration, just verify
      const { count } = await client
        .from('subscription_plans')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    critical: true,
  },
  {
    name: 'users',
    dependencies: ['subscription_plans'],
    fn: async (client, options) => {
      const { seedUsers } = await import('./users');
      return await seedUsers(client, options);
    },
    critical: true,
  },
  {
    name: 'portfolios',
    dependencies: ['users'],
    fn: async (client, options) => {
      const { seedPortfolios } = await import('./portfolios');
      return await seedPortfolios(client, options);
    },
    critical: false,
  },
  {
    name: 'github_integrations',
    dependencies: ['users'],
    fn: async (client, options) => {
      const { seedGitHubIntegrations } = await import('./github-data');
      return await seedGitHubIntegrations(client, options);
    },
    critical: false,
  },
  {
    name: 'repositories',
    dependencies: ['github_integrations'],
    fn: async (client, options) => {
      const { seedRepositories } = await import('./github-data');
      return await seedRepositories(client, options);
    },
    critical: false,
  },
  {
    name: 'analytics',
    dependencies: ['portfolios', 'repositories'],
    fn: async (client, options) => {
      const { seedAnalytics } = await import('./analytics');
      return await seedAnalytics(client, options);
    },
    critical: false,
  },
];

/**
 * Execute all seeding in proper dependency order
 */
export async function executeSeeding(
  client: unknown,
  options: SeedingOptions
): Promise<{
  success: boolean;
  completed: string[];
  failed: string[];
  totalRecords: number;
}> {
  const result = {
    success: true,
    completed: [] as string[],
    failed: [] as string[],
    totalRecords: 0,
  };

  // Resolve execution order based on dependencies
  const executionOrder = resolveDependencies(SEED_CONFIG);

  logger.info(`Executing seeding in order: ${executionOrder.join(' → ')}`);

  for (const seedName of executionOrder) {
    const config = SEED_CONFIG.find(c => c.name === seedName);
    if (!config) {
      logger.warn(`Seed configuration not found for: ${seedName}`);
      continue;
    }

    try {
      logger.info(`Seeding ${seedName}...`);
      const count = await config.fn(client, options);
      result.completed.push(seedName);
      result.totalRecords += count;
      logger.info(`✅ Seeded ${count} records in ${seedName}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Failed to seed ${seedName}: ${errorMsg}`);
      result.failed.push(seedName);

      if (config.critical) {
        logger.error(`Critical seeding failed for ${seedName}, aborting`);
        result.success = false;
        break;
      }
    }
  }

  result.success = result.success && result.failed.length === 0;
  return result;
}

/**
 * Resolve dependency order using topological sort
 */
function resolveDependencies(configs: SeedConfig[]): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Build graph
  for (const config of configs) {
    graph.set(config.name, config.dependencies);
    inDegree.set(config.name, config.dependencies.length);
  }

  // Topological sort using Kahn's algorithm
  const queue: string[] = [];
  const result: string[] = [];

  // Find nodes with no dependencies
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    // Remove edges from current node
    for (const [node, dependencies] of graph) {
      if (dependencies.includes(current)) {
        const newDegree = inDegree.get(node)! - 1;
        inDegree.set(node, newDegree);

        if (newDegree === 0) {
          queue.push(node);
        }
      }
    }
  }

  // Check for circular dependencies
  if (result.length !== configs.length > 0) {
    const remaining = configs
      .map(c => c.name)
      .filter(name => !result.includes(name));
    throw new Error(
      `Circular dependency detected in seeds: ${remaining.join(', ')}`
    );
  }

  return result;
}

/**
 * Get seed data size configuration based on mode
 */
export function getSeedConfig(mode: SeedingOptions['mode']) {
  const configs = {
    minimal: {
      usersCount: 3,
      portfoliosPerUser: 1,
      repositoriesPerUser: 2,
      analyticsDays: 7,
    },
    demo: {
      usersCount: 10,
      portfoliosPerUser: 3,
      repositoriesPerUser: 5,
      analyticsDays: 30,
    },
    full: {
      usersCount: 50,
      portfoliosPerUser: 5,
      repositoriesPerUser: 10,
      analyticsDays: 90,
    },
    custom: {
      usersCount: parseInt(process.env.SEED_USERS_COUNT || '10'),
      portfoliosPerUser: parseInt(process.env.SEED_PORTFOLIOS_PER_USER || '3'),
      repositoriesPerUser: parseInt(process.env.SEED_REPOS_PER_USER || '5'),
      analyticsDays: parseInt(process.env.SEED_ANALYTICS_DAYS || '30'),
    },
  };

  return configs[mode] || configs.demo;
}
