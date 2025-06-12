/**
 * Optimized Analytics Service
 * Fixes N+1 query problems and improves performance
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { GitHubAnalyticsClient } from '@/lib/integrations/github/analytics-client';

import type { Repository, PullRequest, Contributor } from '@/types/analytics';

export class OptimizedAnalyticsService {
  private userId: string;
  private githubClient: GitHubAnalyticsClient | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize GitHub client lazily
   */
  private async getGitHubClient(): Promise<GitHubAnalyticsClient> {
    if (!this.githubClient) {
      this.githubClient = await GitHubAnalyticsClient.fromUserId(this.userId);
    }
    return this.githubClient;
  }

  /**
   * Sync repositories with batch operations
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
      const githubClient = await this.getGitHubClient();
      const githubRepos = await githubClient.fetchRepositories();

      // Transform all repositories at once
      const repoData = githubRepos.map(githubRepo => ({
        githubId: githubRepo.id,
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        owner: githubRepo.full_name.split('/')[0],
        description: githubRepo.description,
        visibility: githubRepo.private
          ? ('private' as const)
          : ('public' as const),
        githubCreatedAt: new Date(githubRepo.created_at),
        githubUpdatedAt: new Date(githubRepo.updated_at),
        sizeKb: githubRepo.size,
        stargazersCount: githubRepo.stargazers_count,
        watchersCount: githubRepo.watchers_count,
        language: githubRepo.language,
        forksCount: githubRepo.forks_count,
        openIssuesCount: githubRepo.open_issues_count,
        defaultBranch: githubRepo.default_branch,
        userId: this.userId,
        githubIntegrationId: integration.id,
        lastSyncedAt: new Date(),
        isActive: true,
        syncEnabled: true,
        metadata: {},
        topics: [],
      }));

      // Batch upsert all repositories in a single query
      const { data: repositories, error } = await supabase
        .from('repositories')
        .upsert(repoData)
        .select();

      if (error) {
        logger.error('Failed to batch upsert repositories', { error });
        throw error;
      }

      // Update integration last synced time
      await supabase
        .from('github_integrations')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', integration.id);

      return repositories as Repository[];
    } catch (error) {
      logger.error('Failed to sync repositories', { error });
      throw error;
    }
  }

  /**
   * Sync pull requests with batch operations
   */
  async syncPullRequests(repositoryId: string): Promise<PullRequest[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Get repository details
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      // Fetch all pull requests from GitHub
      const githubClient = await this.getGitHubClient();
      const [owner, repo] = repository.fullName.split('/');
      if (!owner || !repo) {
        throw new Error(
          `Invalid repository fullName format: ${repository.fullName}`
        );
      }
      const githubPRs = await githubClient.fetchPullRequests(owner, repo);

      // Transform all PRs at once
      const prData = githubPRs.map(pr => ({
        repositoryId: repositoryId,
        githubPrId: pr.id,
        number: pr.number,
        title: pr.title,
        body: '', // Not provided by GitHub API in list response
        state:
          pr.state === 'open'
            ? ('open' as const)
            : pr.merged_at
              ? ('merged' as const)
              : ('closed' as const),
        draft: false, // Default value
        authorLogin: pr.user.login,
        authorAvatarUrl: pr.user.avatar_url,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        commits: 0, // Would need additional API call
        reviewComments: 0, // Would need additional API call
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at),
        closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
        labels: [],
        metadata: {},
      }));

      // Batch upsert all pull requests
      const { data: pullRequests, error } = await supabase
        .from('pull_requests')
        .upsert(prData)
        .select();

      if (error) {
        logger.error('Failed to batch upsert pull requests', { error });
        throw error;
      }

      return pullRequests as PullRequest[];
    } catch (error) {
      logger.error('Failed to sync pull requests', { repositoryId, error });
      throw error;
    }
  }

  /**
   * Sync contributors with batch operations
   */
  async syncContributors(repositoryId: string): Promise<void> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      // Fetch contributors from GitHub
      const githubClient = await this.getGitHubClient();
      const [owner, repo] = repository.fullName.split('/');
      if (!owner || !repo) {
        throw new Error(
          `Invalid repository fullName format: ${repository.fullName}`
        );
      }
      const githubContributors = await githubClient.fetchContributors(
        owner,
        repo
      );

      // Prepare contributor data
      const contributorData = githubContributors.map(contributor => ({
        githubId: contributor.id,
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        lastSeenAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Batch upsert all contributors
      const { data: contributors, error: contributorError } = await supabase
        .from('contributors')
        .upsert(contributorData)
        .select();

      if (contributorError) {
        logger.error('Failed to batch upsert contributors', {
          contributorError,
        });
        throw contributorError;
      }

      // Prepare repository-contributor links
      const linkData =
        contributors?.map((contributor, index) => ({
          repositoryId: repositoryId,
          contributorId: contributor.id,
          commitCount: githubContributors[index]?.contributions || 0,
          additions: 0,
          deletions: 0,
          isActive: true,
          commitsLast30Days: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) || [];

      // Batch upsert all links
      const { error: linkError } = await supabase
        .from('repository_contributors')
        .upsert(linkData);

      if (linkError) {
        logger.error('Failed to link contributors', { linkError });
        throw linkError;
      }
    } catch (error) {
      logger.error('Failed to sync contributors', { repositoryId, error });
      throw error;
    }
  }

  /**
   * Get dashboard analytics with optimized queries
   */
  async getDashboardAnalytics(): Promise<any> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Use a database function to aggregate all dashboard data in one query
      const { data, error } = await supabase.rpc('get_dashboard_analytics', {
        p_user_id: this.userId,
      });

      if (error) {
        logger.error('Failed to fetch dashboard analytics', { error });
        throw error;
      }

      return data;
    } catch (error) {
      // Fallback to multiple queries if RPC doesn't exist
      logger.warn(
        'Dashboard RPC not available, falling back to multiple queries'
      );

      // Fetch all data in parallel
      const [repositories, metrics, pullRequests, contributors] =
        await Promise.all([
          this.syncRepositories(),
          this.getAggregatedMetrics(),
          this.getRecentPullRequests(),
          this.getTopContributors(),
        ]);

      return {
        repositories,
        metrics,
        pullRequests,
        contributors,
      };
    }
  }

  /**
   * Get aggregated metrics with single query
   */
  async getAggregatedMetrics(): Promise<any> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('code_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .order('metric_date', { ascending: false })
      .limit(30);

    if (error) {
      logger.error('Failed to fetch metrics', { error });
      throw error;
    }

    return data;
  }

  /**
   * Get recent pull requests with single query
   */
  async getRecentPullRequests(): Promise<PullRequest[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('pull_requests')
      .select('*, repositories!inner(user_id)')
      .eq('repositories.user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('Failed to fetch pull requests', { error });
      throw error;
    }

    return data as PullRequest[];
  }

  /**
   * Get top contributors across all user repositories
   */
  async getTopContributors(repositoryIds?: string[]): Promise<Contributor[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // If no repository IDs provided, fetch all user repositories
    let repoIds = repositoryIds;
    if (!repoIds || repoIds.length === 0) {
      const { data: repos } = await supabase
        .from('repositories')
        .select('id')
        .eq('user_id', this.userId);

      repoIds = repos?.map(r => r.id) || [];
    }

    if (repoIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('repository_contributors')
      .select(
        `
        commitCount,
        contributorId,
        contributors (
          id,
          githubId,
          login,
          avatarUrl,
          name,
          email,
          company,
          location,
          bio,
          publicRepos,
          followers,
          following,
          githubCreatedAt,
          lastSeenAt,
          createdAt,
          updatedAt
        )
      `
      )
      .in('repositoryId', repoIds)
      .order('commitCount', { ascending: false })
      .limit(10);

    if (error) {
      logger.error('Failed to fetch contributors', { error });
      throw error;
    }

    // Transform to proper Contributor type
    return (data || []).map((item: any) => ({
      id: item.contributors?.id || '',
      githubId: item.contributors?.githubId || 0,
      login: item.contributors?.login || '',
      name: item.contributors?.name,
      email: item.contributors?.email,
      avatarUrl: item.contributors?.avatarUrl,
      company: item.contributors?.company,
      location: item.contributors?.location,
      bio: item.contributors?.bio,
      publicRepos: item.contributors?.publicRepos,
      followers: item.contributors?.followers,
      following: item.contributors?.following,
      githubCreatedAt: item.contributors?.githubCreatedAt
        ? new Date(item.contributors.githubCreatedAt)
        : undefined,
      lastSeenAt: item.contributors?.lastSeenAt
        ? new Date(item.contributors.lastSeenAt)
        : undefined,
      createdAt: new Date(item.contributors?.createdAt || new Date()),
      updatedAt: new Date(item.contributors?.updatedAt || new Date()),
    })) as Contributor[];
  }

  /**
   * Helper method to get repository
   */
  private async getRepository(
    repositoryId: string
  ): Promise<Repository | null> {
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
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Repository;
  }
}
