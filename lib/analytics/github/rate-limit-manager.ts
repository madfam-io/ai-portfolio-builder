/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { type Octokit } from '@octokit/rest';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/prisma';
import { type RateLimitInfo, type GitHubIntegration } from '@/types/analytics';

/**
 * Manages GitHub API rate limiting
 */
export class RateLimitManager {
  private rateLimitInfo: RateLimitInfo = {
    limit: 5000,
    remaining: 5000,
    reset: new Date(),
    used: 0,
  };

  constructor(
    private octokit: Octokit,
    private integration: GitHubIntegration | null
  ) {}

  /**
   * Check and update rate limit information
   */
  async checkRateLimit(): Promise<RateLimitInfo> {
    try {
      const { data } = await this.octokit.rateLimit.get();

      this.rateLimitInfo = {
        limit: data.resources.core.limit,
        remaining: data.resources.core.remaining,
        reset: new Date(data.resources.core.reset * 1000),
        used: data.resources.core.limit - data.resources.core.remaining,
      };

      // Update rate limit in database
      // NOTE: rateLimitRemaining and rateLimitResetAt fields don't exist in current schema
      // This would need to be added to the GitHubIntegration model if needed
      // if (this.integration) {
      //   await prisma.gitHubIntegration.update({
      //     where: { id: this.integration.id },
      //     data: {
      //       rateLimitRemaining: this.rateLimitInfo.remaining,
      //       rateLimitResetAt: this.rateLimitInfo.reset,
      //     },
      //   });
      // }

      return this.rateLimitInfo;
    } catch (error) {
      logger.error('Failed to check rate limit', { error });
      throw error;
    }
  }

  /**
   * Get current rate limit information
   */
  getRateLimit(): RateLimitInfo {
    return this.rateLimitInfo;
  }
}
