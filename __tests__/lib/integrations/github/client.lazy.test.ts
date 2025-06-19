import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { GitHubClient } from '@/lib/integrations/github/client.lazy';
import { createClient } from '@/lib/supabase/server';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


// Mock dependencies

jest.mock('@/lib/services/error/error-logger');

// Mock fetch
global.fetch = jest.fn();

describe('GitHubClient', () => {
  setupCommonMocks();

  let client: GitHubClient;
  let mockSupabase: any;
  const mockAccessToken = 'gho_testtoken123';
  const _mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            access_token: mockAccessToken,
            refresh_token: 'ghr_refreshtoken123',
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          },
          error: null,
        }),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    client = new GitHubClient(mockUserId);
  });

  describe('Authentication', () => {
    it('should initialize with user ID', () => {
      expect(client).toBeDefined();
      expect(client.userId).toBe(mockUserId);
    });

    it('should fetch access token from database', async () => {
      const token = await client.getAccessToken();

      expect(token).toBe(mockAccessToken);
      expect(mockSupabase.from).toHaveBeenCalledWith('github_integrations');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
      'user_id',
        mockUserId
    );
  });

    it('should refresh expired token', async () => {
      // Mock expired token
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            access_token: 'expired_token',
            refresh_token: 'ghr_refreshtoken123',
            expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired
          },
          error: null,
        }),
      });

      // Mock token refresh
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          access_token: 'new_token',
          refresh_token: 'new_refresh_token',
          expires_in: 3600,
        }),
      });

      const token = await client.getAccessToken();

      expect(token).toBe('new_token');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('github.com/login/oauth/access_token'),
        expect.objectContaining({
          method: 'POST',
        })
    );
  });

    it('should handle missing integration gracefully', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      });

      await expect(client.getAccessToken()).rejects.toThrow(
        'GitHub integration not found'

    });
  });

  describe('User API', () => {
    beforeEach(() => {
      // Mock successful auth
      jest.spyOn(client, 'getAccessToken').mockResolvedValue(mockAccessToken);
    });

    it('should fetch authenticated user data', async () => {
      const mockUserData = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://github.com/testuser.png',
        bio: 'Software Developer',
        location: 'San Francisco',
        public_repos: 42,
        followers: 100,
        following: 50,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockUserData,
      });

      const userData = await client.getUser();

      expect(userData).toEqual(mockUserData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
            Accept: 'application/vnd.github.v3+json',
          }),
        })
    });

    it('should fetch user by username', async () => {
      const username = 'octocat';
      const mockUserData = {
        login: username,
        name: 'The Octocat',
        public_repos: 8,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockUserData,
      });

      const userData = await client.getUserByUsername(username);

      expect(userData).toEqual(mockUserData);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.github.com/users/${username}`,
        expect.any(Object)

    });
  });

  describe('Repository API', () => {
    beforeEach(() => {
      jest.spyOn(client, 'getAccessToken').mockResolvedValue(mockAccessToken);
    });

    it('should list user repositories', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'testuser/repo1',
          description: 'First repository',
          private: false,
          stargazers_count: 10,
          language: 'JavaScript',
        },
        {
          id: 2,
          name: 'repo2',
          full_name: 'testuser/repo2',
          description: 'Second repository',
          private: true,
          stargazers_count: 5,
          language: 'TypeScript',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockRepos,
        headers: new Headers({
          Link: '<https://api.github.com/user/repos?page=2>; rel="next"',
        }),
      });

      const repos = await client.listRepositories({
        type: 'owner',
        sort: 'updated',
        per_page: 30,
      });

      expect(repos.data).toEqual(mockRepos);
      expect(repos.hasNextPage).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('user/repos'),
        expect.any(Object)

    });

    it('should get repository details', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const mockRepoData = {
        full_name: `${owner}/${repo}`,
        description: 'Test repository',
        topics: ['javascript', 'react'],
        homepage: 'https://example.com',
        has_issues: true,
        has_projects: true,
        has_wiki: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockRepoData,
      });

      const repoData = await client.getRepository(owner, repo);

      expect(repoData).toEqual(mockRepoData);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}`,
        expect.any(Object)

    });

    it('should get repository languages', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const mockLanguages = {
        JavaScript: 150000,
        TypeScript: 50000,
        CSS: 25000,
        HTML: 10000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockLanguages,
      });

      const languages = await client.getRepositoryLanguages(owner, repo);

      expect(languages).toEqual(mockLanguages);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        expect.any(Object)

    });

    it('should get repository contributors', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const mockContributors = [
        {
          login: 'contributor1',
          contributions: 150,
          avatar_url: 'https://github.com/contributor1.png',
        },
        {
          login: 'contributor2',
          contributions: 75,
          avatar_url: 'https://github.com/contributor2.png',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockContributors,
      });

      const contributors = await client.getRepositoryContributors(owner, repo);

      expect(contributors).toEqual(mockContributors);
    });
  });

  describe('Commit API', () => {
    beforeEach(() => {
      jest.spyOn(client, 'getAccessToken').mockResolvedValue(mockAccessToken);
    });

    it('should list repository commits', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2025-06-15T10:00:00Z',
            },
            message: 'Fix bug in authentication flow',
          },
        },
        {
          sha: 'def456',
          commit: {
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2025-06-14T15:00:00Z',
            },
            message: 'Add new feature',
          },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockCommits,
      });

      const commits = await client.listCommits(owner, repo, {
        author: 'testuser',
        since: '2025-06-01T00:00:00Z',
        per_page: 50,
      });

      expect(commits).toEqual(mockCommits);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`repos/${owner}/${repo}/commits`),
        expect.any(Object)

    });

    it('should get commit statistics', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const mockStats = {
        total: 52,
        weeks: [
          { w: 1623542400, a: 100, d: 50, c: 5 },
          { w: 1624147200, a: 200, d: 75, c: 8 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockStats,
      });

      const stats = await client.getCommitActivity(owner, repo);

      expect(stats).toEqual(mockStats);
    });
  });

  describe('Pull Request API', () => {
    beforeEach(() => {
      jest.spyOn(client, 'getAccessToken').mockResolvedValue(mockAccessToken);
    });

    it('should list pull requests', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const mockPRs = [
        {
          number: 123,
          title: 'Add new feature',
          state: 'open',
          user: { login: 'contributor1' },
          created_at: '2025-06-15T10:00:00Z',
          updated_at: '2025-06-15T12:00:00Z',
        },
        {
          number: 122,
          title: 'Fix bug',
          state: 'closed',
          user: { login: 'contributor2' },
          created_at: '2025-06-14T10:00:00Z',
          updated_at: '2025-06-14T15:00:00Z',
          merged_at: '2025-06-14T15:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockPRs,
      });

      const prs = await client.listPullRequests(owner, repo, {
        state: 'all',
        sort: 'updated',
        direction: 'desc',
      });

      expect(prs).toEqual(mockPRs);
    });

    it('should create a pull request', async () => {
      const owner = 'testuser';
      const repo = 'testrepo';
      const prData = {
        title: 'New Feature Implementation',
        body: 'This PR implements the new feature as discussed in #100',
        head: 'feature-branch',
        base: 'main',
      };

      const mockCreatedPR = {
        number: 124,
        ...prData,
        state: 'open',
        created_at: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockCreatedPR,
      });

      const createdPR = await client.createPullRequest(owner, repo, prData);

      expect(createdPR).toEqual(mockCreatedPR);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`repos/${owner}/${repo}/pulls`),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(prData),
        })
    );
  });
  });

  describe('Organization API', () => {
    beforeEach(() => {
      jest.spyOn(client, 'getAccessToken').mockResolvedValue(mockAccessToken);
    });

    it('should list user organizations', async () => {
      const mockOrgs = [
        {
          login: 'org1',
          id: 1,
          avatar_url: 'https://github.com/org1.png',
          description: 'First organization',
        },
        {
          login: 'org2',
          id: 2,
          avatar_url: 'https://github.com/org2.png',
          description: 'Second organization',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockOrgs,
      });

      const orgs = await client.listOrganizations();

      expect(orgs).toEqual(mockOrgs);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/orgs',
        expect.any(Object)

    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
        }),
        json: () => ({
          message: 'API rate limit exceeded',
        }),
      });

      await expect(client.getUser()).rejects.toThrow('API rate limit exceeded');
    });

    it('should handle 404 errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => ({
          message: 'Not Found',
        }),
      });

      await expect(client.getRepository('nonexistent', 'repo')).rejects.toThrow(
        'Not Found'

    });

    it('should retry on network errors', async () => {
      let attempts = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => ({ login: 'testuser' }),
        });
      });

      const result = await client.getUser();

      expect(result).toHaveProperty('login', 'testuser');
      expect(attempts).toBe(3);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      jest.spyOn(client, 'getAccessToken').mockResolvedValue(mockAccessToken);
    });

    it('should handle paginated responses', async () => {
      const mockPage1 = [{ id: 1 }, { id: 2 }];
      const mockPage2 = [{ id: 3 }, { id: 4 }];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => mockPage1,
          headers: new Headers({
            Link: '<https://api.github.com/user/repos?page=2>; rel="next"',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => mockPage2,
          headers: new Headers(),
        });

      const allRepos = await client.listAllRepositories();

      expect(allRepos).toHaveLength(4);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Caching', () => {
    it('should cache frequently accessed data', async () => {
      const mockUserData = { login: 'testuser', id: 12345 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => mockUserData,
      });

      // First call - should hit API
      const user1 = await client.getUser();
      expect(user1).toEqual(mockUserData);

      // Second call - should use cache
      const user2 = await client.getUser();
      expect(user2).toEqual(mockUserData);

      // Verify API was called only once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache on data mutation', async () => {
      const mockUserData = { login: 'testuser', bio: 'Original bio' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockUserData,
      });

      // Get user data (cached)
      await client.getUser();

      // Update user bio
      await client.updateUser({ bio: 'Updated bio' });

      // Get user data again (cache should be invalidated)
      await client.getUser();

      expect(global.fetch).toHaveBeenCalledTimes(3); // Get, Update, Get
    });
  });
});
