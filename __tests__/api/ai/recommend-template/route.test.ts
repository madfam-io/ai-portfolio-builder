/**
 * Recommend Template API route test suite
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/recommend-template/route';

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
    recommendTemplate: jest.fn().mockResolvedValue({
      recommendation: 'developer',
      confidence: 0.92,
      reasoning:
        'Based on your technical background and project focus, the developer template best showcases your skills.',
      alternatives: [
        {
          template: 'creative',
          confidence: 0.75,
          reason: 'Good for highlighting visual projects',
        },
        {
          template: 'business',
          confidence: 0.6,
          reason: 'Professional layout for consulting work',
        },
      ],
    }),
  })),
}));

// Mock validation
jest.mock('@/lib/validations/portfolio', () => ({
  templateRecommendationSchema: {
    parse: jest.fn(data => data),
  },
}));

describe('Recommend Template API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth success
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  describe('POST /api/ai/recommend-template', () => {
    test('recommends template for authenticated user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        bio: 'Full-stack developer with 5 years experience',
        industry: 'Technology',
        experience: 'senior',
        projectTypes: ['web apps', 'mobile apps'],
        preferences: {
          visual: false,
          minimal: true,
        },
        modelId: 'meta-llama/Llama-3.1-8B-Instruct',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.recommendation).toBe('developer');
      expect(data.confidence).toBe(0.92);
      expect(data.reasoning).toContain('technical background');
      expect(data.alternatives).toHaveLength(2);
    });

    test('includes alternative recommendations', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        bio: 'Designer and developer',
        industry: 'Creative',
        experience: 'mid',
        projectTypes: ['design', 'development'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.alternatives).toBeDefined();
      expect(data.alternatives[0]).toMatchObject({
        template: expect.any(String),
        confidence: expect.any(Number),
        reason: expect.any(String),
      });
    });

    test('tracks usage in database', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        bio: 'Professional',
        industry: 'Business',
        modelId: 'meta-llama/Llama-3.1-8B-Instruct',
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
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        bio: 'Professional',
        industry: 'Business',
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    test('validates required fields', async () => {
      const templateRecommendationSchema =
        require('@/lib/validations/portfolio').templateRecommendationSchema;
      templateRecommendationSchema.parse.mockImplementationOnce(() => {
        throw new Error('Validation error: bio is required');
      });

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        industry: 'Tech',
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
        recommendTemplate: jest
          .fn()
          .mockRejectedValue(new Error('AI service error')),
      }));

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        bio: 'Professional',
        industry: 'Business',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Failed to get template recommendation');
    });

    test('provides default recommendation on partial failure', async () => {
      const HuggingFaceService =
        require('@/lib/ai/huggingface-service').HuggingFaceService;
      HuggingFaceService.mockImplementationOnce(() => ({
        recommendTemplate: jest.fn().mockResolvedValue({
          recommendation: 'business',
          confidence: 0.5,
          reasoning:
            'Unable to determine best template, defaulting to business',
          alternatives: [],
        }),
      }));

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommend-template',
        {
          method: 'POST',
        }
      );

      request.json = jest.fn().mockResolvedValue({
        bio: 'I do stuff',
        industry: 'Other',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.recommendation).toBe('business');
      expect(data.confidence).toBeLessThan(0.6);
    });
  });
});
