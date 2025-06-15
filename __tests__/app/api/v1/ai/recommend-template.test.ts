/**
 * @jest-environment node
 */

// Mock modules first
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
  })
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn()
}));

// Import after mocks
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/recommend-template/route';
import { createClient } from '@/lib/supabase/server';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { logger } from '@/lib/utils/logger';

describe('POST /api/v1/ai/recommend-template', () => {
  let mockSupabase: any;
  let mockAIService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null
        })
      },
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null })
      }))
    };

    // Setup mock AI service
    mockAIService = {
      healthCheck: jest.fn().mockResolvedValue(true),
      recommendTemplate: jest.fn().mockResolvedValue({
        recommendedTemplate: 'developer',
        confidence: 0.92,
        reasoning: [
          'Strong technical background with multiple programming languages',
          'Project-focused portfolio needs',
          'Target audience is technical employers'
        ],
        alternatives: [
          {
            template: 'modern',
            confidence: 0.78,
            reasoning: 'Good for showcasing technical projects with visual elements'
          },
          {
            template: 'minimal',
            confidence: 0.65,
            reasoning: 'Clean design that focuses on content'
          }
        ],
        modelUsed: 'meta-llama/Llama-3.2-3B-Instruct',
        processingTime: 1800
      })
    };

    (createClient as jest.Mock).mockImplementation(async () => mockSupabase);
    (HuggingFaceService as jest.Mock).mockImplementation(() => mockAIService);
  });

  it('should recommend template successfully', async () => {
    const requestData = {
      profile: {
        title: 'Senior Software Engineer',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        projectCount: 8,
        hasDesignWork: false,
        industry: 'Technology',
        experienceLevel: 'senior'
      },
      preferences: {
        style: 'professional',
        targetAudience: 'employers',
        priority: 'content_heavy'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.recommendedTemplate).toBe('developer');
    expect(data.data.confidence).toBeGreaterThanOrEqual(0.92);
    expect(data.data.alternatives).toHaveLength(2);
    expect(mockAIService.recommendTemplate).toHaveBeenCalledWith(
      requestData.profile
    );
  });

  it('should require authentication', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'Developer',
          skills: ['JavaScript'],
          projectCount: 1,
          hasDesignWork: false,
          experienceLevel: 'entry'
        }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should validate required profile fields', async () => {
    const invalidData = {
      profile: {
        title: '', // Empty title
        skills: [], // No skills
        projectCount: -1, // Invalid count
        hasDesignWork: false,
        experienceLevel: 'invalid' // Invalid level
      }
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: 'Professional title is required'
      })
    );
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: 'At least one skill is required'
      })
    );
  });

  it('should handle database connection failure', async () => {
    (createClient as jest.Mock).mockImplementation(async () => null);

    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'Developer',
          skills: ['JavaScript'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid'
        }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database connection failed');
  });

  it('should handle AI service unavailable', async () => {
    mockAIService.healthCheck.mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'Developer',
          skills: ['JavaScript'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid'
        }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('AI service temporarily unavailable');
  });

  it('should handle AI service errors', async () => {
    mockAIService.recommendTemplate.mockRejectedValue(new Error('AI processing failed'));

    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'Developer',
          skills: ['JavaScript'],
          projectCount: 5,
          hasDesignWork: false,
          experienceLevel: 'mid'
        }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle different experience levels', async () => {
    const levels = ['entry', 'mid', 'senior', 'lead'];

    for (const experienceLevel of levels) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        body: JSON.stringify({
          profile: {
            title: 'Developer',
            skills: ['JavaScript'],
            projectCount: 5,
            hasDesignWork: false,
            experienceLevel
          }
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.recommendTemplate).toHaveBeenCalledTimes(levels.length);
  });

  it('should handle designer profiles', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'UI/UX Designer',
          skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
          projectCount: 12,
          hasDesignWork: true,
          industry: 'Design',
          experienceLevel: 'mid'
        },
        preferences: {
          style: 'creative',
          priority: 'visual_impact'
        }
      })
    });

    mockAIService.recommendTemplate.mockResolvedValueOnce({
      recommendedTemplate: 'designer',
      confidence: 0.95,
      reasoning: ['Strong design portfolio', 'Visual work requires showcase'],
      alternatives: [{
        template: 'creative',
        confidence: 0.88,
        reasoning: 'Alternative for creative professionals'
      }],
      modelUsed: 'meta-llama/Llama-3.2-3B-Instruct',
      processingTime: 1500
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.recommendedTemplate).toBe('designer');
    expect(data.data.confidence).toBeGreaterThan(0.9);
  });

  it('should handle preferences when provided', async () => {
    const preferences = [
      { style: 'minimal', targetAudience: 'employers', priority: 'simplicity' },
      { style: 'modern', targetAudience: 'clients', priority: 'visual_impact' },
      { style: 'creative', targetAudience: 'collaborators', priority: 'content_heavy' },
      { style: 'professional' } // Partial preferences
    ];

    for (const preference of preferences) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
        method: 'POST',
        body: JSON.stringify({
          profile: {
            title: 'Full Stack Developer',
            skills: ['React', 'Node.js'],
            projectCount: 5,
            hasDesignWork: false,
            experienceLevel: 'mid'
          },
          preferences: preference
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.recommendTemplate).toHaveBeenCalledTimes(preferences.length);
  });

  it('should work without preferences', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'Software Engineer',
          skills: ['Python', 'Django', 'PostgreSQL'],
          projectCount: 3,
          hasDesignWork: false,
          experienceLevel: 'entry'
        }
        // No preferences provided
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockAIService.recommendTemplate).toHaveBeenCalledWith(
      expect.any(Object)
    );
  });

  it('should handle consultants and freelancers', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile: {
          title: 'Freelance Consultant',
          skills: ['Project Management', 'Business Analysis', 'Agile'],
          projectCount: 15,
          hasDesignWork: false,
          industry: 'Consulting',
          experienceLevel: 'senior'
        },
        preferences: {
          targetAudience: 'clients',
          priority: 'content_heavy'
        }
      })
    });

    mockAIService.recommendTemplate.mockResolvedValueOnce({
      recommendedTemplate: 'consultant',
      confidence: 0.89,
      reasoning: ['Client-focused portfolio', 'Multiple case studies'],
      alternatives: [{
        template: 'modern',
        confidence: 0.75,
        reasoning: 'Professional appearance with good content structure'
      }],
      modelUsed: 'meta-llama/Llama-3.2-3B-Instruct',
      processingTime: 1600
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.recommendedTemplate).toBe('consultant');
  });
});