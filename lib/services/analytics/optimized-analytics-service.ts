/**
 * Optimized Analytics Service
 * Fixes N+1 query problems and improves performance
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

import type { Repository, PullRequest, Contributor } from '@/types/analytics';

// TODO: Create GitHub analytics client
// import { GitHubAnalyticsClient } from '@/lib/integrations/github/analytics-client';

export class OptimizedAnalyticsService {
  private userId: string;
  // private githubClient: GitHubAnalyticsClient;

  constructor(userId: string, githubClient?: any) {
    this.userId = userId;
    // this.githubClient = githubClient;
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

      // TODO: Implement GitHub client
      // Fetch repositories from GitHub
      // const githubRepos = await this.githubClient.fetchRepositories();

      // Mock data for now
      const githubRepos: any[] = [];

      // Transform all repositories at once
      const repoData = githubRepos.map((githubRepo: any) => ({
        // TODO: Implement proper transformation
        id: githubRepo.id,
        name: githubRepo.name,
        user_id: this.userId,
        github_integration_id: integration.id,
        last_synced_at: new Date().toISOString(),
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
      const githubPRs = await this.githubClient.fetchPullRequests(
        repository.owner,
        repository.name,
        { state: 'all' }
      );

      // Fetch detailed info for all PRs in parallel
      const detailedPRPromises = githubPRs.map(pr =>
        this.githubClient.fetchPullRequestDetails(
          repository.owner,
          repository.name,
          pr.number
        )
      );

      const detailedPRs = await Promise.all(detailedPRPromises);

      // Transform all PRs at once
      const prData = detailedPRs.map((detailedPR: any) => ({
        // TODO: Implement proper PR transformation
        id: detailedPR.id,
        repository_id: repositoryId,
        // Add other required fields
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
      const githubContributors = await this.githubClient.fetchContributors(
        repository.owner,
        repository.name
      );

      // Fetch detailed user info for all contributors in parallel
      const userDetailsPromises = githubContributors.map(contributor =>
        this.githubClient.fetchUser(contributor.login)
      );

      const userDetailsList = await Promise.all(userDetailsPromises);

      // Prepare contributor data
      const contributorData = userDetailsList.map(userDetails => ({
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
      const linkData = contributors.map((contributor, index) => ({
        repository_id: repositoryId,
        contributor_id: contributor.id,
        commit_count: githubContributors[index].contributions,
        is_active: true,
        updated_at: new Date().toISOString(),
      }));

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
   * Get top contributors with single query
   */
  async getTopContributors(): Promise<Contributor[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('repository_contributors')
      .select(
        `
        commit_count,
        contributors (*)
      `
      )
      .in('repository_id', [])  // TODO: Fix this query properly
      .order('commit_count', { ascending: false })
      .limit(10);

    if (error) {
      logger.error('Failed to fetch contributors', { error });
      throw error;
    }

    return data.map(d => d.contributors).flat() as Contributor[];
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
