import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/optimize-project/route';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { createClient } from '@/lib/supabase/server';
import { AIServiceError, QuotaExceededError } from '@/lib/ai/types';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

describe('/api/v1/ai/optimize-project', () => {
  let mockSupabaseClient: any;
  let mockUser: any;
  let mockHuggingFaceInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
    };

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Setup HuggingFace service mock
    mockHuggingFaceInstance = {
      healthCheck: jest.fn().mockResolvedValue(true),
      optimizeProjectDescription: jest.fn(),
    };

    (HuggingFaceService as jest.Mock).mockImplementation(
      () => mockHuggingFaceInstance
    );
  });

  describe('POST /api/v1/ai/optimize-project', () => {
    it('should optimize project description successfully', async () => {
      const mockOptimizedResult = {
        enhancedDescription: 'Enhanced description with better details',
        highlights: [
          'Built scalable architecture',
          'Improved performance by 50%',
        ],
        extractedSkills: ['React', 'Node.js', 'MongoDB'],
        confidence: 0.85,
      };

      mockHuggingFaceInstance.optimizeProjectDescription.mockResolvedValue(
        mockOptimizedResult
      );

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'E-commerce Platform',
            description:
              'Built an e-commerce platform with payment integration',
            technologies: ['React', 'Node.js', 'Stripe'],
            context: {
              industry: 'retail',
              projectType: 'web',
              targetAudience: 'employers',
              emphasize: 'technical',
            },
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        optimizedDescription: mockOptimizedResult.enhancedDescription,
        highlights: mockOptimizedResult.highlights,
        extractedSkills: mockOptimizedResult.extractedSkills,
        confidence: mockOptimizedResult.confidence,
        originalDescription:
          'Built an e-commerce platform with payment integration',
      });

      expect(
        mockHuggingFaceInstance.optimizeProjectDescription
      ).toHaveBeenCalledWith(
        'Built an e-commerce platform with payment integration',
        ['React', 'Node.js', 'Stripe'],
        'retail'
      );
    });

    it('should handle authentication errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Project',
            description: 'Test description',
            technologies: ['React'],
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate request body', async () => {
      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: '', // Invalid: empty title
            description: 'Short', // Invalid: too short
            technologies: [], // Invalid: empty array
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Invalid request');
      expect(data.details).toBeDefined();
    });

    it('should handle AI service errors', async () => {
      mockHuggingFaceInstance.optimizeProjectDescription.mockRejectedValue(
        new AIServiceError(
          'Model unavailable',
          'SERVICE_UNAVAILABLE',
          'huggingface'
        )
      );

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Project',
            description: 'Test description that needs optimization',
            technologies: ['React'],
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toBe('AI service temporarily unavailable');
    });

    it('should handle quota exceeded errors', async () => {
      mockHuggingFaceInstance.optimizeProjectDescription.mockRejectedValue(
        new QuotaExceededError('Monthly quota exceeded', 30, 30)
      );

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Project',
            description: 'Test description that needs optimization',
            technologies: ['React'],
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.error).toBe('AI enhancement limit reached');
      expect(data.quota).toEqual({
        used: 30,
        limit: 30,
        resetDate: expect.any(String),
      });
    });

    it('should handle Supabase service unavailable', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Project',
            description: 'Test description',
            technologies: ['React'],
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toBe('Service temporarily unavailable');
    });

    it('should log AI usage', async () => {
      const mockOptimizedResult = {
        enhancedDescription: 'Enhanced description',
        highlights: ['Highlight 1'],
        extractedSkills: ['React'],
        confidence: 0.9,
      };

      mockHuggingFaceInstance.optimizeProjectDescription.mockResolvedValue(
        mockOptimizedResult
      );

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Project',
            description: 'Test description that needs optimization',
            technologies: ['React'],
          }),
        }
      );

      await POST(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_usage_logs');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        feature: 'project_optimization',
        model: 'microsoft/codebert-base',
        tokens_used: expect.any(Number),
        success: true,
        metadata: {
          projectTitle: 'Test Project',
          technologiesCount: 1,
          confidence: 0.9,
        },
      });
    });

    it('should handle different project types', async () => {
      const testCases = [
        { projectType: 'mobile', expectedIndustry: undefined },
        { projectType: 'ai/ml', expectedIndustry: 'technology' },
        { projectType: 'api', expectedIndustry: undefined },
      ];

      for (const testCase of testCases) {
        mockHuggingFaceInstance.optimizeProjectDescription.mockResolvedValue({
          enhancedDescription: 'Enhanced',
          highlights: [],
          extractedSkills: [],
          confidence: 0.8,
        });

        const _request = new NextRequest(
          'http://localhost:3000/api/v1/ai/optimize-project',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: 'Test Project',
              description: 'Test description for different project types',
              technologies: ['Python'],
              context: {
                projectType: testCase.projectType,
                industry: testCase.expectedIndustry,
              },
            }),
          }
        );

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle missing optional context', async () => {
      mockHuggingFaceInstance.optimizeProjectDescription.mockResolvedValue({
        enhancedDescription: 'Enhanced description',
        highlights: [],
        extractedSkills: [],
        confidence: 0.75,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/ai/optimize-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Project',
            description: 'Basic project description',
            technologies: ['JavaScript'],
            // No context provided
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(
        mockHuggingFaceInstance.optimizeProjectDescription
      ).toHaveBeenCalledWith(
        'Basic project description',
        ['JavaScript'],
        undefined
      );
    });
  });
});
