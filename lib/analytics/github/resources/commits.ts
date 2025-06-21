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
import { GitHubCommit } from '../types';

/**
 * GitHub commit operations
 */
export class CommitResource {
  constructor(private octokit: Octokit) {}

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
    try {
      const params: Parameters<typeof this.octokit.repos.listCommits>[0] = {
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
      return data as GitHubCommit[];
    } catch (error) {
      logger.error('Failed to fetch commits', { owner, repo, error });
      throw error;
    }
  }
}
