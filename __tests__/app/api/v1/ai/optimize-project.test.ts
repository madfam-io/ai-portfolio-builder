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

jest.mock('@/lib/ai/types', () => ({
  AIServiceError: class AIServiceError extends Error {
    retryable: boolean;
    constructor(message: string, retryable = false) {
      super(message);
      this.name = 'AIServiceError';
      this.retryable = retryable;
    }
  },
  QuotaExceededError: class QuotaExceededError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'QuotaExceededError';
    }
  }
}));

// Import after mocks
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/optimize-project/route';
import { createClient } from '@/lib/supabase/server';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { logger } from '@/lib/utils/logger';

describe('POST /api/v1/ai/optimize-project', () => {
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
      optimizeProjectDescription: jest.fn().mockResolvedValue({
        enhanced: 'Optimized project description with clear STAR format',
        improvements: [
          'Added quantifiable metrics',
          'Highlighted business impact',
          'Improved technical clarity'
        ],
        modelUsed: 'meta-llama/Llama-3.2-3B-Instruct',
        processingTime: 2000
      }),
      scoreContent: jest.fn().mockResolvedValue({
        overall: 0.9,
        suggestions: ['Consider adding more metrics', 'Include team size']
      })
    };

    (createClient as jest.Mock).mockImplementation(async () => mockSupabase);
    (HuggingFaceService as jest.Mock).mockImplementation(() => mockAIService);
  });

  it('should optimize project description successfully', async () => {
    const requestData = {
      title: 'E-commerce Platform',
      description: 'Built an online shopping platform using React and Node.js',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      context: {
        projectType: 'web',
        targetAudience: 'employers',
        emphasize: 'technical'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.enhanced).toBe('Optimized project description with clear STAR format');
    expect(data.data.improvements).toHaveLength(3);
    expect(data.data.qualityScore.overall).toBe(0.9);
    expect(mockAIService.optimizeProjectDescription).toHaveBeenCalledWith(
      requestData.description,
      requestData.technologies,
      requestData.context.industry
    );
  });

  it('should require authentication', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Test description',
        technologies: ['JavaScript']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should validate required fields', async () => {
    const invalidData = {
      title: '', // Empty title
      description: 'Short', // Too short
      technologies: [] // No technologies
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: 'Project title is required'
      })
    );
  });

  it('should validate field length limits', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'x'.repeat(101), // Over 100 chars
        description: 'x'.repeat(2001), // Over 2000 chars
        technologies: ['JavaScript']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: 'Title too long'
      })
    );
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: 'Description too long'
      })
    );
  });

  it('should handle database connection failure', async () => {
    (createClient as jest.Mock).mockImplementation(async () => null);

    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Test project description',
        technologies: ['JavaScript']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database connection failed');
  });

  it('should handle AI service unavailable', async () => {
    mockAIService.healthCheck.mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Test project description',
        technologies: ['JavaScript']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('AI service temporarily unavailable');
  });

  it('should handle AI service errors', async () => {
    mockAIService.optimizeProjectDescription.mockRejectedValue(new Error('AI processing failed'));

    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Test project description',
        technologies: ['JavaScript']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle different project types', async () => {
    const projectTypes = ['web', 'mobile', 'desktop', 'api', 'ai/ml', 'other'];

    for (const projectType of projectTypes) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Project',
          description: 'Test project description',
          technologies: ['JavaScript'],
          context: { projectType }
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.optimizeProjectDescription).toHaveBeenCalledTimes(projectTypes.length);
  });

  it('should handle different target audiences', async () => {
    const audiences = ['employers', 'clients', 'collaborators'];

    for (const targetAudience of audiences) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Project',
          description: 'Test project description',
          technologies: ['JavaScript'],
          context: { targetAudience }
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.optimizeProjectDescription).toHaveBeenCalledTimes(audiences.length);
  });

  it('should handle different emphasis options', async () => {
    const emphasisOptions = ['technical', 'business', 'creative'];

    for (const emphasize of emphasisOptions) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Project',
          description: 'Test project description',
          technologies: ['JavaScript'],
          context: { emphasize }
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.optimizeProjectDescription).toHaveBeenCalledTimes(emphasisOptions.length);
  });

  it('should use default context values when not provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Test project description',
        technologies: ['JavaScript']
        // No context provided
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    expect(mockAIService.optimizeProjectDescription).toHaveBeenCalledWith(
      'Test project description',
      ['JavaScript'],
      undefined // No industry provided
    );
  });

  it('should handle multiple technologies', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Full Stack Application',
        description: 'Built a comprehensive web application',
        technologies: [
          'React', 'TypeScript', 'Node.js', 'Express',
          'PostgreSQL', 'Redis', 'Docker', 'AWS'
        ],
        context: {
          industry: 'FinTech',
          projectType: 'web',
          emphasize: 'business'
        }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockAIService.optimizeProjectDescription).toHaveBeenCalledWith(
      'Built a comprehensive web application',
      expect.arrayContaining(['React', 'TypeScript', 'Node.js']),
      'FinTech'
    );
  });
});