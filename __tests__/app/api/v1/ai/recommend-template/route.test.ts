import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/recommend-template/route';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { createClient } from '@/lib/supabase/server';
import { AIServiceError } from '@/lib/ai/types';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

describe('/api/v1/ai/recommend-template', () => {
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
      recommendTemplate: jest.fn(),
    };

    (HuggingFaceService as jest.Mock).mockImplementation(() => mockHuggingFaceInstance);
  });

  describe('POST /api/v1/ai/recommend-template', () => {
    it('should recommend template successfully', async () => {
      const mockRecommendation = {
        recommendedTemplate: 'developer',
        confidence: 0.92,
        reasoning: 'Strong technical background with multiple development projects',
        alternatives: [
          { template: 'modern', score: 0.85 },
          { template: 'minimal', score: 0.78 },
        ],
      };

      mockHuggingFaceInstance.recommendTemplate.mockResolvedValue(mockRecommendation);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'Full Stack Developer',
            skills: ['React', 'Node.js', 'Python', 'AWS'],
            projectCount: 8,
            hasDesignWork: false,
            industry: 'technology',
            experienceLevel: 'senior',
          },
          preferences: {
            style: 'modern',
            targetAudience: 'employers',
            priority: 'content_heavy',
          },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        recommendation: mockRecommendation.recommendedTemplate,
        confidence: mockRecommendation.confidence,
        reasoning: mockRecommendation.reasoning,
        alternatives: mockRecommendation.alternatives,
      });

      expect(mockHuggingFaceInstance.recommendTemplate).toHaveBeenCalledWith({
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        projectCount: 8,
        hasDesignWork: false,
        industry: 'technology',
        experienceLevel: 'senior',
      });
    });

    it('should handle authentication errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null },
        error: new Error('Not authenticated') 
      });

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'Developer',
            skills: ['JavaScript'],
            projectCount: 1,
            hasDesignWork: false,
            experienceLevel: 'entry',
          },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate request body', async () => {
      const testCases = [
        {
          body: {
            profile: {
              // Missing required fields
            },
          },
          expectedError: 'Invalid request',
        },
        {
          body: {
            profile: {
              title: '', // Empty title
              skills: [],  // Empty skills array
              projectCount: -1, // Negative count
              hasDesignWork: false,
              experienceLevel: 'expert', // Invalid enum value
            },
          },
          expectedError: 'Invalid request',
        },
      ];

      for (const testCase of testCases) {
        const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.body),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toBe(testCase.expectedError);
      }
    });

    it('should handle AI service errors', async () => {
      mockHuggingFaceInstance.recommendTemplate.mockRejectedValue(
        new AIServiceError('Model unavailable', 'SERVICE_UNAVAILABLE', 'huggingface')
      );

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'Designer',
            skills: ['Figma', 'Sketch'],
            projectCount: 5,
            hasDesignWork: true,
            experienceLevel: 'mid',
          },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toBe('AI service temporarily unavailable');
    });

    it('should handle database connection failure', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'Developer',
            skills: ['Python'],
            projectCount: 3,
            hasDesignWork: false,
            experienceLevel: 'mid',
          },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('Database connection failed');
    });

    it('should log AI usage', async () => {
      const mockRecommendation = {
        recommendedTemplate: 'designer',
        confidence: 0.88,
        reasoning: 'Portfolio shows strong design skills',
        alternatives: [],
      };

      mockHuggingFaceInstance.recommendTemplate.mockResolvedValue(mockRecommendation);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'UX Designer',
            skills: ['Figma', 'Adobe XD'],
            projectCount: 10,
            hasDesignWork: true,
            experienceLevel: 'senior',
          },
        }),
      });

      await POST(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_usage_logs');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        feature: 'template_recommendation',
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        tokens_used: expect.any(Number),
        success: true,
        metadata: {
          recommendedTemplate: 'designer',
          confidence: 0.88,
          alternativesCount: 0,
        },
      });
    });

    it('should handle different experience levels', async () => {
      const experienceLevels = ['entry', 'mid', 'senior', 'lead'];

      for (const level of experienceLevels) {
        mockHuggingFaceInstance.recommendTemplate.mockResolvedValue({
          recommendedTemplate: level === 'entry' ? 'minimal' : 'modern',
          confidence: 0.8,
          reasoning: `Suitable for ${level} level`,
          alternatives: [],
        });

        const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile: {
              title: 'Software Engineer',
              skills: ['JavaScript'],
              projectCount: 5,
              hasDesignWork: false,
              experienceLevel: level,
            },
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle optional preferences', async () => {
      mockHuggingFaceInstance.recommendTemplate.mockResolvedValue({
        recommendedTemplate: 'minimal',
        confidence: 0.85,
        reasoning: 'Clean and simple design',
        alternatives: [],
      });

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'Consultant',
            skills: ['Business Analysis', 'Project Management'],
            projectCount: 15,
            hasDesignWork: false,
            experienceLevel: 'lead',
          },
          // No preferences provided
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.recommendation).toBe('minimal');
    });

    it('should prioritize design templates for designers', async () => {
      mockHuggingFaceInstance.recommendTemplate.mockResolvedValue({
        recommendedTemplate: 'creative',
        confidence: 0.95,
        reasoning: 'Strong design portfolio with visual work',
        alternatives: [
          { template: 'designer', score: 0.92 },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            title: 'Creative Director',
            skills: ['Photoshop', 'Illustrator', 'After Effects'],
            projectCount: 20,
            hasDesignWork: true,
            industry: 'advertising',
            experienceLevel: 'lead',
          },
          preferences: {
            style: 'creative',
            targetAudience: 'clients',
            priority: 'visual_impact',
          },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.recommendation).toBe('creative');
      expect(data.confidence).toBeGreaterThan(0.9);
    });
  });
});