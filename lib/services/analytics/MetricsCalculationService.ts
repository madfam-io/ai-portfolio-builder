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

import { GitHubAnalyticsClient } from '@/lib/analytics/github/client';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

import type {
  CodeMetrics,
  PullRequest,
  CommitAnalytics,
  Repository,
} from '@/types/analytics';

/**
 * Metrics Calculation Service
 *
 * Handles calculation and syncing of various metrics including
 * code metrics, pull request stats, and commit analytics.
 */
export class MetricsCalculationService {
  private githubClient: GitHubAnalyticsClient;

  constructor(_userId: string, githubClient: GitHubAnalyticsClient) {
    this.githubClient = githubClient;
  }

  /**
   * Sync repository metrics
   */
  async syncRepositoryMetrics(repository: Repository): Promise<CodeMetrics> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Fetch languages from GitHub
      const languages = await this.githubClient.fetchLanguages(
        repository.owner,
        repository.name
      );

      // Calculate total lines of code
      const locTotal = Object.values(languages).reduce(
        (sum, lines) => sum + lines,
        0
      );

      // Fetch recent commits for activity metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const commits = await this.githubClient.fetchCommits(
        repository.owner,
        repository.name,
        { since: thirtyDaysAgo }
      );

      // Get unique contributors
      const uniqueContributors = new Set(
        commits
          .map(commit => commit.author?.login || commit.commit.author.email)
          .filter(Boolean)
      );

      // Create or update today's metrics
      const today = new Date().toISOString().split('T')[0];

      const metricsData = {
        repository_id: repository.id,
        metric_date: today,
        loc_total: locTotal,
        loc_by_language: languages,
        file_count: Object.keys(languages).length,
        commit_count: commits.length,
        contributor_count: uniqueContributors.size,
        commits_last_30_days: commits.length,
        contributors_last_30_days: uniqueContributors.size,
        calculated_at: new Date().toISOString(),
      };

      const { data: metrics, error } = await supabase
        .from('code_metrics')
        .upsert(metricsData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to upsert code metrics', { error });
        throw error;
      }

      return metrics as CodeMetrics;
    } catch (error) {
      logger.error('Failed to sync repository metrics', {
        repositoryId: repository.id,
        error,
      });
      throw error;
    }
  }

  /**
   * Sync pull requests for a repository
   */
  async syncPullRequests(repository: Repository): Promise<PullRequest[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Fetch pull requests from GitHub
      const githubPRs = await this.githubClient.fetchPullRequests(
        repository.owner,
        repository.name,
        { state: 'all' }
      );

      const pullRequests: PullRequest[] = [];

      // Upsert pull requests to database
      for (const githubPR of githubPRs) {
        // Fetch detailed PR info for metrics
        const detailedPR = await this.githubClient.fetchPullRequestDetails(
          repository.owner,
          repository.name,
          githubPR.number
        );

        const prData = GitHubAnalyticsClient.transformPullRequest(
          detailedPR,
          repository.id
        );

        const { data: pr, error } = await supabase
          .from('pull_requests')
          .upsert(prData)
          .select()
          .single();

        if (error) {
          logger.error('Failed to upsert pull request', { error, prData });
          continue;
        }

        pullRequests.push(pr as PullRequest);
      }

      return pullRequests;
    } catch (error) {
      logger.error('Failed to sync pull requests', {
        repositoryId: repository.id,
        error,
      });
      throw error;
    }
  }

  /**
   * Sync commit analytics for a repository
   */
  async syncCommitAnalytics(repository: Repository, days = 30): Promise<void> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch commits from GitHub
      if (!repository.owner || !repository.name) {
        throw new Error('Repository owner or name is missing');
      }

      const commits = await this.githubClient.fetchCommits(
        repository.owner,
        repository.name,
        { since: startDate, until: endDate }
      );

      // Group commits by date
      const commitsByDate = new Map<string, typeof commits>();

      commits.forEach(commit => {
        const authorDate = commit.commit.author.date;
        if (!authorDate) return;

        const isoDate = new Date(authorDate).toISOString();
        const date = isoDate.split('T')[0];
        if (!date) return;

        if (!commitsByDate.has(date)) {
          commitsByDate.set(date, []);
        }
        const commits = commitsByDate.get(date);
        if (commits) commits.push(commit);
      });

      // Create analytics entries
      for (const [date, dateCommits] of commitsByDate) {
        const uniqueAuthors = new Set(
          dateCommits.map(c => c.author?.login || c.commit.author.email)
        );

        const additions = dateCommits.reduce(
          (sum, c) => sum + (c.stats?.additions || 0),
          0
        );
        const deletions = dateCommits.reduce(
          (sum, c) => sum + (c.stats?.deletions || 0),
          0
        );

        // Find peak hour
        const hourCounts = new Map<number, number>();
        dateCommits.forEach(commit => {
          const hour = new Date(commit.commit.author.date).getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        const peakHour = Array.from(hourCounts.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];

        await supabase.from('commit_analytics').upsert({
          repository_id: repository.id,
          commit_date: date,
          commit_count: dateCommits.length,
          unique_authors: uniqueAuthors.size,
          additions,
          deletions,
          peak_hour: peakHour,
        });
      }
    } catch (error) {
      logger.error('Failed to sync commit analytics', {
        repositoryId: repository.id,
        error,
      });
      throw error;
    }
  }

  /**
   * Sync contributors for a repository
   */
  async syncContributors(repository: Repository): Promise<void> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Fetch contributors from GitHub
      const githubContributors = await this.githubClient.fetchContributors(
        repository.owner,
        repository.name
      );

      // Process each contributor
      for (const githubContributor of githubContributors) {
        // Fetch detailed user info
        const userDetails = await this.githubClient.fetchUser(
          githubContributor.login
        );

        // Upsert contributor
        const { data: contributor, error: contributorError } = await supabase
          .from('contributors')
          .upsert({
            github_id: userDetails.githubId,
            login: userDetails.login,
            name: userDetails.name,
            email: userDetails.email,
            avatar_url: userDetails.avatarUrl,
            company: userDetails.company,
            location: userDetails.location,
            bio: userDetails.bio,
            public_repos: userDetails.publicRepos,
            followers: userDetails.followers,
            following: userDetails.following,
            github_created_at: userDetails.githubCreatedAt,
            last_seen_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (contributorError) {
          logger.error('Failed to upsert contributor', { contributorError });
          continue;
        }

        // Link contributor to repository
        await supabase.from('repository_contributors').upsert({
          repository_id: repository.id,
          contributor_id: contributor.id,
          commit_count: githubContributor.contributions,
          is_active: true,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Failed to sync contributors', {
        repositoryId: repository.id,
        error,
      });
      throw error;
    }
  }

  /**
   * Calculate pull request statistics
   */
  calculatePullRequestStats(pullRequests: PullRequest[]): {
    averageCycleTime: number;
    averageLeadTime: number;
    mergeRate: number;
    averageTimeToFirstReview: number;
  } {
    const mergedPRs = pullRequests.filter(pr => pr.state === 'merged');

    const avgCycleTime =
      mergedPRs.length > 0
        ? mergedPRs.reduce((sum, pr) => sum + (pr.cycleTimeHours || 0), 0) /
          mergedPRs.length
        : 0;

    const avgLeadTime =
      mergedPRs.length > 0
        ? mergedPRs.reduce((sum, pr) => sum + (pr.leadTimeHours || 0), 0) /
          mergedPRs.length
        : 0;

    const mergeRate =
      pullRequests.length > 0
        ? (mergedPRs.length / pullRequests.length) * 100
        : 0;

    // TODO: Calculate average time to first review
    const averageTimeToFirstReview = 0;

    return {
      averageCycleTime: avgCycleTime,
      averageLeadTime: avgLeadTime,
      mergeRate,
      averageTimeToFirstReview,
    };
  }

  /**
   * Group commits by time period
   */
  groupCommitsByPeriod(
    commits: CommitAnalytics[],
    period: 'day' | 'week' | 'month' = 'day'
  ): Array<{ date: string; count: number }> {
    const groupedCommits = new Map<string, number>();

    commits.forEach(ca => {
      const periodKey = this.getPeriodKey(new Date(ca.commitDate), period);
      const currentCount = groupedCommits.get(periodKey) || 0;
      groupedCommits.set(periodKey, currentCount + ca.commitCount);
    });

    return Array.from(groupedCommits.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getPeriodKey(date: Date, period: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (period) {
      case 'day':
        return `${year}-${month.toString().padStart(2, '0')}-${day
          .toString()
          .padStart(2, '0')}`;
      case 'week':
        return getWeekString(date);
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;
    }
  }
}

/**
 * Get week string in YYYY-WW format
 */
function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const days = Math.floor(
    (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}
