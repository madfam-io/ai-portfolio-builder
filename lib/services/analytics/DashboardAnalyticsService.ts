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

import type {
  Repository,
  CodeMetrics,
  PullRequest,
  CommitAnalytics,
  AnalyticsDashboardData,
  RepositoryContributor,
  Contributor,
} from '@/types/analytics';

/**
 * Dashboard Analytics Service - Temporarily Simplified
 * Original implementation backed up to DashboardAnalyticsService.ts.bak
 */
export class DashboardAnalyticsService {
  async getDashboardData(
    repositories: Repository[]
  ): Promise<AnalyticsDashboardData> {
    logger.info('DashboardAnalyticsService temporarily returning mock data');

    // Return mock data for now
    return {
      repositories: repositories,
      overview: {
        totalRepositories: repositories.length,
        totalCommits: 0,
        totalPullRequests: 0,
        totalContributors: 0,
        totalLinesOfCode: 0,
        topContributors: [],
      },
      recentActivity: {
        commits: [],
        pullRequests: [],
      },
      trends: {
        commitsPerDay: [],
        pullRequestsPerWeek: [],
      },
    };
  }

  async getRepositoryMetrics(repositoryId: string): Promise<any> {
    logger.info('Getting repository metrics', { repositoryId });
    return {
      commits: 0,
      pullRequests: 0,
      contributors: 0,
      codeQuality: 0,
    };
  }
}

export default DashboardAnalyticsService;