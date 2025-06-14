/**
 * Lazy-loaded GitHub API Client
 * 
 * Dynamically imports the GitHub API client only when needed,
 * reducing initial bundle size by ~4.4MB
 */

import type { GitHubAnalyticsClient } from './client';

let githubClientInstance: GitHubAnalyticsClient | null = null;

/**
 * Get the GitHub client instance lazily
 * 
 * This function dynamically imports the GitHub client module
 * only when it's first requested, reducing the initial bundle size
 */
export async function getGitHubClient(): Promise<GitHubAnalyticsClient> {
  if (!githubClientInstance) {
    const { GitHubAnalyticsClient } = await import('./client');
    githubClientInstance = new GitHubAnalyticsClient();
  }
  return githubClientInstance;
}

/**
 * Proxy for GitHubAnalyticsClient methods with lazy loading
 * 
 * Provides the same interface as GitHubAnalyticsClient but loads it on demand
 */
export const lazyGitHubClient = {
  async initialize(userId: string) {
    const client = await getGitHubClient();
    return client.initialize(userId);
  },
  
  async fetchRepositories(page?: number, perPage?: number) {
    const client = await getGitHubClient();
    return client.fetchRepositories(page, perPage);
  },
  
  async fetchRepository(owner: string, repo: string) {
    const client = await getGitHubClient();
    return client.fetchRepository(owner, repo);
  },
  
  async fetchLanguages(owner: string, repo: string) {
    const client = await getGitHubClient();
    return client.fetchLanguages(owner, repo);
  },
  
  async fetchPullRequests(owner: string, repo: string, options?: any) {
    const client = await getGitHubClient();
    return client.fetchPullRequests(owner, repo, options);
  },
};