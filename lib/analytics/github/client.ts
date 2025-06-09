/**
 * @fileoverview GitHub Analytics Client
 * 
 * Handles all GitHub API interactions for the analytics feature.
 * Implements rate limiting, caching, and error handling.
 * 
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

import { Octokit } from '@octokit/rest';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import type {
  GitHubIntegration,
  Repository,
  PullRequest,
  Contributor,
  RateLimitInfo,
} from '@/types/analytics';

/**
 * GitHub API response types
 */
interface GitHubRepository {
  id: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  private: boolean;
  visibility: 'public' | 'private' | 'internal';
  default_branch: string;
  language: string | null;
  topics?: string[];
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  draft: boolean;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  commits?: number;
  review_comments?: number;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
}

/**
 * GitHub Analytics Client
 * 
 * Provides methods to interact with GitHub API for analytics purposes.
 * Handles authentication, rate limiting, and data transformation.
 */
export class GitHubAnalyticsClient {
  private octokit: Octokit | null = null;
  private integration: GitHubIntegration | null = null;
  private rateLimitInfo: RateLimitInfo = {
    limit: 5000,
    remaining: 5000,
    reset: new Date(),
    used: 0,
  };

  /**
   * Initialize the client with a user's GitHub integration
   */
  async initialize(userId: string): Promise<void> {
    const supabase = createClient();
    
    // Fetch user's GitHub integration
    const { data: integration, error } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !integration) {
      throw new Error('No active GitHub integration found');
    }

    this.integration = integration as GitHubIntegration;
    
    // Initialize Octokit with access token
    this.octokit = new Octokit({
      auth: integration.access_token,
      throttle: {
        onRateLimit: (retryAfter: number, options: any) => {
          logger.warn(
            `GitHub rate limit hit, retrying after ${retryAfter} seconds`,
            { options }
          );
          return true;
        },
        onSecondaryRateLimit: (retryAfter: number, options: any) => {
          logger.warn(
            `GitHub secondary rate limit hit, retrying after ${retryAfter} seconds`,
            { options }
          );
          return true;
        },
      },
    });

