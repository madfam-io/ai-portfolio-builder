import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * @fileoverview Analytics and Metrics Seed Data
 * @module data/seeds/analytics
 *
 * Orchestrates seeding of realistic analytics data including portfolio views,
 * code metrics, commit analytics, pull requests, and performance metrics.
 */

// Import individual seed modules
import { seedCodeMetrics } from './analytics/code-metrics';
import { seedCommitAnalytics } from './analytics/commit-analytics';
import { seedPullRequests } from './analytics/pull-requests';
import { seedPortfolioAnalytics } from './analytics/portfolio-analytics';

// Re-export individual seed functions
export { seedCodeMetrics } from './analytics/code-metrics';
export { seedCommitAnalytics } from './analytics/commit-analytics';
export { seedPullRequests } from './analytics/pull-requests';
export { seedPortfolioAnalytics } from './analytics/portfolio-analytics';

/**
 * Combined seeding function for all analytics
 */
export async function seedAnalytics(
  client: unknown,
  options: SeedingOptions
): Promise<number> {
  let totalCount = 0;

  // Seed in dependency order
  totalCount += await seedCodeMetrics(client, options);
  totalCount += await seedCommitAnalytics(client, options);
  totalCount += await seedPullRequests(client, options);
  totalCount += await seedPortfolioAnalytics(client, options);

  return totalCount;
}
