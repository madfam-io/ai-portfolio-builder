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

import { logger } from '@/lib/utils/logger';
import { getSeedConfig } from '../index';
import type { SeedingOptions } from '@/lib/database/seeder';
import type { PrismaClient } from '@prisma/client';

/**
 * Generate code metrics for a repository
 */
export function generateCodeMetrics(
  repositoryId: string,
  daysBack: number
): unknown[] {
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
      repositoryId: repositoryId,
      metricDate: dateString,
      locTotal: currentLoc,
      locByLanguage: JSON.stringify(adjustedLanguages),
      fileCount:
        Object.keys(languages).length + Math.floor(Math.random() * 10),
      commitCount: Math.floor(Math.random() * 20) + 1,
      contributorCount: Math.floor(Math.random() * 5) + 1,
      commitsLast30Days: Math.floor(Math.random() * 100) + 10,
      contributorsLast30Days: Math.floor(Math.random() * 8) + 1,
      calculatedAt: new Date(
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
  client: PrismaClient,
  options: SeedingOptions
): Promise<number> {
  // NOTE: CodeMetric model does not exist in the current Prisma schema
  // The following code is commented out until the model is added to the schema
  
  logger.info('Skipping code metrics seeding - CodeMetric model not found in schema');
  return 0;
  
  /*
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding code metrics for ${analyticsDays} days...`);

  try {
    // Check for existing metrics
    const existingCount = await client.codeMetric.count();

    if (existingCount && existingCount > 0 && options.skipExisting) {
      logger.info(
        `Code metrics table already has ${existingCount} records, skipping`
      );
      return existingCount || 0;
    }

    // Get all repositories
    const repositories = await client.repository.findMany({
      where: { isActive: true },
      select: { id: true }
    });

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

      const result = await client.codeMetric.createMany({
        data: batch,
        skipDuplicates: true
      });

      insertedCount += result.count;
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
  */
}
