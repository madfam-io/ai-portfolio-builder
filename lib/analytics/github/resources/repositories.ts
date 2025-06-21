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
import { logger } from '@/lib/utils/logger';
import { GitHubRepository } from '../types';
import { Repository } from '@/types/analytics';

/**
 * GitHub repository-related operations
 */
export class RepositoryResource {
  constructor(private octokit: Octokit) {}

  /**
   * Fetch user's repositories
   */
  async fetchRepositories(page = 1, perPage = 30): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      });

      return data as GitHubRepository[];
    } catch (error) {
      logger.error('Failed to fetch repositories', { error });
      throw error;
    }
  }

  /**
   * Fetch repository details
   */
  async fetchRepository(
    owner: string,
    repo: string
  ): Promise<GitHubRepository> {
    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return data as GitHubRepository;
    } catch (error) {
      logger.error('Failed to fetch repository', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Fetch repository languages
   */
  async fetchLanguages(
    owner: string,
    repo: string
  ): Promise<Record<string, number>> {
    try {
      const { data } = await this.octokit.repos.listLanguages({ owner, repo });
      return data;
    } catch (error) {
      logger.error('Failed to fetch languages', { owner, repo, error });
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

      logger.info('Webhook created successfully', { owner, repo });
    } catch (error) {
      // Ignore if webhook already exists
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if ('status' in errorObj && errorObj.status !== 422) {
        logger.error('Failed to create webhook', {
          owner,
          repo,
          error: errorObj,
        });
        throw errorObj;
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
}
