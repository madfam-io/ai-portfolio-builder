/**
 * GitHub API response types
 */

export interface GitHubRepository {
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

export interface GitHubPullRequest {
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

export interface GitHubCommit {
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

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
}
