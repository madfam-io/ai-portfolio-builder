import { GitHubAnalyticsClient } from '@/lib/analytics/github/client';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

import type { Repository, RepositoryAnalytics } from '@/types/analytics';

/**
 * Repository Analytics Service
 *
 * Handles repository-specific analytics operations including
 * syncing, fetching, and processing repository data.
 */
export class RepositoryAnalyticsService {
  private githubClient: GitHubAnalyticsClient;
  private userId: string;

  constructor(userId: string, githubClient: GitHubAnalyticsClient) {
    this.userId = userId;
    this.githubClient = githubClient;
  }

  /**
   * Sync repositories from GitHub
   */
  async syncRepositories(): Promise<Repository[]> {
    const supabase = await createClient();

    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Get GitHub integration
      const { data: integration } = await supabase
        .from('github_integrations')
        .select('id')
        .eq('user_id', this.userId)
        .single();

      if (!integration) {
        throw new Error('No GitHub integration found');
      }

      // Fetch repositories from GitHub
      const githubRepos = await this.githubClient.fetchRepositories();

      // Upsert repositories to database in parallel
      const repositoryPromises = githubRepos.map(async githubRepo => {
        const repoData = GitHubAnalyticsClient.transformRepository(
          githubRepo,
          this.userId,
          integration.id
        );

        const { data: repo, error } = await supabase
          .from('repositories')
          .upsert({
            ...repoData,
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to upsert repository', { error, repoData });
          return null;
        }

        return repo as Repository;
      });

      const repositoryResults = await Promise.all(repositoryPromises);
      const repositories = repositoryResults.filter(
        (repo): repo is Repository => repo !== null
      );

      // Update integration last synced time
      await supabase
        .from('github_integrations')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', integration.id);

      return repositories;
    } catch (error) {
      logger.error('Failed to sync repositories', { error });
      throw error;
    }
  }

  /**
   * Get user's repositories
   */
  async getRepositories(): Promise<Repository[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch repositories', { error });
      throw error;
    }

    return data as Repository[];
  }

  /**
   * Get repository by ID
   */
  async getRepository(repositoryId: string): Promise<Repository | null> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('id', repositoryId)
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Failed to fetch repository', { error });
      throw error;
    }

    return data as Repository;
  }

  /**
   * Get repository analytics
   */
  async getRepositoryAnalytics(
    repositoryId: string
  ): Promise<RepositoryAnalytics | null> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const repository = await this.getRepository(repositoryId);
    if (!repository) return null;

    try {
      // Fetch current and historical metrics
      const { data: metricsData } = await supabase
        .from('code_metrics')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('metric_date', { ascending: false })
        .limit(30);

      const metrics = metricsData || [];
      const currentMetrics = metrics[0];

      // Fetch contributors
      const { data: contributorData } = await supabase
        .from('repository_contributors')
        .select(
          `
          *,
          contributor:contributors(*)
        `
        )
        .eq('repository_id', repositoryId)
        .order('commit_count', { ascending: false });

      // Fetch pull requests
      const { data: prData } = await supabase
        .from('pull_requests')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('created_at', { ascending: false })
        .limit(20);

      const pullRequests = prData || [];

      // Calculate PR stats
      const mergedPRs = pullRequests.filter((pr: any) => pr.state === 'merged');
      const avgCycleTime =
        mergedPRs.length > 0
          ? mergedPRs.reduce(
              (sum: number, pr: any) => sum + (pr.cycleTimeHours || 0),
              0
            ) / mergedPRs.length
          : 0;
      const avgLeadTime =
        mergedPRs.length > 0
          ? mergedPRs.reduce(
              (sum: number, pr: any) => sum + (pr.leadTimeHours || 0),
              0
            ) / mergedPRs.length
          : 0;
      const mergeRate =
        pullRequests.length > 0
          ? (mergedPRs.length / pullRequests.length) * 100
          : 0;

      // Fetch commit analytics
      const { data: commitData } = await supabase
        .from('commit_analytics')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('commit_date', { ascending: false })
        .limit(30);

      const commitAnalytics = commitData || [];

      // Calculate commit patterns
      const commitsByHour = new Array(24).fill(0);
      commitAnalytics.forEach((ca: any) => {
        if (ca.peakHour !== null && ca.peakHour !== undefined) {
          commitsByHour[ca.peakHour] += ca.commitCount;
        }
      });

      // Calculate languages breakdown
      const languages = currentMetrics?.locByLanguage || {};
      const totalLines = Object.values(languages).reduce(
        (sum: number, lines: any) => sum + lines,
        0
      );
      const languageBreakdown = Object.entries(languages).map(
        ([language, lines]: [string, any]) => ({
          language,
          lines,
          percentage: totalLines > 0 ? (lines / totalLines) * 100 : 0,
        })
      );

      return {
        repository,
        metrics: {
          current: currentMetrics || null,
          history: metrics,
        },
        contributors:
          contributorData?.map((rc: any) => ({
            contributor: rc.contributor,
            stats: rc,
          })) || [],
        pullRequests: {
          recent: pullRequests,
          stats: {
            averageCycleTime: avgCycleTime,
            averageLeadTime: avgLeadTime,
            mergeRate,
            averageTimeToFirstReview: 0, // TODO: Calculate this
          },
        },
        commits: {
          byDay: commitAnalytics,
          byHour: commitsByHour.map((count, hour) => ({ hour, count })),
          byAuthor: [], // TODO: Implement author aggregation
        },
        languages: languageBreakdown,
      };
    } catch (error) {
      logger.error('Failed to get repository analytics', {
        repositoryId,
        error,
      });
      throw error;
    }
  }
}
