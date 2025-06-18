import { describe, test, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/integrations/github/auth/route';


// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
}));

describe('/api/v1/integrations/github/auth', () => {
  let mockRequest: NextRequest;
  const GITHUB_CLIENT_ID = 'test-client-id';
  const GITHUB_REDIRECT_URI =
    'http://localhost:3000/api/v1/integrations/github/callback';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_CLIENT_ID = GITHUB_CLIENT_ID;
    process.env.GITHUB_REDIRECT_URI = GITHUB_REDIRECT_URI;
  });

  afterEach(() => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_REDIRECT_URI;
  });

  describe('GET /api/v1/integrations/github/auth', () => {
    it('should redirect to GitHub OAuth authorization page', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain(
        'https://github.com/login/oauth/authorize'

      expect(response.headers.get('Location')).toContain(
        `client_id=${GITHUB_CLIENT_ID}`

      expect(response.headers.get('Location')).toContain(
        'scope=repo%20read:user'

    });

    it('should include state parameter for CSRF protection', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);
      const location = response.headers.get('Location');

      expect(location).toContain('state=');

      // Extract state parameter
      const stateMatch = location?.match(/state=([^&]+)/);
      expect(stateMatch).toBeTruthy();
      expect(stateMatch?.[1]).toHaveLength(32); // UUID without dashes
    });

    it('should include all required scopes', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);
      const location = response.headers.get('Location');

      expect(location).toContain('scope=');
      expect(location).toContain('repo');
      expect(location).toContain('read:user');
      expect(location).toContain('read:org');
    });

    it('should handle redirect_uri parameter', async () => {
      const customRedirect = 'http://localhost:3000/dashboard/integrations';
      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/auth?redirect_uri=${encodeURIComponent(customRedirect)}`

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      // The state should include the redirect URI
      const location = response.headers.get('Location');
      expect(location).toContain('state=');
    });

    it('should require authentication', async () => {
      const createClient = require('@/lib/supabase/server').createClient;
      createClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);

      expect(response.status).toBe(401);
    });

    it('should handle missing environment variables', async () => {
      delete process.env.GITHUB_CLIENT_ID;

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should store state in session/cookie', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);

      // Check for Set-Cookie header
      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain('github_oauth_state');
    });
  });

  describe('OAuth Flow Security', () => {
    it('should generate unique state for each request', async () => {
      const states = new Set<string>();

      for (let i = 0; i < 5; i++) {
        mockRequest = new NextRequest(
          'http://localhost:3000/api/v1/integrations/github/auth'

        const response = await GET(mockRequest);
        const location = response.headers.get('Location');
        const stateMatch = location?.match(/state=([^&]+)/);

        if (stateMatch) {
          states.add(stateMatch[1]);
        }
      }

      expect(states.size).toBe(5); // All states should be unique
    });

    it('should handle enterprise GitHub instances', async () => {
      process.env.GITHUB_ENTERPRISE_URL = 'https://github.company.com';

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);
      const location = response.headers.get('Location');

      expect(location).toContain(
        'https://github.company.com/login/oauth/authorize'

      delete process.env.GITHUB_ENTERPRISE_URL;
    });

    it('should include custom scopes if requested', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth?scopes=repo,workflow,admin:org'

      const response = await GET(mockRequest);
      const location = response.headers.get('Location');

      expect(location).toContain('workflow');
      expect(location).toContain('admin:org');
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase auth errors', async () => {
      const createClient = require('@/lib/supabase/server').createClient;
      createClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Auth service unavailable'),
          }),
        },
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/auth'

      const response = await GET(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should validate redirect_uri domain', async () => {
      const maliciousRedirect = 'http://evil.com/steal-token';
      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/auth?redirect_uri=${encodeURIComponent(maliciousRedirect)}`

      const response = await GET(mockRequest);

      expect(response.status).toBe(400);
    });
  });
});
