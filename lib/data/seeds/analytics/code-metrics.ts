import { logger } from '@/lib/utils/logger';
import { getSeedConfig } from '../index';
import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * Generate code metrics for a repository
 */
export function generateCodeMetrics(
  repositoryId: string,
  daysBack: number
): any[] {
  const metrics = [];
  const languages = {
    JavaScript: Math.floor(Math.random() * 10000) + 5000,
    TypeScript: Math.floor(Math.random() * 8000) + 3000,
    CSS: Math.floor(Math.random() * 2000) + 500,
    HTML: Math.floor(Math.random() * 1000) + 200,
  };

  const totalLoc = Object.values(languages).reduce(
    (sum, lines) => sum + lines,
    0
  );

  // Generate metrics for the last N days
  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Add some variance to the metrics over time
    const variance = 1 + (Math.random() - 0.5) * 0.1; // ±5% variance
    const currentLoc = Math.floor(totalLoc * variance);

    // Adjust languages proportionally
    const adjustedLanguages: { [key: string]: number } = {};
    Object.entries(languages).forEach(([lang, lines]) => {
      adjustedLanguages[lang] = Math.floor(lines * variance);
    });

    metrics.push({
      id: `metrics-${repositoryId}-${dateString}`,
      repository_id: repositoryId,
      metric_date: dateString,
      loc_total: currentLoc,
      loc_by_language: JSON.stringify(adjustedLanguages),
      file_count:
        Object.keys(languages).length + Math.floor(Math.random() * 10),
      commit_count: Math.floor(Math.random() * 20) + 1,
      contributor_count: Math.floor(Math.random() * 5) + 1,
      commits_last_30_days: Math.floor(Math.random() * 100) + 10,
      contributors_last_30_days: Math.floor(Math.random() * 8) + 1,
      calculated_at: new Date(
        date.getTime() + Math.random() * 24 * 60 * 60 * 1000
      ),
    });
  }

  return metrics;
}

/**
 * Seed code metrics table
 */
export async function seedCodeMetrics(
  client: any,
  options: SeedingOptions
): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding code metrics for ${analyticsDays} days...`);

  try {
    // Check for existing metrics
    const { count: existingCount } = await client
      .from('code_metrics')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(
        `Code metrics table already has ${existingCount} records, skipping`
      );
      return existingCount;
    }

    // Get all repositories
    const { data: repositories, error: reposError } = await client
      .from('repositories')
      .select('id')
      .eq('is_active', true);

    if (reposError || !repositories) {
      throw new Error(`Failed to fetch repositories: ${reposError?.message}`);
    }

    if (repositories.length === 0) {
      logger.warn('No repositories found, skipping code metrics seeding');
      return 0;
    }

    // Generate metrics for all repositories
    const allMetrics = [];
    for (const repo of repositories) {
      const metrics = generateCodeMetrics(repo.id, analyticsDays);
      allMetrics.push(...metrics);
    }

    // Insert metrics in batches
    const batchSize = options.batchSize || 50;
    let insertedCount = 0;

    for (let i = 0; i < allMetrics.length; i += batchSize) {
      const batch = allMetrics.slice(i, i + batchSize);

      const { data, error } = await client
        .from('code_metrics')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(
          `Error inserting code metrics batch ${i / batchSize + 1}:`,
          error
        );
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} code metrics records`);
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding code metrics:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}
