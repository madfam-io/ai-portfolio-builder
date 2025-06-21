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

import { logger } from '@/lib/utils/logger';
import { getSeedConfig } from '../index';
import type { SeedingOptions } from '@/lib/database/seeder';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generate commit analytics for a repository
 */
export function generateCommitAnalytics(
  repositoryId: string,
  daysBack: number
): unknown[] {
  const analytics = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Skip some days to make it realistic (not every day has commits)
    if (Math.random() < 0.3) continue; // 70% of days have commits

    const commitCount = Math.floor(Math.random() * 15) + 1;
    const uniqueAuthors = Math.min(
      commitCount,
      Math.floor(Math.random() * 4) + 1
    );
    const additions = Math.floor(Math.random() * 500) + 50;
    const deletions = Math.floor(Math.random() * 200) + 10;
    const peakHour = Math.floor(Math.random() * 24); // Random peak hour

    analytics.push({
      id: `commit-analytics-${repositoryId}-${dateString}`,
      repository_id: repositoryId,
      commit_date: dateString,
      commit_count: commitCount,
      unique_authors: uniqueAuthors,
      additions,
      deletions,
      peak_hour: peakHour,
      created_at: new Date(
        date.getTime() + Math.random() * 24 * 60 * 60 * 1000
      ),
    });
  }

  return analytics;
}

/**
 * Seed commit analytics table
 */
export async function seedCommitAnalytics(
  client: SupabaseClient,
  options: SeedingOptions
): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding commit analytics for ${analyticsDays} days...`);

  try {
    // Check for existing analytics
    const { count: existingCount } = await client
      .from('commit_analytics')
      .select('*', { count: 'exact', head: true });

    if (existingCount && existingCount > 0 && options.skipExisting) {
      logger.info(
        `Commit analytics table already has ${existingCount} records, skipping`
      );
      return existingCount || 0;
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
      logger.warn('No repositories found, skipping commit analytics seeding');
      return 0;
    }

    // Generate analytics for all repositories
    const allAnalytics = [];
    for (const repo of repositories) {
      const analytics = generateCommitAnalytics(repo.id, analyticsDays);
      allAnalytics.push(...analytics);
    }

    // Insert analytics in batches
    const batchSize = options.batchSize || 50;
    let insertedCount = 0;

    for (let i = 0; i < allAnalytics.length; i += batchSize) {
      const batch = allAnalytics.slice(i, i + batchSize);

      const { data, error } = await client
        .from('commit_analytics')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(
          `Error inserting commit analytics batch ${i / batchSize + 1}:`,
          error
        );
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(
      `Successfully seeded ${insertedCount} commit analytics records`
    );
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding commit analytics:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}
