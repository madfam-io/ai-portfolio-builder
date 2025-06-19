/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('AI Optimize Project API Route', () => {
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
        optimizeProjectDescription: jest.fn().mockResolvedValue(
          mockOverrides.optimizeProjectDescription || {
            optimizedDescription:
              'Led development of a cloud-native microservices platform, resulting in 40% improvement in deployment efficiency and 60% reduction in infrastructure costs.',
            extractedMetrics: ['40% improvement', '60% reduction'],
            suggestions: ['Consider adding team size', 'Include timeline'],
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
      'https://example.com/api/v1/ai/optimize-project',
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

  describe('Successful Project Optimization', () => {
    it('should optimize project description with AI credits', async () => {
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

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const requestBody = {
        project: {
          title: 'E-commerce Platform',
          description:
            'Built an e-commerce platform using React and Node.js with payment integration.',
          role: 'Lead Developer',
          technologies: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
          duration: '6 months',
        },
        targetAudience: 'recruiters',
        style: 'metrics-focused',
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        optimizedDescription: expect.stringContaining('40% improvement'),
        extractedMetrics: expect.arrayContaining(['40% improvement']),
        suggestions: expect.any(Array),
        creditsRemaining: 9,
      });
    });

    it('should handle projects with existing metrics', async () => {
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
        optimizeProjectDescription: {
          optimizedDescription:
            'Increased user engagement by 50% through implementation of real-time features.',
          extractedMetrics: ['50% increase'],
          suggestions: [],
        },
      });

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const requestBody = {
        project: {
          title: 'Chat Application',
          description:
            'Created real-time chat app that increased user engagement by 50%.',
        },
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.extractedMetrics).toContain('50% increase');
    });
  });

  describe('Input Validation', () => {
    it('should validate project object is required', async () => {
      setupMocks();

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const request = createMockRequest({});
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid request');
    });

    it('should validate project title is required', async () => {
      setupMocks();

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const request = createMockRequest({
        project: {
          description: 'Some description',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('title');
    });

    it('should validate description length', async () => {
      setupMocks();

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const request = createMockRequest({
        project: {
          title: 'Project',
          description: 'Short', // Too short
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('at least 10 characters');
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

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const request = createMockRequest({
        project: {
          title: 'Test Project',
          description: 'Test description for the project',
        },
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

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const requestBody = {
        project: {
          title: 'Project',
          description: 'Description of the project work',
        },
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

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const requestBody = {
        project: {
          title: 'Enterprise Project',
          description: 'Large scale enterprise system implementation',
        },
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

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const requestBody = {
        project: {
          title: 'Test Project',
          description: 'Test project description',
        },
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

      const { POST } = await import('@/app/api/v1/ai/optimize-project/route');

      const requestBody = {
        project: {
          title: 'Test Project',
          description: 'Test project description',
        },
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
