import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/integrations/github/callback/route';

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
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'integration-id', access_token: 'encrypted-token' },
        error: null,
      }),
    })),
  })),
}));

// Mock GitHub API calls
global.fetch = jest.fn();

describe('/api/v1/integrations/github/callback', () => {
  let mockRequest: NextRequest;
  const GITHUB_CLIENT_ID = 'test-client-id';
  const GITHUB_CLIENT_SECRET = 'test-client-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_CLIENT_ID = GITHUB_CLIENT_ID;
    process.env.GITHUB_CLIENT_SECRET = GITHUB_CLIENT_SECRET;

    // Mock successful token exchange
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => ({
        access_token: 'gho_testtoken123',
        token_type: 'bearer',
        scope: 'repo,read:user',
      }),
    });
  });

  afterEach(() => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

  describe('GET /api/v1/integrations/github/callback', () => {
    it('should exchange code for access token', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      // Mock cookie with matching state
      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(name => {
            if (name === 'github_oauth_state') {
              return { value: state };
            }
            return null;
          }),
          delete: jest.fn(),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/dashboard/integrations?success=true'
      );

      // Verify GitHub API was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
          }),
        })
      );
    });

    it('should validate state parameter for CSRF protection', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';
      const wrongState = 'wrong-state-uuid';

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${wrongState}`
      );

      // Mock cookie with different state
      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(name => {
            if (name === 'github_oauth_state') {
              return { value: state };
            }
            return null;
          }),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle missing code parameter', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/integrations/github/callback?state=test-state'
      );

      const response = await GET(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle GitHub API errors', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';

      // Mock GitHub API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => ({
          error: 'bad_verification_code',
          error_description: 'The code passed is incorrect or expired.',
        }),
      });

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: state })),
          delete: jest.fn(),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain(
        'error=github_auth_failed'
      );
    });

    it('should fetch user data after token exchange', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';

      // Mock user data fetch
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          // Token exchange
          ok: true,
          json: () => ({
            access_token: 'gho_testtoken123',
            token_type: 'bearer',
            scope: 'repo,read:user',
          }),
        })
        .mockResolvedValueOnce({
          // User data fetch
          ok: true,
          json: () => ({
            id: 12345,
            login: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            avatar_url: 'https://github.com/testuser.png',
          }),
        });

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: state })),
          delete: jest.fn(),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer gho_testtoken123',
          }),
        })
      );
    });

    it('should store integration in database', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';
      const supabase = require('@/lib/supabase/server').createClient();

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: state })),
          delete: jest.fn(),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(supabase.from).toHaveBeenCalledWith('github_integrations');
    });

    it('should handle custom redirect URI from state', async () => {
      const code = 'test-auth-code';
      const customRedirect = '/portfolio/settings';
      const stateData = {
        state: 'test-state-uuid',
        redirect_uri: customRedirect,
      };
      const encodedState = Buffer.from(JSON.stringify(stateData)).toString(
        'base64'
      );

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${encodedState}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: encodedState })),
          delete: jest.fn(),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        `${customRedirect}?success=true`
      );
    });
  });

  describe('Error Scenarios', () => {
    it('should handle OAuth error callback', async () => {
      const error = 'access_denied';
      const errorDescription = 'User denied access';

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?error=${error}&error_description=${encodeURIComponent(errorDescription)}`
      );

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=access_denied');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.GITHUB_CLIENT_SECRET;

      const code = 'test-auth-code';
      const state = 'test-state-uuid';

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: state })),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';

      const createClient = require('@/lib/supabase/server').createClient;
      createClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database connection failed'),
          }),
        })),
      });

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: state })),
          delete: jest.fn(),
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should clean up state cookie after use', async () => {
      const code = 'test-auth-code';
      const state = 'test-state-uuid';
      const deleteCookie = jest.fn();

      mockRequest = new NextRequest(
        `http://localhost:3000/api/v1/integrations/github/callback?code=${code}&state=${state}`
      );

      Object.defineProperty(mockRequest, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: state })),
          delete: deleteCookie,
        },
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(302);
      expect(deleteCookie).toHaveBeenCalledWith('github_oauth_state');
    });
  });
});
