/**
 * Optimize Project API route test suite
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/optimize-project/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => mockSupabase),
}));

// Mock HuggingFace service
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    optimizeProjectDescription: jest.fn().mockResolvedValue({
      title: 'E-commerce Platform Redesign',
      description:
        'Led the complete redesign of a high-traffic e-commerce platform, resulting in 40% increase in conversion rates and 25% reduction in cart abandonment.',
      tags: ['UI/UX', 'React', 'Performance'],
      metrics: {
        conversionIncrease: '40%',
        cartAbandonmentReduction: '25%',
        performanceImprovement: '60% faster page loads',
      },
    }),
  })),
}));

// Mock validation
jest.mock('@/lib/validations/portfolio', () => ({
  projectOptimizationSchema: {
    parse: jest.fn(data => data),
  },
}));

describe('Optimize Project API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth success
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  describe('POST /api/ai/optimize-project', () => {
    test('optimizes project description for authenticated user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/optimize-project',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        title: 'website project',
        description: 'made a website for client',
        technologies: ['React', 'Node.js'],
        outcomes: ['happy client'],
        modelId: 'microsoft/Phi-3.5-mini-instruct',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.optimized).toBeDefined();
      expect(data.optimized.title).toBe('E-commerce Platform Redesign');
      expect(data.optimized.description).toContain('40% increase');
      expect(data.optimized.tags).toEqual(['UI/UX', 'React', 'Performance']);
    });

    test('tracks usage in database', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/optimize-project',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        title: 'project',
        description: 'description',
        technologies: ['React'],
        modelId: 'microsoft/Phi-3.5-mini-instruct',
      });

      await POST(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('ai_usage');
      expect(mockSupabase.from().insert).toHaveBeenCalled();
    });

    test('returns 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/ai/optimize-project',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        title: 'project',
        description: 'description',
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    test('validates required fields', async () => {
      const projectOptimizationSchema =
        require('@/lib/validations/portfolio').projectOptimizationSchema;
      projectOptimizationSchema.parse.mockImplementationOnce(() => {
        throw new Error('Validation error: title is required');
      });

      const request = new NextRequest(
        'http://localhost:3000/api/ai/optimize-project',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        description: 'missing title',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Validation error');
    });

    test('handles AI service errors', async () => {
      const HuggingFaceService =
        require('@/lib/ai/huggingface-service').HuggingFaceService;
      HuggingFaceService.mockImplementationOnce(() => ({
        optimizeProjectDescription: jest
          .fn()
          .mockRejectedValue(new Error('AI service error')),
      }));

      const request = new NextRequest(
        'http://localhost:3000/api/ai/optimize-project',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        title: 'project',
        description: 'description',
        technologies: ['React'],
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Failed to optimize project');
    });
  });
});