    // Check rate limit
    await this.checkRateLimit();
  }

  /**
   * Check and update rate limit information
   */
  private async checkRateLimit(): Promise<RateLimitInfo> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.rateLimit.get();
      
      this.rateLimitInfo = {
        limit: data.resources.core.limit,
        remaining: data.resources.core.remaining,
        reset: new Date(data.resources.core.reset * 1000),
        used: data.resources.core.limit - data.resources.core.remaining,
      };

      // Update rate limit in database
      if (this.integration) {
        const supabase = createClient();
        await supabase
          .from('github_integrations')
          .update({
            rate_limit_remaining: this.rateLimitInfo.remaining,
            rate_limit_reset_at: this.rateLimitInfo.reset.toISOString(),
          })
          .eq('id', this.integration.id);
      }

      return this.rateLimitInfo;
    } catch (error) {
      logger.error('Failed to check rate limit', { error });
      throw error;
    }
  }

  /**
   * Get rate limit information
   */
  getRateLimit(): RateLimitInfo {
    return this.rateLimitInfo;
  }

  /**
   * Fetch user's repositories
   */
  async fetchRepositories(page = 1, perPage = 30): Promise<GitHubRepository[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      });

      await this.checkRateLimit();
      return data as GitHubRepository[];
    } catch (error) {
      logger.error('Failed to fetch repositories', { error });
      throw error;
    }
  }

  /**
   * Fetch repository details
   */
  async fetchRepository(owner: string, repo: string): Promise<GitHubRepository> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      await this.checkRateLimit();
      return data as GitHubRepository;
    } catch (error) {
      logger.error('Failed to fetch repository', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Fetch repository languages
   */
  async fetchLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.repos.listLanguages({ owner, repo });
      await this.checkRateLimit();
      return data;
    } catch (error) {
      logger.error('Failed to fetch languages', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Fetch pull requests for a repository
   */
  async fetchPullRequests(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      page?: number;
      perPage?: number;
      since?: Date;
    } = {}
  ): Promise<GitHubPullRequest[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.pulls.list({
        owner,
        repo,
        state: options.state || 'all',
        per_page: options.perPage || 30,
        page: options.page || 1,
        sort: 'created',
        direction: 'desc',
      });

      // Filter by date if provided
      let pullRequests = data as GitHubPullRequest[];
      if (options.since) {
        pullRequests = pullRequests.filter(
          pr => new Date(pr.created_at) >= options.since!
        );
      }

      await this.checkRateLimit();
      return pullRequests;
    } catch (error) {
      logger.error('Failed to fetch pull requests', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Fetch detailed pull request information
   */
  async fetchPullRequestDetails(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPullRequest> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      await this.checkRateLimit();
      return data as GitHubPullRequest;
    } catch (error) {
      logger.error('Failed to fetch pull request details', {
        owner,
        repo,
        pullNumber,
        error,
      });
      throw error;
    }
  }

  /**
   * Fetch commits for a repository
   */
  async fetchCommits(
    owner: string,
    repo: string,
    options: {
      since?: Date;
      until?: Date;
      page?: number;
      perPage?: number;
      author?: string;
    } = {}
  ): Promise<GitHubCommit[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const params: any = {
        owner,
        repo,
        per_page: options.perPage || 30,
        page: options.page || 1,
      };

      if (options.since) {
        params.since = options.since.toISOString();
      }
      if (options.until) {
        params.until = options.until.toISOString();
      }
      if (options.author) {
        params.author = options.author;
      }

      const { data } = await this.octokit.repos.listCommits(params);
      await this.checkRateLimit();
      return data as GitHubCommit[];
    } catch (error) {
      logger.error('Failed to fetch commits', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Fetch repository contributors
   */
  async fetchContributors(
    owner: string,
    repo: string,
    options: {
      page?: number;
      perPage?: number;
      anon?: boolean;
    } = {}
  ): Promise<GitHubContributor[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: options.perPage || 30,
        page: options.page || 1,
        anon: options.anon ? '1' : '0',
      });

      await this.checkRateLimit();
      return data as GitHubContributor[];
    } catch (error) {
      logger.error('Failed to fetch contributors', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Fetch user details
   */
  async fetchUser(username: string): Promise<Contributor> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const { data } = await this.octokit.users.getByUsername({ username });
      
      await this.checkRateLimit();
      
      return {
        id: '', // Will be set by database
        githubId: data.id,
        login: data.login,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
        company: data.company,
        location: data.location,
        bio: data.bio,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        githubCreatedAt: new Date(data.created_at),
        lastSeenAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch user', { username, error });
      throw error;
    }
  }

  /**
   * Setup webhook for a repository
   */
  async setupWebhook(
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string
  ): Promise<void> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      await this.octokit.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret,
        },
        events: ['push', 'pull_request', 'issues', 'repository'],
        active: true,
      });

      await this.checkRateLimit();
      logger.info('Webhook created successfully', { owner, repo });
    } catch (error: any) {
      // Ignore if webhook already exists
      if (error.status !== 422) {
        logger.error('Failed to create webhook', { owner, repo, error });
        throw error;
      }
    }
  }

  /**
   * Transform GitHub repository to our format
   */
  static transformRepository(
    githubRepo: GitHubRepository,
    userId: string,
    integrationId: string
  ): Partial<Repository> {
    return {
      userId,
      githubIntegrationId: integrationId,
      githubId: githubRepo.id,
      owner: githubRepo.owner.login,
      name: githubRepo.name,
      fullName: githubRepo.full_name,
      description: githubRepo.description || undefined,
      homepage: githubRepo.homepage || undefined,
      visibility: githubRepo.visibility,
      defaultBranch: githubRepo.default_branch,
      language: githubRepo.language || undefined,
      topics: githubRepo.topics,
      sizeKb: githubRepo.size,
      stargazersCount: githubRepo.stargazers_count,
      watchersCount: githubRepo.watchers_count,
      forksCount: githubRepo.forks_count,
      openIssuesCount: githubRepo.open_issues_count,
      githubCreatedAt: new Date(githubRepo.created_at),
      githubUpdatedAt: new Date(githubRepo.updated_at),
    };
  }

  /**
   * Transform GitHub pull request to our format
   */
  static transformPullRequest(
    githubPR: GitHubPullRequest,
    repositoryId: string
  ): Partial<PullRequest> {
    const createdAt = new Date(githubPR.created_at);
    const mergedAt = githubPR.merged_at ? new Date(githubPR.merged_at) : undefined;
    const closedAt = githubPR.closed_at ? new Date(githubPR.closed_at) : undefined;

    return {
      repositoryId,
      githubPrId: githubPR.id,
      number: githubPR.number,
      title: githubPR.title,
      body: githubPR.body || undefined,
      authorLogin: githubPR.user.login,
      authorAvatarUrl: githubPR.user.avatar_url,
      state: githubPR.merged_at ? 'merged' : githubPR.state === 'open' ? 'open' : 'closed',
      draft: githubPR.draft,
      additions: githubPR.additions || 0,
      deletions: githubPR.deletions || 0,
      changedFiles: githubPR.changed_files || 0,
      commits: githubPR.commits || 0,
      reviewComments: githubPR.review_comments || 0,
      createdAt,
      updatedAt: new Date(githubPR.updated_at),
      mergedAt,
      closedAt,
      labels: githubPR.labels.map(label => label.name),
      metadata: {},
      // Calculate cycle time if merged
      cycleTimeHours: mergedAt
        ? (mergedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        : undefined,
    };
  }
}