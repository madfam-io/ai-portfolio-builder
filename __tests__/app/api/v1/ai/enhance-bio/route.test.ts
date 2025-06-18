/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('AI Enhance Bio API Route', () => {
  const defaultSupabaseMock = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user_123', email: 'test@example.com' } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  };

  const setupMocks = (mockOverrides: any = {}) => {
    // Reset modules to ensure clean state
    jest.resetModules();

    const supabaseMock = mockOverrides.supabase || defaultSupabaseMock;

    jest.doMock('@/lib/supabase/server', () => ({
      createClient: jest.fn().mockResolvedValue(supabaseMock),
    }));

    jest.doMock('@/lib/ai/huggingface-service', () => ({
      HuggingFaceService: jest.fn().mockImplementation(() => ({
        healthCheck: jest
          .fn()
          .mockResolvedValue(mockOverrides.healthCheck ?? true),
        enhanceBio: jest.fn().mockResolvedValue(
          mockOverrides.enhanceBio || {
            enhancedBio:
              'Innovative Full Stack Developer with 5+ years of experience building scalable web applications. Passionate about creating efficient solutions that drive business growth and enhance user experiences.',
            tone: 'professional',
            wordCount: 30,
            keyHighlights: ['Full Stack', 'Scalable', 'Business Growth'],
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
  };

  const createMockRequest = (body: any): NextRequest => {
    const request = new NextRequest(
      'https://example.com/api/v1/ai/enhance-bio',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    request.json = jest.fn().mockResolvedValue(body);
    return request;
  };

  describe('Successful Bio Enhancement', () => {
    it('should enhance bio with AI credits', async () => {
      setupMocks({
        supabase: {
          ...defaultSupabaseMock,
          single: jest
            .fn()
            .mockResolvedValueOnce({
              data: {
                id: 'user_123',
                ai_credits: 10,
                subscription_plan: 'pro',
              },
              error: null,
            })
            .mockResolvedValueOnce({
              data: { id: 'user_123', ai_credits: 9 },
              error: null,
            })
            .mockResolvedValueOnce({
              data: { id: 'usage_123' },
              error: null,
            }),
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        currentBio: 'I am a developer who builds websites.',
        profession: 'Full Stack Developer',
        experience: '5 years',
        tone: 'professional',
        targetLength: 150,
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        enhancedBio: expect.stringContaining('Full Stack Developer'),
        wordCount: expect.any(Number),
        tone: 'professional',
        keyHighlights: expect.any(Array),
        creditsRemaining: 9,
      });
    });

    it('should handle bio enhancement with minimal input', async () => {
      setupMocks({
        supabase: {
          ...defaultSupabaseMock,
          single: jest
            .fn()
            .mockResolvedValueOnce({
              data: { id: 'user_123', ai_credits: 5 },
              error: null,
            })
            .mockResolvedValue({
              data: { id: 'any' },
              error: null,
            }),
        },
        enhanceBio: {
          enhancedBio: 'Professional with diverse experience and skills.',
          tone: 'neutral',
          wordCount: 8,
          keyHighlights: ['Professional', 'Diverse'],
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        currentBio: 'Looking for opportunities',
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.enhancedBio).toBeTruthy();
    });
  });

  describe('Input Validation', () => {
    it('should validate current bio is required', async () => {
      setupMocks();

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const request = createMockRequest({});
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid request');
    });

    it('should validate bio length constraints', async () => {
      setupMocks();

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const request = createMockRequest({
        currentBio: 'Hi', // Too short
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('at least 10 characters');
    });

    it('should validate tone enum values', async () => {
      setupMocks();

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const request = createMockRequest({
        currentBio: 'I am a professional developer',
        tone: 'invalid-tone',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('Authentication', () => {
    it('should require authentication', async () => {
      setupMocks({
        supabase: {
          ...defaultSupabaseMock,
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const request = createMockRequest({
        currentBio: 'I am a developer',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Authentication required');
    });
  });

  describe('Credit Management', () => {
    it('should reject when user has no credits', async () => {
      setupMocks({
        supabase: {
          ...defaultSupabaseMock,
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: 'user_123',
              ai_credits: 0,
              subscription_plan: 'free',
            },
            error: null,
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        currentBio: 'I need an enhanced bio',
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('Insufficient AI credits');
    });

    it('should handle unlimited credits for enterprise users', async () => {
      setupMocks({
        supabase: {
          ...defaultSupabaseMock,
          single: jest
            .fn()
            .mockResolvedValueOnce({
              data: {
                id: 'user_123',
                ai_credits: -1, // Unlimited
                subscription_plan: 'enterprise',
              },
              error: null,
            })
            .mockResolvedValue({
              data: { id: 'any' },
              error: null,
            }),
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        currentBio: 'Enterprise user bio',
        profession: 'CEO',
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.creditsRemaining).toBe('unlimited');
    });
  });

  describe('Error Handling', () => {
    it('should handle AI service health check failure', async () => {
      setupMocks({
        healthCheck: false,
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        currentBio: 'Test bio for enhancement',
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('AI service temporarily unavailable');
    });

    it('should handle database connection failure', async () => {
      setupMocks({
        supabase: null,
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        currentBio: 'Test bio for enhancement',
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
