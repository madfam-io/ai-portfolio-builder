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

/**
 * GitHub Analytics Client
 * Handles all GitHub API interactions for analytics
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
  type: string;
}

export class GitHubAnalyticsClient {
  private octokit: Octokit;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
    this.userId = userId;
  }

  /**
   * Create client from user ID by fetching stored token
   */
  static async fromUserId(userId: string): Promise<GitHubAnalyticsClient> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Fetch GitHub integration
    const { data: integration, error } = await supabase
      .from('github_integrations')
      .select('encrypted_token')
      .eq('user_id', userId)
      .single();

    if (error || !integration) {
      throw new Error('GitHub integration not found');
    }

    // TODO: Decrypt the token (implement encryption service)
    // For now, assuming token is not encrypted
    const accessToken = integration.encrypted_token;

    return new GitHubAnalyticsClient(accessToken, userId);
  }

  /**
   * Fetch all repositories for authenticated user
   */
  async fetchRepositories(): Promise<GitHubRepository[]> {
    try {
      const repos: GitHubRepository[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data } = await this.octokit.repos.listForAuthenticatedUser({
          per_page: perPage,
          page,
          type: 'all',
          sort: 'updated',
        });

        if (data.length === 0) break;

        repos.push(...(data as GitHubRepository[]));

        if (data.length < perPage) break;
        page++;
      }

      logger.info(
        `Fetched ${repos.length} repositories for user ${this.userId}`
      );
      return repos;
    } catch (error) {
      logger.error('Failed to fetch repositories from GitHub', error as Error);
      throw error;
    }
  }

  /**
   * Fetch pull requests for a repository
   */
  async fetchPullRequests(
    owner: string,
    repo: string
  ): Promise<GitHubPullRequest[]> {
    try {
      const prs: GitHubPullRequest[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data } = await this.octokit.pulls.list({
          owner,
          repo,
          state: 'all',
          per_page: perPage,
          page,
          sort: 'created',
          direction: 'desc',
        });

        if (data.length === 0) break;

        // Fetch additional details for each PR
        const detailedPRs = await Promise.all(
          data.map(async pr => {
            const { data: details } = await this.octokit.pulls.get({
              owner,
              repo,
              pull_number: pr.number,
            });
            return details;
          })
        );

        prs.push(...(detailedPRs as GitHubPullRequest[]));

        if (data.length < perPage) break;
        page++;
      }

      logger.info(`Fetched ${prs.length} pull requests for ${owner}/${repo}`);
      return prs;
    } catch (error) {
      logger.error(
        `Failed to fetch pull requests for ${owner}/${repo}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Fetch contributors for a repository
   */
  async fetchContributors(
    owner: string,
    repo: string
  ): Promise<GitHubContributor[]> {
    try {
      const contributors: GitHubContributor[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data } = await this.octokit.repos.listContributors({
          owner,
          repo,
          per_page: perPage,
          page,
        });

        if (data.length === 0) break;

        contributors.push(...(data as GitHubContributor[]));

        if (data.length < perPage) break;
        page++;
      }

      logger.info(
        `Fetched ${contributors.length} contributors for ${owner}/${repo}`
      );
      return contributors;
    } catch (error) {
      logger.error(
        `Failed to fetch contributors for ${owner}/${repo}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Fetch user details
   */
  async fetchUserDetails(username: string) {
    try {
      const { data } = await this.octokit.users.getByUsername({ username });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch user details for ${username}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Test GitHub connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.octokit.users.getAuthenticated();
      return true;
    } catch (error) {
      logger.error('GitHub connection test failed', error as Error);
      return false;
    }
  }
}
