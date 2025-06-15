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
import { createClient } from '@/lib/supabase/server';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { logger } from '@/lib/utils/logger';

import { POST } from '@/app/api/v1/ai/enhance-bio/route';

describe('POST /api/v1/ai/enhance-bio', () => {
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
      enhanceBio: jest.fn().mockResolvedValue({
        content: 'Enhanced bio content',
        qualityScore: 0.85,
        modelUsed: 'meta-llama/Llama-3.2-1B-Instruct',
        processingTime: 1500
      })
    };

    (createClient as jest.Mock).mockImplementation(async () => mockSupabase);
    (HuggingFaceService as jest.Mock).mockImplementation(() => mockAIService);
  });

  it('should enhance bio successfully', async () => {
    const requestData = {
      bio: 'I am a software developer with 5 years of experience.',
      context: {
        title: 'Senior Software Engineer',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [{
          company: 'Tech Corp',
          position: 'Software Engineer',
          yearsExperience: 5
        }],
        tone: 'professional',
        targetLength: 'concise'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.content).toBe('Enhanced bio content');
    expect(data.data.qualityScore).toBe(0.85);
    expect(data.data.modelUsed).toBe('meta-llama/Llama-3.2-1B-Instruct');
    expect(mockAIService.enhanceBio).toHaveBeenCalledWith(
      requestData.bio,
      requestData.context
    );
  });

  it('should require authentication', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio: 'Test bio',
        context: { title: 'Developer', skills: ['JS'] }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should validate request data', async () => {
    const invalidData = {
      bio: 'Short', // Too short
      context: {
        title: '', // Empty title
        skills: [] // No skills
      }
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should handle database connection failure', async () => {
    (createClient as jest.Mock).mockImplementation(async () => null);

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio: 'Test bio content',
        context: { title: 'Developer', skills: ['JavaScript'] }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database connection failed');
  });

  it('should handle AI service unavailable', async () => {
    mockAIService.healthCheck.mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio: 'Test bio content',
        context: { title: 'Developer', skills: ['JavaScript'] }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('AI service temporarily unavailable');
  });

  it('should handle AI service errors', async () => {
    mockAIService.enhanceBio.mockRejectedValue(new Error('AI processing failed'));

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio: 'Test bio content',
        context: { title: 'Developer', skills: ['JavaScript'] }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle quota exceeded errors', async () => {
    const { QuotaExceededError } = require('@/lib/ai/types');
    
    mockAIService.enhanceBio.mockRejectedValue(
      new QuotaExceededError('Monthly quota exceeded')
    );

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio: 'Test bio content',
        context: { title: 'Developer', skills: ['JavaScript'] }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('AI service quota exceeded. Please try again later.');
  });

  it('should validate bio length limits', async () => {
    const longBio = 'x'.repeat(1001); // Over 1000 chars

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio: longBio,
        context: { title: 'Developer', skills: ['JavaScript'] }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: 'Bio too long'
      })
    );
  });

  it('should handle different tone options', async () => {
    const tones = ['professional', 'casual', 'creative'];

    for (const tone of tones) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'Test bio content',
          context: {
            title: 'Developer',
            skills: ['JavaScript'],
            tone
          }
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.enhanceBio).toHaveBeenCalledTimes(3);
  });

  it('should handle different target lengths', async () => {
    const lengths = ['concise', 'detailed', 'comprehensive'];

    for (const targetLength of lengths) {
      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'Test bio content',
          context: {
            title: 'Developer',
            skills: ['JavaScript'],
            targetLength
          }
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    expect(mockAIService.enhanceBio).toHaveBeenCalledTimes(3);
  });

  it('should include experience context when provided', async () => {
    const requestData = {
      bio: 'Experienced developer',
      context: {
        title: 'Senior Engineer',
        skills: ['JavaScript', 'Python'],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Software Engineer',
            yearsExperience: 3
          },
          {
            company: 'StartupXYZ',
            position: 'Lead Developer',
            yearsExperience: 2
          }
        ],
        industry: 'FinTech'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    expect(mockAIService.enhanceBio).toHaveBeenCalledWith(
      requestData.bio,
      expect.objectContaining({
        experience: requestData.context.experience,
        industry: 'FinTech'
      })
    );
  });
});