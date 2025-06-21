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
import { GitHubPullRequest } from '../types';
import { PullRequest } from '@/types/analytics';

/**
 * GitHub pull request operations
 */
export class PullRequestResource {
  constructor(private octokit: Octokit) {}

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
          pr => options.since && new Date(pr.created_at) >= options.since
        );
      }

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
    try {
      const { data } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

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
   * Transform GitHub pull request to our format
   */
  static transformPullRequest(
    githubPR: GitHubPullRequest,
    repositoryId: string
  ): Partial<PullRequest> {
    const createdAt = new Date(githubPR.created_at);
    const mergedAt = githubPR.merged_at
      ? new Date(githubPR.merged_at)
      : undefined;
    const closedAt = githubPR.closed_at
      ? new Date(githubPR.closed_at)
      : undefined;

    return {
      repositoryId,
      githubPrId: githubPR.id,
      number: githubPR.number,
      title: githubPR.title,
      body: githubPR.body || undefined,
      authorLogin: githubPR.user.login,
      authorAvatarUrl: githubPR.user.avatar_url,
      state: githubPR.merged_at
        ? 'merged'
        : githubPR.state === 'open'
          ? 'open'
          : 'closed',
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
