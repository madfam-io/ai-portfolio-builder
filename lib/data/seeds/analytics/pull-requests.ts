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
import type { SeedingOptions } from '@/lib/database/seeder';
import type { PrismaClient } from '@prisma/client';

/**
 * Generate pull requests for a repository
 */
export function generatePullRequests(
  repositoryId: string,
  count: number
): unknown[] {
  const states = ['open', 'closed', 'merged'];
  const titles = [
    'Add new feature for user authentication',
    'Fix bug in data validation',
    'Improve performance of API endpoints',
    'Update documentation',
    'Refactor component structure',
    'Add unit tests for core functionality',
    'Fix security vulnerability',
    'Optimize database queries',
    'Update dependencies',
    'Improve error handling',
  ];

  const pullRequests = [];

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    );
    const state = states[Math.floor(Math.random() * states.length)];

    // Generate realistic timing
    let mergedAt = null;
    let closedAt = null;
    let cycleTimeHours = null;
    let leadTimeHours = null;

    if (state === 'merged' || state === 'closed') {
      const closeTime = new Date(
        createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000
      );
      if (state === 'merged') {
        mergedAt = closeTime;
        cycleTimeHours = Math.floor(
          (closeTime.getTime() - createdAt.getTime()) / (60 * 60 * 1000)
        );
        leadTimeHours = cycleTimeHours + Math.floor(Math.random() * 48); // Add review time
      } else {
        closedAt = closeTime;
        cycleTimeHours = Math.floor(
          (closeTime.getTime() - createdAt.getTime()) / (60 * 60 * 1000)
        );
      }
    }

    pullRequests.push({
      id: `pr-${repositoryId}-${i}`,
      repositoryId: repositoryId,
      prNumber: i + 1,
      title: titles[i % titles.length],
      body: `Description for pull request ${i + 1}`,
      state,
      author: `contributor-${Math.floor(Math.random() * 5) + 1}`,
      assignees: JSON.stringify([]),
      reviewers: JSON.stringify([
        `reviewer-${Math.floor(Math.random() * 3) + 1}`,
      ]),
      labels: JSON.stringify(
        ['enhancement', 'feature'].slice(0, Math.floor(Math.random() * 2) + 1)
      ),
      additions: Math.floor(Math.random() * 300) + 10,
      deletions: Math.floor(Math.random() * 100) + 5,
      changedFiles: Math.floor(Math.random() * 10) + 1,
      commits: Math.floor(Math.random() * 8) + 1,
      comments: Math.floor(Math.random() * 15),
      reviewComments: Math.floor(Math.random() * 8),
      cycleTimeHours: cycleTimeHours,
      leadTimeHours: leadTimeHours,
      createdAt: createdAt,
      updatedAt: new Date(
        createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      mergedAt: mergedAt,
      closedAt: closedAt,
    });
  }

  return pullRequests;
}

/**
 * Seed pull requests table
 */
export async function seedPullRequests(
  client: PrismaClient,
  options: SeedingOptions
): Promise<number> {
  // NOTE: PullRequest model does not exist in the current Prisma schema
  // The following code is commented out until the model is added to the schema
  
  logger.info('Skipping pull requests seeding - PullRequest model not found in schema');
  return 0;
  
  /*
  logger.info('Seeding pull requests...');

  try {
    // Check for existing pull requests
    const existingCount = await client.pullRequest.count();

    if (existingCount && existingCount > 0 && options.skipExisting) {
      logger.info(
        `Pull requests table already has ${existingCount} records, skipping`
      );
      return existingCount || 0;
    }

    // Get all repositories
    const repositories = await client.repository.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    if (repositories.length === 0) {
      logger.warn('No repositories found, skipping pull requests seeding');
      return 0;
    }

    // Generate pull requests for all repositories
    const allPullRequests = [];
    for (const repo of repositories) {
      const prCount = Math.floor(Math.random() * 10) + 5; // 5-15 PRs per repo
      const pullRequests = generatePullRequests(repo.id, prCount);
      allPullRequests.push(...pullRequests);
    }

    // Insert pull requests in batches
    const batchSize = options.batchSize || 20;
    let insertedCount = 0;

    for (let i = 0; i < allPullRequests.length; i += batchSize) {
      const batch = allPullRequests.slice(i, i + batchSize);

      const result = await client.pullRequest.createMany({
        data: batch,
        skipDuplicates: true
      });

      insertedCount += result.count;
    }

    logger.info(`Successfully seeded ${insertedCount} pull requests`);
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding pull requests:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
  */
}
