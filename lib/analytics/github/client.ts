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

import { Octokit } from '@octokit/rest';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import {
  decryptAccessToken,
  hasEncryptedTokens,
  hasLegacyTokens,
} from './tokenManager';
import { RateLimitManager } from './rate-limit-manager';
import { RepositoryResource } from './resources/repositories';
import { PullRequestResource } from './resources/pull-requests';
import { CommitResource } from './resources/commits';
import { ContributorResource } from './resources/contributors';
import type {
  GitHubIntegration,
  Repository,
  PullRequest,
  Contributor,
  RateLimitInfo,
} from '@/types/analytics';
import type {
  GitHubRepository,
  GitHubPullRequest,
  GitHubCommit,
  GitHubContributor,
} from './types';

/**
 * @fileoverview GitHub Analytics Client
 *
 * Handles all GitHub API interactions for the analytics feature.
 * Implements rate limiting, caching, and error handling.
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

/**
 * GitHub Analytics Client
 *
 * Provides methods to interact with GitHub API for analytics purposes.
 * Handles authentication, rate limiting, and data transformation.
 */
export class GitHubAnalyticsClient {
  private octokit: Octokit | null = null;
  private integration: GitHubIntegration | null = null;
  private rateLimitManager: RateLimitManager | null = null;

  // Resource handlers
  private repositories: RepositoryResource | null = null;
  private pullRequests: PullRequestResource | null = null;
  private commits: CommitResource | null = null;
  private contributors: ContributorResource | null = null;

  /**
   * Initialize the client with a user's GitHub integration
   */
  async initialize(userId: string): Promise<void> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

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

    // Get the access token (handle both encrypted and legacy formats)
    let accessToken: string | null = null;

    if (hasEncryptedTokens(integration)) {
      // New encrypted format
      accessToken = decryptAccessToken(integration);
    } else if (hasLegacyTokens(integration)) {
      // Legacy unencrypted format
      accessToken = integration.access_token;
      logger.warn('Using legacy unencrypted token - migration required');
    }

    if (!accessToken) {
      throw new Error('Failed to retrieve access token');
    }

    // Initialize Octokit with access token
    this.octokit = new Octokit({
      auth: accessToken,
      throttle: {
        onRateLimit: (retryAfter: number, options: unknown) => {
          logger.warn(
            `GitHub rate limit hit, retrying after ${retryAfter} seconds`,
            { options }
          );
          return true;
        },
        onSecondaryRateLimit: (retryAfter: number, options: unknown) => {
          logger.warn(
            `GitHub secondary rate limit hit, retrying after ${retryAfter} seconds`,
            { options }
          );
          return true;
        },
      },
    });

    // Initialize resources and managers
    this.rateLimitManager = new RateLimitManager(
      this.octokit,
      this.integration
    );
    this.repositories = new RepositoryResource(this.octokit);
    this.pullRequests = new PullRequestResource(this.octokit);
    this.commits = new CommitResource(this.octokit);
    this.contributors = new ContributorResource(this.octokit);

    // Check rate limit
    await this.rateLimitManager.checkRateLimit();
  }

  /**
   * Get rate limit information
   */
  getRateLimit(): RateLimitInfo {
    if (!this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }
    return this.rateLimitManager.getRateLimit();
  }

  /**
   * Fetch user's repositories
   */
  async fetchRepositories(page = 1, perPage = 30): Promise<GitHubRepository[]> {
    if (!this.repositories || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.repositories.fetchRepositories(page, perPage);
    await this.rateLimitManager.checkRateLimit();
    return result;
  }

  /**
   * Fetch repository details
   */
  async fetchRepository(
    owner: string,
    repo: string
  ): Promise<GitHubRepository> {
    if (!this.repositories || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.repositories.fetchRepository(owner, repo);
    await this.rateLimitManager.checkRateLimit();
    return result;
  }

  /**
   * Fetch repository languages
   */
  async fetchLanguages(
    owner: string,
    repo: string
  ): Promise<Record<string, number>> {
    if (!this.repositories || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.repositories.fetchLanguages(owner, repo);
    await this.rateLimitManager.checkRateLimit();
    return result;
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
    if (!this.pullRequests || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.pullRequests.fetchPullRequests(
      owner,
      repo,
      options
    );
    await this.rateLimitManager.checkRateLimit();
    return result;
  }

  /**
   * Fetch detailed pull request information
   */
  async fetchPullRequestDetails(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPullRequest> {
    if (!this.pullRequests || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.pullRequests.fetchPullRequestDetails(
      owner,
      repo,
      pullNumber
    );
    await this.rateLimitManager.checkRateLimit();
    return result;
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
    if (!this.commits || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.commits.fetchCommits(owner, repo, options);
    await this.rateLimitManager.checkRateLimit();
    return result;
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
    if (!this.contributors || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.contributors.fetchContributors(
      owner,
      repo,
      options
    );
    await this.rateLimitManager.checkRateLimit();
    return result;
  }

  /**
   * Fetch user details
   */
  async fetchUser(username: string): Promise<Contributor> {
    if (!this.contributors || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    const result = await this.contributors.fetchUser(username);
    await this.rateLimitManager.checkRateLimit();
    return result;
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
    if (!this.repositories || !this.rateLimitManager) {
      throw new Error('GitHub client not initialized');
    }

    await this.repositories.setupWebhook(owner, repo, webhookUrl, secret);
    await this.rateLimitManager.checkRateLimit();
  }

  /**
   * Transform GitHub repository to our format
   */
  static transformRepository(
    githubRepo: GitHubRepository,
    userId: string,
    integrationId: string
  ): Partial<Repository> {
    return RepositoryResource.transformRepository(
      githubRepo,
      userId,
      integrationId
    );
  }

  /**
   * Transform GitHub pull request to our format
   */
  static transformPullRequest(
    githubPR: GitHubPullRequest,
    repositoryId: string
  ): Partial<PullRequest> {
    return PullRequestResource.transformPullRequest(githubPR, repositoryId);
  }
}
