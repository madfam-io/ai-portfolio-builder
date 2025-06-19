/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import {
  setupCommonMocks,
  createMockRequest,
} from '@/__tests__/utils/api-route-test-helpers';

describe('AI Enhance Bio API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Bio Enhancement', () => {
    it('should enhance bio with AI credits', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
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
                  }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [{ id: 'usage_123' }],
                error: null,
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ ai_credits: 9 }],
                error: null,
              }),
            }),
          }),
        },
      });

      // Mock HuggingFace service
      jest.doMock('@/lib/ai/huggingface-service', () => ({
        HuggingFaceService: jest.fn().mockImplementation(() => ({
          healthCheck: jest.fn().mockResolvedValue(true),
          enhanceBio: jest.fn().mockResolvedValue({
            enhancedBio:
              'Innovative Full Stack Developer with 5+ years of experience building scalable web applications.',
            tone: 'professional',
            wordCount: 15,
            keyHighlights: ['Full Stack', 'Scalable', 'Web Applications'],
          }),
        })),
      }));

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'I am a developer who builds websites.',
        context: {
          title: 'Full Stack Developer',
          skills: ['React', 'Node.js', 'TypeScript'],
          tone: 'professional',
          targetLength: 'concise',
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

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
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'user_123', ai_credits: 5 },
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [{ id: 'usage_123' }],
                error: null,
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ ai_credits: 4 }],
                error: null,
              }),
            }),
          }),
        },
      });

      jest.doMock('@/lib/ai/huggingface-service', () => ({
        HuggingFaceService: jest.fn().mockImplementation(() => ({
          healthCheck: jest.fn().mockResolvedValue(true),
          enhanceBio: jest.fn().mockResolvedValue({
            enhancedBio: 'Professional with diverse experience and skills.',
            tone: 'professional',
            wordCount: 8,
            keyHighlights: ['Professional', 'Diverse'],
          }),
        })),
      }));

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'I work in tech.',
        context: {
          title: 'Developer',
          skills: ['Programming'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.enhancedBio).toContain('Professional');
      expect(result.creditsRemaining).toBe(4);
    });

    it('should enhance bio for free plan users', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'user_123',
                    ai_credits: 3,
                    subscription_plan: 'free',
                  },
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [{ id: 'usage_123' }],
                error: null,
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ ai_credits: 2 }],
                error: null,
              }),
            }),
          }),
        },
      });

      jest.doMock('@/lib/ai/huggingface-service', () => ({
        HuggingFaceService: jest.fn().mockImplementation(() => ({
          healthCheck: jest.fn().mockResolvedValue(true),
          enhanceBio: jest.fn().mockResolvedValue({
            enhancedBio: 'Skilled developer creating innovative solutions.',
            tone: 'professional',
            wordCount: 6,
            keyHighlights: ['Skilled', 'Innovative'],
          }),
        })),
      }));

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'Developer building apps.',
        context: {
          title: 'App Developer',
          skills: ['Mobile', 'Web'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.creditsRemaining).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid bio input', async () => {
      setupCommonMocks();

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'Too short', // Less than 10 characters
        context: {
          title: 'Developer',
          skills: ['JavaScript'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Bio must be at least 10 characters');
    });

    it('should return 402 when user has no AI credits', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'user_123',
                    ai_credits: 0,
                    subscription_plan: 'free',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'I am a developer working on web applications.',
        context: {
          title: 'Web Developer',
          skills: ['React', 'CSS'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(402);
      expect(result.error).toContain('Insufficient AI credits');
    });

    it('should handle HuggingFace service errors', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'user_123', ai_credits: 10 },
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      jest.doMock('@/lib/ai/huggingface-service', () => ({
        HuggingFaceService: jest.fn().mockImplementation(() => ({
          healthCheck: jest.fn().mockResolvedValue(false),
          enhanceBio: jest
            .fn()
            .mockRejectedValue(new Error('AI service unavailable')),
        })),
      }));

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'I am a software developer with experience.',
        context: {
          title: 'Software Developer',
          skills: ['Python', 'JavaScript'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toContain('AI service temporarily unavailable');
    });

    it('should return 401 for unauthenticated requests', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        },
      });

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'Unauthorized bio enhancement attempt.',
        context: {
          title: 'Developer',
          skills: ['Hacking'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Authentication required');
    });
  });

  describe('Credit Tracking', () => {
    it('should track AI usage in database', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'usage_123' }],
          error: null,
        }),
      });

      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockImplementation(table => {
            if (table === 'ai_usage') {
              return { insert: mockInsert };
            }
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'user_123', ai_credits: 5 },
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [{ ai_credits: 4 }],
                  error: null,
                }),
              }),
            };
          }),
        },
      });

      jest.doMock('@/lib/ai/huggingface-service', () => ({
        HuggingFaceService: jest.fn().mockImplementation(() => ({
          healthCheck: jest.fn().mockResolvedValue(true),
          enhanceBio: jest.fn().mockResolvedValue({
            enhancedBio: 'Enhanced bio content.',
            tone: 'professional',
            wordCount: 4,
            keyHighlights: ['Enhanced'],
          }),
        })),
      }));

      const { POST } = await import('@/app/api/v1/ai/enhance-bio/route');

      const requestBody = {
        bio: 'Basic bio to enhance.',
        context: {
          title: 'Developer',
          skills: ['Code'],
        },
      };

      const request = createMockRequest(
        'https://example.com/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: requestBody,
        }
      );

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user_123',
          feature_type: 'bio_enhancement',
          credits_used: 1,
        })
      );
    });
  });
});
