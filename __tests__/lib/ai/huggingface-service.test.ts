import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { cache } from '@/lib/cache/redis-cache.server';
import {
  AIServiceError,
  ModelUnavailableError,
  QuotaExceededError,
} from '@/lib/ai/types';

// Mock dependencies
jest.mock('@/lib/cache/redis-cache.server');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/config', () => ({
  env: {
    HUGGINGFACE_API_KEY: 'test-api-key',
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    service = new HuggingFaceService();
    
    // Mock cache methods
    (cache.get as jest.Mock).mockResolvedValue(null);
    (cache.set as jest.Mock).mockResolvedValue(undefined);
  });

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      const service = new HuggingFaceService();
      expect(service).toBeDefined();
    });

    it('should accept custom API key', () => {
      const service = new HuggingFaceService('custom-api-key');
      expect(service).toBeDefined();
    });

    it('should accept user model preferences', () => {
      const preferences = { bioEnhancement: 'custom-model' };
      const service = new HuggingFaceService(undefined, preferences);
      expect(service).toBeDefined();
    });
  });

  describe('enhanceBio', () => {
    const mockBioContext = {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'senior' as const,
    };

    it('should enhance bio successfully', async () => {
      const mockResponse = {
        generated_text: 'Enhanced bio text with improved clarity and impact',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockResponse]),
      } as Response);

      const result = await service.enhanceBio('Original bio', mockBioContext);

      expect(result).toEqual({
        enhancedContent: expect.any(String),
        originalContent: 'Original bio',
        confidence: expect.any(Number),
        improvements: expect.arrayContaining([expect.any(String)]),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('huggingface.co'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should use cached result when available', async () => {
      const cachedResult = {
        enhancedContent: 'Cached enhanced bio',
        originalContent: 'Original bio',
        confidence: 0.9,
        improvements: ['Cached improvement'],
      };

      (cache.get as jest.Mock).mockResolvedValueOnce(cachedResult);

      const result = await service.enhanceBio('Original bio', mockBioContext);

      expect(result).toEqual(cachedResult);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle model unavailable error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ error: 'Model is loading' }),
      } as Response);

      await expect(
        service.enhanceBio('Original bio', mockBioContext)
      ).rejects.toThrow(ModelUnavailableError);
    });

    it('should handle quota exceeded error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      } as Response);

      await expect(
        service.enhanceBio('Original bio', mockBioContext)
      ).rejects.toThrow(QuotaExceededError);
    });

    it('should handle empty bio input', async () => {
      await expect(
        service.enhanceBio('', mockBioContext)
      ).rejects.toThrow('Bio cannot be empty');
    });
  });

  describe('optimizeProjectDescription', () => {
    it('should optimize project description successfully', async () => {
      const mockResponse = {
        generated_text: 'Optimized project description with STAR format',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockResponse]),
      } as Response);

      const result = await service.optimizeProjectDescription(
        'Built a web app',
        ['React', 'Node.js'],
        'technology'
      );

      expect(result).toEqual({
        enhancedDescription: expect.any(String),
        highlights: expect.arrayContaining([expect.any(String)]),
        extractedSkills: expect.arrayContaining([expect.any(String)]),
        confidence: expect.any(Number),
      });
    });

    it('should extract skills from technologies', async () => {
      const mockResponse = {
        generated_text: 'Developed scalable microservices architecture using Node.js',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockResponse]),
      } as Response);

      const result = await service.optimizeProjectDescription(
        'Created backend services',
        ['Node.js', 'MongoDB', 'Redis'],
        'fintech'
      );

      expect(result.extractedSkills).toContain('Node.js');
      expect(result.extractedSkills.length).toBeGreaterThan(0);
    });
  });

  describe('recommendTemplate', () => {
    const mockUserProfile: UserProfile = {
      title: 'UX Designer',
      skills: ['Figma', 'Sketch', 'Adobe XD'],
      projectCount: 10,
      hasDesignWork: true,
      experienceLevel: 'senior',
    };

    it('should recommend template successfully', async () => {
      const mockResponse = {
        generated_text: 'designer',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockResponse]),
      } as Response);

      const result = await service.recommendTemplate(mockUserProfile);

      expect(result).toEqual({
        recommendedTemplate: expect.stringMatching(/designer|creative|modern/),
        confidence: expect.any(Number),
        reasoning: expect.any(String),
        alternatives: expect.arrayContaining([
          expect.objectContaining({
            template: expect.any(String),
            score: expect.any(Number),
          }),
        ]),
      });
    });

    it('should recommend developer template for technical profiles', async () => {
      const techProfile: UserProfile = {
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'Python'],
        projectCount: 15,
        hasDesignWork: false,
        experienceLevel: 'senior',
      };

      const mockResponse = {
        generated_text: 'developer',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockResponse]),
      } as Response);

      const result = await service.recommendTemplate(techProfile);

      expect(['developer', 'modern', 'minimal']).toContain(result.recommendedTemplate);
    });
  });

  describe('scoreContent', () => {
    it('should score content quality', async () => {
      const content = 'This is a well-written professional bio with clear objectives.';

      const result = await service.scoreContent(content, 'bio');

      expect(result).toEqual({
        score: expect.any(Number),
        feedback: expect.arrayContaining([expect.any(String)]),
        strengths: expect.arrayContaining([expect.any(String)]),
        improvements: expect.arrayContaining([expect.any(String)]),
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should provide different scoring for different content types', async () => {
      const bioScore = await service.scoreContent('Short bio', 'bio');
      const projectScore = await service.scoreContent('Short project', 'project');

      expect(bioScore.feedback).not.toEqual(projectScore.feedback);
    });
  });

  describe('healthCheck', () => {
    it('should return true when service is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      } as Response);

      const result = await service.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when service is unhealthy', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should retry on transient failures', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ generated_text: 'Success' }]),
        } as Response);

      const result = await service.enhanceBio('Bio', {
        title: 'Developer',
        skills: ['JS'],
        experienceLevel: 'mid',
      });

      expect(result.enhancedContent).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ unexpected: 'format' }),
      } as Response);

      await expect(
        service.enhanceBio('Bio', {
          title: 'Developer',
          skills: ['JS'],
          experienceLevel: 'mid',
        })
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('demo mode', () => {
    it('should work in demo mode without API key', async () => {
      const demoService = new HuggingFaceService('');

      // Mock responses should be generated
      const result = await demoService.enhanceBio('Demo bio', {
        title: 'Developer',
        skills: ['JavaScript'],
        experienceLevel: 'mid',
      });

      expect(result.enhancedContent).toBeDefined();
      expect(result.confidence).toBeLessThan(1); // Demo mode has lower confidence
    });
  });
});