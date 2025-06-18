import { describe, test, it, expect, jest } from '@jest/globals';

/**
 * @jest-environment node
 */

describe('AI Recommend Template API Route', () => {
  // Helper to setup mocks and import route
  const setupTest = async (mockOverrides: any = {}) => {
    jest.resetModules();
    jest.clearAllMocks();

    // Default mock for createClient
    const defaultSupabaseMock = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user_123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: jest.fn().mockResolvedValue({
        data: true,
        error: null,
      })
    };

    // Apply any overrides
    const supabaseMock = mockOverrides.supabase || defaultSupabaseMock;

    jest.doMock('@/lib/supabase/server', () => ({
      createClient: jest.fn().mockResolvedValue(supabaseMock),
    }));

    jest.doMock('@/lib/ai/huggingface-service', () => ({
      HuggingFaceService: jest.fn().mockImplementation(() => ({
        healthCheck: jest
          .fn()
          .mockResolvedValue(mockOverrides.healthCheck ?? true),
        recommendTemplate: jest.fn().mockResolvedValue(
          mockOverrides.recommendTemplate || {
            recommendedTemplate: 'modern',
            confidence: 0.85,
            reasoning: 'Your profile aligns with this template.',
            alternatives: [
              { template: 'minimal', confidence: 0.1 },
              { template: 'creative', confidence: 0.05 },
            ],
          }
        ),
      })),
    }));

    jest.doMock('@/lib/utils/logger', () => ({
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    }));

    // Import the route after mocking
    const { POST } = await import('@/app/api/v1/ai/recommend-template/route');
    return { POST };
  };

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      url: 'https://example.com/api/v1/ai/recommend-template',
    } as any;
  };

  describe('Successful Recommendations', () => {
    it('should recommend template based on user profile', async () => {
      const { POST } = await setupTest();

      const requestBody = {
        profile: {
          title: 'Full Stack Developer',
          skills: ['React', 'Node.js', 'Python', 'AWS'],
          projectCount: 10,
          hasDesignWork: false,
          industry: 'Technology',
          experienceLevel: 'senior',
        },
        preferences: {
          style: 'modern',
          targetAudience: 'employers',
          priority: 'content_heavy',
        },
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('recommendedTemplate', 'modern');
      expect(result.data).toHaveProperty('confidence');
      expect(result.data).toHaveProperty('reasoning');
      expect(result.data).toHaveProperty('alternatives');
    });
  });

  describe('Input Validation', () => {
    it('should require profile object', async () => {
      const { POST } = await setupTest();

      const request = createMockRequest({
        // Missing profile
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid request data');
    });

    it('should require title field', async () => {
      const { POST } = await setupTest();

      const request = createMockRequest({
        profile: {
          // Missing title
          skills: ['React'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid request data');
    });

    it('should require at least one skill', async () => {
      const { POST } = await setupTest();

      const request = createMockRequest({
        profile: {
          title: 'Developer',
          skills: [], // Empty skills
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid request data');
    });

    it('should validate experience level enum', async () => {
      const { POST } = await setupTest();

      const request = createMockRequest({
        profile: {
          title: 'Developer',
          skills: ['React'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'expert', // Invalid enum value
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid request data');
    });
  });

  describe('Authentication', () => {
    it('should require authenticated user', async () => {
      const { POST } = await setupTest({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
          rpc: jest.fn(),
        },
      });

      const request = createMockRequest({
        profile: {
          title: 'Developer',
          skills: ['React'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Authentication required');
    });
  });

  describe('AI Usage Limits', () => {
    it('should reject when AI usage limit exceeded', async () => {
      const { POST } = await setupTest({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          rpc: jest.fn().mockResolvedValue({
            data: false, // Usage limit exceeded
            error: null,
          }),
        },
      });

      const request = createMockRequest({
        profile: {
          title: 'Developer',
          skills: ['React'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toContain('AI usage limit exceeded');
      expect(result.code).toBe('AI_LIMIT_EXCEEDED');
    });
  });

  describe('Service Health', () => {
    it('should return 503 when AI service is unhealthy', async () => {
      const { POST } = await setupTest({
        healthCheck: false, // Service is down
      });

      const request = createMockRequest({
        profile: {
          title: 'Developer',
          skills: ['React'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('AI service temporarily unavailable');
    });
  });

  describe('Database Errors', () => {
    it('should handle database connection failure', async () => {
      jest.resetModules();
      jest.clearAllMocks();

      // Mock createClient to return null
      jest.doMock('@/lib/supabase/server', () => ({
        createClient: jest.fn().mockResolvedValue(null),
      }));

      jest.doMock('@/lib/ai/huggingface-service', () => ({
        HuggingFaceService: jest.fn(),
      }));

      jest.doMock('@/lib/utils/logger', () => ({
        logger: {
          info: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
        },
      }));

      const { POST } = await import('@/app/api/v1/ai/recommend-template/route');

      const request = createMockRequest({
        profile: {
          title: 'Developer',
          skills: ['React'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
