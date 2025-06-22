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

import { createClient } from '@/lib/supabase/server';
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

// Type for repository contributor with nested contributor data
interface RepositoryContributorWithContributor extends RepositoryContributor {
  contributor?: Contributor;
}

/**
 * Dashboard Analytics Service
 *
 * Handles aggregation and formatting of analytics data for dashboard views.
 */
export class DashboardAnalyticsService {
  constructor(_userId: string) {
    // userId reserved for future use
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(
    repositories: Repository[]
  ): Promise<AnalyticsDashboardData> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      const repositoryIds = repositories.map(r => r.id);

      // Fetch aggregated metrics
      const { data: metricsData } = await supabase
        .from('code_metrics')
        .select('*')
        .in('repository_id', repositoryIds)
        .order('metric_date', { ascending: false });

      const metrics: CodeMetrics[] = metricsData || [];

      // Fetch recent pull requests
      const { data: prData } = await supabase
        .from('pull_requests')
        .select('*')
        .in('repository_id', repositoryIds)
        .order('created_at', { ascending: false })
        .limit(10);

      const pullRequests: PullRequest[] = prData || [];

      // Fetch top contributors
      const { data: contributorData } = await supabase
        .from('repository_contributors')
        .select(
          `
          *,
          contributor:contributors(*)
        `
        )
        .in('repository_id', repositoryIds)
        .order('commit_count', { ascending: false })
        .limit(5);

      const typedContributorData: RepositoryContributorWithContributor[] =
        contributorData || [];

      // Fetch commit trends
      const { data: commitData } = await supabase
        .from('commit_analytics')
        .select('*')
        .in('repository_id', repositoryIds)
        .gte(
          'commit_date',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )
        .order('commit_date', { ascending: true });

      const commitAnalytics: CommitAnalytics[] = commitData || [];

      // Calculate overview stats
      const overview = this.calculateOverviewStats(
        repositories,
        metrics,
        pullRequests,
        typedContributorData
      );

      // Process trends
      const trends = this.processTrends(commitAnalytics, pullRequests);

      return {
        repositories,
        overview,
        recentActivity: {
          commits: commitAnalytics.slice(0, 7),
          pullRequests: pullRequests.slice(0, 5),
        },
        trends,
      };
    } catch (error) {
      logger.error('Failed to get dashboard data', { error });
      throw error;
    }
  }

  /**
   * Calculate overview statistics
   */
  private calculateOverviewStats(
    repositories: Repository[],
    metrics: CodeMetrics[],
    pullRequests: PullRequest[],
    contributorData: RepositoryContributorWithContributor[]
  ) {
    const totalLOC = metrics.reduce((sum, m) => sum + (m.locTotal || 0), 0);
    const totalCommits = metrics.reduce(
      (sum, m) => sum + (m.commitCount || 0),
      0
    );
    const totalContributors = new Set(
      contributorData.map(rc => rc.contributor?.id).filter(Boolean)
    ).size;

    // Find most active repository
    const repoActivity = new Map<string, number>();
    metrics.forEach(m => {
      const current = repoActivity.get(m.repositoryId) || 0;
      repoActivity.set(m.repositoryId, current + (m.commitCount || 0));
    });

    const mostActiveRepoId = Array.from(repoActivity.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    const mostActiveRepository = repositories.find(
      r => r.id === mostActiveRepoId
    );

    return {
      totalRepositories: repositories.length,
      totalCommits,
      totalPullRequests: pullRequests.length,
      totalContributors,
      totalLinesOfCode: totalLOC,
      mostActiveRepository: mostActiveRepository
        ? {
            repository: mostActiveRepository,
            commitCount: mostActiveRepoId
              ? repoActivity.get(mostActiveRepoId) || 0
              : 0,
          }
        : undefined,
      topContributors: contributorData
        .filter(
          (
            rc
          ): rc is RepositoryContributorWithContributor & {
            contributor: Contributor;
          } => rc.contributor !== null && rc.contributor !== undefined
        )
        .slice(0, 5)
        .map(rc => ({
          contributor: rc.contributor,
          commitCount: rc.commitCount,
        })),
    };
  }

  /**
   * Process trend data
   */
  private processTrends(
    commitAnalytics: CommitAnalytics[],
    pullRequests: PullRequest[]
  ) {
    // Group commits by day
    const commitsByDayMap = new Map<string, number>();
    commitAnalytics.forEach(ca => {
      const currentCount = commitsByDayMap.get(ca.commitDate) || 0;
      commitsByDayMap.set(ca.commitDate, currentCount + ca.commitCount);
    });

    const commitsPerDay = Array.from(commitsByDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group PRs by week
    const prsByWeek = new Map<
      string,
      { opened: number; merged: number; closed: number }
    >();

    pullRequests.forEach(pr => {
      if (!pr.createdAt) return;

      const week = this.getWeekString(new Date(pr.createdAt));
      if (!prsByWeek.has(week)) {
        prsByWeek.set(week, { opened: 0, merged: 0, closed: 0 });
      }

      const weekData = prsByWeek.get(week);
      if (!weekData) return;
      weekData.opened++;
      if (pr.state === 'merged') weekData.merged++;
      if (pr.state === 'closed') weekData.closed++;
    });

    const pullRequestsPerWeek = Array.from(prsByWeek.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return {
      commitsPerDay,
      pullRequestsPerWeek,
    };
  }

  /**
   * Get week string in YYYY-WW format
   */
  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const days = Math.floor(
      (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }
}
