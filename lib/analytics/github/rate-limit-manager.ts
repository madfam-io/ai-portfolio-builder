import { Octokit } from '@octokit/rest';
import { logger } from '@/lib/utils/logger';
import { createClient } from '@/lib/supabase/server';
import { RateLimitInfo, GitHubIntegration } from '@/types/analytics';

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
      if (this.integration) {
        const supabase = await createClient();
        if (!supabase) {
          throw new Error('Database connection not available');
        }
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
   * Get current rate limit information
   */
  getRateLimit(): RateLimitInfo {
    return this.rateLimitInfo;
  }
}