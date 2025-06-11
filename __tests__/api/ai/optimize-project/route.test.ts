/**
 * Optimize Project API route test suite
 */

import { NextRequest } from 'next/server';

// Mock Supabase first before importing the route
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(async () => ({
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
  })),
}));

// Import route after mocks are set up
import { POST } from '@/app/api/ai/optimize-project/route';

// Get the mocked supabase for test assertions
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

// Mock HuggingFace service - match the expected response structure
const mockOptimizeResponse = {
  title: 'E-commerce Platform Redesign',
  description:
    'Led the complete redesign of a high-traffic e-commerce platform, resulting in 40% increase in conversion rates and 25% reduction in cart abandonment.',
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  highlights: [
    '40% increase in conversion rates',
    '25% reduction in cart abandonment',
  ],
  metrics: ['40% conversion increase', '60% faster page loads'],
  starFormat: {
    situation: 'High-traffic e-commerce platform needed redesign',
    task: 'Lead complete platform overhaul',
    action: 'Implemented modern React architecture',
    result: '40% increase in conversions',
  },
};

jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue(true),
    optimizeProjectDescription: jest
      .fn()
      .mockResolvedValue(mockOptimizeResponse),
    scoreContent: jest.fn().mockResolvedValue({
      overall: 85,
      readability: 90,
      professionalism: 85,
      impact: 80,
      completeness: 85,
      suggestions: ['Add more specific metrics'],
    }),
  })),
}));

// Note: The route uses inline zod validation, not a separate schema from @/lib/validations/portfolio

// Import createClient mock
import { createClient } from '@/lib/supabase/server';
const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe('Optimize Project API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth success
    const mockClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    mockedCreateClient.mockResolvedValue(mockClient as any);
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
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe('E-commerce Platform Redesign');
      expect(result.data.description).toContain('40% increase');
      expect(result.data.technologies).toContain('React');
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

      // Check that createClient was called and from method was used
      const client = await createClient();
      expect(client?.from).toHaveBeenCalledWith('ai_usage_logs');
      expect(client?.from('ai_usage_logs').insert).toHaveBeenCalled();
    });

    test('returns 401 when not authenticated', async () => {
      // Override the mock for this specific test
      const mockClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };

      mockedCreateClient.mockResolvedValue(mockClient as any);

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
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    test('handles AI service errors', async () => {
      const HuggingFaceService =
        require('@/lib/ai/huggingface-service').HuggingFaceService;
      HuggingFaceService.mockImplementationOnce(() => ({
        healthCheck: jest.fn().mockResolvedValue(true),
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
      expect(data.error).toBe('Internal server error');
    });
  });
});
