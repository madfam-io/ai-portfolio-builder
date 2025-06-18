import { describe, test, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GitHubTokenManager } from '@/lib/integrations/github/tokenManager';
import { createClient } from '@/lib/supabase/server';
import * as _crypto from 'crypto';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


// Mock dependencies

jest.mock('@/lib/services/error/error-logger');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => Buffer.from('randomsecret')),
  createCipheriv: jest.fn(() => ({
    update: jest.fn(() => Buffer.from('encrypted')),
    final: jest.fn(() => Buffer.from('final')),
  })),
  createDecipheriv: jest.fn(() => ({
    update: jest.fn(() => Buffer.from('decrypted')),
    final: jest.fn(() => Buffer.from('token')),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('GitHubTokenManager', () => {
  setupCommonMocks();

  let tokenManager: GitHubTokenManager;
  let mockSupabase: any;
  const _mockUserId = 'user-123';
  const mockAccessToken = 'gho_testtoken123';
  const mockRefreshToken = 'ghr_refreshtoken123';
  const mockEncryptionKey = 'test-encryption-key-32-chars-long';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY = mockEncryptionKey;

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'integration-123',
            user_id: mockUserId,
            access_token: 'encrypted_token',
            refresh_token: 'encrypted_refresh',
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            scope: 'repo,read:user',
          },
          error: null,
        }),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    tokenManager = new GitHubTokenManager();
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  });

  describe('Token Storage', () => {
    it('should store encrypted tokens', async () => {
      const tokenData = {
        userId: mockUserId,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 3600,
        scope: 'repo,read:user',
      };

      await tokenManager.storeTokens(tokenData);

      expect(mockSupabase.from).toHaveBeenCalledWith('github_integrations');
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          access_token: expect.any(String), // Encrypted
          refresh_token: expect.any(String), // Encrypted
          expires_at: expect.any(String),
          scope: 'repo,read:user',
        })
    });

    it('should encrypt tokens before storage', async () => {
      const tokenData = {
        userId: mockUserId,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 3600,
      };

      await tokenManager.storeTokens(tokenData);

      const upsertCall = mockSupabase.from().upsert.mock.calls[0][0];
      expect(upsertCall.access_token).not.toBe(mockAccessToken);
      expect(upsertCall.refresh_token).not.toBe(mockRefreshToken);
      expect(upsertCall.access_token).toContain(':'); // IV separator
    });

    it('should handle missing encryption key', async () => {
      delete process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
      const newTokenManager = new GitHubTokenManager();

      await expect(
        newTokenManager.storeTokens({
          userId: mockUserId,
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          expiresIn: 3600,
        })
      ).rejects.toThrow('Encryption key not configured');
    });
  });

  describe('Token Retrieval', () => {
    it('should retrieve and decrypt tokens', async () => {
      const decryptedToken = await tokenManager.getAccessToken(mockUserId);

      expect(decryptedToken).toBeTruthy();
      expect(mockSupabase.from).toHaveBeenCalledWith('github_integrations');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
        'user_id',
        mockUserId

    });

    it('should return null for non-existent integration', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      });

      const token = await tokenManager.getAccessToken('non-existent-user');

      expect(token).toBeNull();
    });

    it('should validate token expiration', async () => {
      // Mock expired token
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            access_token: 'encrypted_token',
            refresh_token: 'encrypted_refresh',
            expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired
          },
          error: null,
        }),
      });

      const isExpired = await tokenManager.isTokenExpired(mockUserId);

      expect(isExpired).toBe(true);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh expired tokens', async () => {
      const mockNewToken = 'gho_newtoken456';
      const mockNewRefresh = 'ghr_newrefresh456';

      // Mock GitHub token refresh response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          access_token: mockNewToken,
          refresh_token: mockNewRefresh,
          expires_in: 7200,
          scope: 'repo,read:user',
        }),
      });

      const refreshedToken = await tokenManager.refreshToken(mockUserId);

      expect(refreshedToken).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('grant_type=refresh_token'),
        })
    });

    it('should update stored tokens after refresh', async () => {
      const mockNewToken = 'gho_newtoken456';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          access_token: mockNewToken,
          refresh_token: 'ghr_newrefresh456',
          expires_in: 7200,
        }),
      });

      await tokenManager.refreshToken(mockUserId);

      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: expect.any(String), // Encrypted new token
          refresh_token: expect.any(String),
          expires_at: expect.any(String),
        })
    });

    it('should handle refresh token failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => ({
          error: 'invalid_grant',
          error_description: 'The refresh token is invalid',
        }),
      });

      await expect(tokenManager.refreshToken(mockUserId)).rejects.toThrow(
        'Failed to refresh token'

    });

    it('should implement refresh token rotation', async () => {
      const rotatedRefreshToken = 'ghr_rotated789';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          access_token: 'gho_newtoken456',
          refresh_token: rotatedRefreshToken,
          expires_in: 7200,
        }),
      });

      await tokenManager.refreshToken(mockUserId);

      const updateCall = mockSupabase.from().update.mock.calls[0][0];
      expect(updateCall.refresh_token).toBeTruthy();
      expect(updateCall.refresh_token).not.toBe(mockRefreshToken);
    });
  });

  describe('Token Revocation', () => {
    it('should revoke tokens', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await tokenManager.revokeToken(mockUserId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('github.com'),
        expect.objectContaining({
          method: 'DELETE',
        })

      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });

    it('should remove tokens from database after revocation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await tokenManager.revokeToken(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('github_integrations');
      expect(mockSupabase.from().delete).toHaveBeenCalled();
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
        'user_id',
        mockUserId

    });

    it('should handle revocation API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => ({ message: 'Token not found' }),
      });

      // Should still remove from database even if API fails
      await tokenManager.revokeToken(mockUserId);

      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });
  });

  describe('Scope Management', () => {
    it('should validate token scopes', async () => {
      const hasScope = await tokenManager.hasScope(mockUserId, 'repo');
      expect(hasScope).toBe(true);

      const hasMissingScope = await tokenManager.hasScope(
        mockUserId,
        'admin:org'

      expect(hasMissingScope).toBe(false);
    });

    it('should request additional scopes', async () => {
      const authUrl = await tokenManager.requestAdditionalScopes(mockUserId, [
        'workflow',
        'admin:org',
      ]);

      expect(authUrl).toContain('https://github.com/login/oauth/authorize');
      expect(authUrl).toContain(
        'scope=repo%2Cread%3Auser%2Cworkflow%2Cadmin%3Aorg'

    });

    it('should merge existing and new scopes', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            scope: 'repo,read:user',
          },
          error: null,
        }),
      });

      const authUrl = await tokenManager.requestAdditionalScopes(mockUserId, [
        'workflow',
      ]);

      expect(authUrl).toContain('scope=repo%2Cread%3Auser%2Cworkflow');
    });
  });

  describe('Security', () => {
    it('should use strong encryption for tokens', async () => {
      const encryptedToken = await tokenManager.encryptToken(mockAccessToken);

      expect(encryptedToken).not.toBe(mockAccessToken);
      expect(encryptedToken).toContain(':'); // IV separator
      expect(encryptedToken.length).toBeGreaterThan(mockAccessToken.length);
    });

    it('should generate unique IV for each encryption', async () => {
      const encrypted1 = await tokenManager.encryptToken(mockAccessToken);
      const encrypted2 = await tokenManager.encryptToken(mockAccessToken);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });

    it('should properly decrypt encrypted tokens', async () => {
      const encryptedToken = await tokenManager.encryptToken(mockAccessToken);
      const decryptedToken = await tokenManager.decryptToken(encryptedToken);

      expect(decryptedToken).toBe(mockAccessToken);
    });

    it('should validate encryption key length', async () => {
      process.env.GITHUB_TOKEN_ENCRYPTION_KEY = 'short-key';
      const shortKeyManager = new GitHubTokenManager();

      await expect(
        shortKeyManager.encryptToken(mockAccessToken)
      ).rejects.toThrow('Invalid encryption key length');
    });
  });

  describe('Token Lifecycle', () => {
    it('should track token usage statistics', async () => {
      await tokenManager.trackTokenUsage(mockUserId, 'api_call');

      expect(mockSupabase.from).toHaveBeenCalledWith('github_token_usage');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          action: 'api_call',
          timestamp: expect.any(String),
        })
    });

    it('should implement token auto-refresh', async () => {
      // Mock token that expires in 5 minutes
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            access_token: 'encrypted_token',
            refresh_token: 'encrypted_refresh',
            expires_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes
          },
          error: null,
        }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          access_token: 'gho_refreshed',
          refresh_token: 'ghr_refreshed',
          expires_in: 7200,
        }),
      });

      const token =
        await tokenManager.getAccessTokenWithAutoRefresh(mockUserId);

      expect(token).toBeTruthy();
      expect(global.fetch).toHaveBeenCalled(); // Auto-refresh triggered
    });

    it('should clean up expired tokens periodically', async () => {
      const _expiredDate = new Date(Date.now() - 86400000).toISOString(); // 24 hours ago

      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      await tokenManager.cleanupExpiredTokens();

      expect(mockSupabase.from).toHaveBeenCalledWith('github_integrations');
      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      await expect(tokenManager.getAccessToken(mockUserId)).rejects.toThrow(
        'Database connection failed'

    });

    it('should log security events', async () => {
      const errorLogger = require('@/lib/services/error/error-logger');

      // Simulate failed decryption
      await expect(
        tokenManager.decryptToken('invalid:encrypted:data')
      ).rejects.toThrow();

      expect(errorLogger.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('decryption failed'),
          severity: 'high',
        })
    });

    it('should implement rate limiting for token operations', async () => {
      const promises = Array.from({ length: 10 }, () =>
        tokenManager.getAccessToken(mockUserId)

      await Promise.all(promises);

      // After rate limit, should throw
      await expect(tokenManager.getAccessToken(mockUserId)).rejects.toThrow(
        'Rate limit exceeded'

    });
  });
});
