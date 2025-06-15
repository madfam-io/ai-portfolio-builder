import { Octokit } from '@octokit/rest';
import { logger } from '@/lib/utils/logger';
import { GitHubContributor } from '../types';
import { Contributor } from '@/types/analytics';

/**
 * GitHub contributor operations
 */
export class ContributorResource {
  constructor(private octokit: Octokit) {}

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
    try {
      const { data } = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: options.perPage || 30,
        page: options.page || 1,
        anon: options.anon ? '1' : '0',
      });

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
    try {
      const { data } = await this.octokit.users.getByUsername({ username });

      return {
        id: '', // Will be set by database
        githubId: data.id,
        login: data.login,
        name: data.name || undefined,
        email: data.email || undefined,
        avatarUrl: data.avatar_url || undefined,
        company: data.company || undefined,
        location: data.location || undefined,
        bio: data.bio || undefined,
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
}