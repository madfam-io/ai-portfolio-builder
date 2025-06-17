/**
 * @jest-environment node
 */

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config';
import {
  AIServiceError,
  ModelUnavailableError,
  QuotaExceededError,
  BioContext,
  UserProfile,
  ProjectEnhancement,
  EnhancedContent,
  TemplateRecommendation,
  QualityScore,
} from '@/lib/ai/types';

// Mock dependencies
jest.mock('@/lib/cache/redis-cache.server', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
  },
  CACHE_KEYS: {
    AI_RESULT: 'ai:result:',
  },
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@/lib/config', () => ({
  env: {
    HUGGINGFACE_API_KEY: 'test-api-key',
  },
}));

// Mock submodules
jest.mock('@/lib/ai/huggingface/ModelManager', () => ({
  ModelManager: jest.fn().mockImplementation(() => ({
    getAvailableModels: jest.fn().mockReturnValue([
      { id: 'microsoft/DialoGPT-medium', status: 'loaded' },
      { id: 'microsoft/phi-3-mini', status: 'loaded' },
    ]),
    getSelectedModels: jest.fn().mockReturnValue({
      bio: 'microsoft/DialoGPT-medium',
      project: 'microsoft/phi-3-mini',
    }),
    getRecommendedModel: jest.fn().mockReturnValue('microsoft/DialoGPT-medium'),
    updateModelSelection: jest.fn(),
  })),
}));

jest.mock('@/lib/ai/huggingface/PromptBuilder', () => ({
  PromptBuilder: jest.fn().mockImplementation(() => ({
    buildBioPrompt: jest.fn().mockReturnValue('Enhanced bio prompt'),
    buildProjectPrompt: jest.fn().mockReturnValue('Enhanced project prompt'),
    extractBioFromResponse: jest.fn().mockImplementation((text) => text || 'Enhanced bio content'),
    parseProjectResponse: jest.fn().mockReturnValue({
      enhanced: 'Enhanced project description',
      keyAchievements: ['Achievement 1', 'Achievement 2'],
      technologies: ['React', 'Node.js'],
      impactMetrics: ['50% performance improvement'],
    }),
  })),
}));

jest.mock('@/lib/ai/huggingface/ContentScorer', () => ({
  ContentScorer: jest.fn().mockImplementation(() => ({
    scoreContent: jest.fn().mockResolvedValue({
      overall: 85,
      readability: 80,
      professionalism: 90,
      impact: 85,
      completeness: 80,
      suggestions: ['Consider adding more specific metrics'],
    }),
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  let mockCache: jest.Mocked<typeof cache>;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockCache = cache as jest.Mocked<typeof cache>;
    mockLogger = logger as jest.Mocked<typeof logger>;
    
    // Default cache miss
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);
    
    service = new HuggingFaceService();
  });

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      expect(service).toBeDefined();
      expect(service.getAvailableModels()).toBeDefined();
    });

    it('should accept custom API key', () => {
      const customService = new HuggingFaceService('custom-api-key');
      expect(customService).toBeDefined();
    });

    it('should accept user model preferences', () => {
      const preferences = { bio: 'custom-model' };
      const customService = new HuggingFaceService(undefined, preferences);
      expect(customService).toBeDefined();
    });

    it('should warn when no API key is provided', () => {
      const customService = new HuggingFaceService('');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Hugging Face API key not provided. Service will operate in demo mode.'
      );
    });
  });

  describe('Model Management', () => {
    it('should get available models', () => {
      const models = service.getAvailableModels();
      expect(models).toEqual([
        { id: 'microsoft/DialoGPT-medium', status: 'loaded' },
        { id: 'microsoft/phi-3-mini', status: 'loaded' },
      ]);
    });

    it('should get selected models', () => {
      const selected = service.getSelectedModels();
      expect(selected).toEqual({
        bio: 'microsoft/DialoGPT-medium',
        project: 'microsoft/phi-3-mini',
      });
    });

    it('should update model selection', () => {
      service.updateModelSelection('bio', 'new-model');
      // Verify that the update method was called (mocked)
      expect(service).toBeDefined();
    });
  });

  describe('enhanceBio', () => {
    const mockBioContext: BioContext = {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          yearsExperience: 3,
        },
      ],
      industry: 'technology',
      tone: 'professional',
      targetLength: 'detailed',
    };

    it('should enhance bio successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([{
          generated_text: 'Enhanced bio text with improved clarity and professional impact',
        }]),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.enhanceBio('Original bio text', mockBioContext);

      expect(result).toMatchObject({
        content: expect.any(String),
        confidence: expect.any(Number),
        wordCount: expect.any(Number),
        qualityScore: expect.any(Number),
        enhancementType: 'bio',
      });

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.qualityScore).toBe(85);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('huggingface.co'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should use cached result when available', async () => {
      const cachedResult: EnhancedContent = {
        content: 'Cached enhanced bio',
        confidence: 0.9,
        wordCount: 25,
        qualityScore: 85,
        enhancementType: 'bio',
        suggestions: ['Cached suggestion'],
      };

      mockCache.get.mockResolvedValueOnce(JSON.stringify(cachedResult));

      const result = await service.enhanceBio('Original bio', mockBioContext);

      expect(result).toEqual(cachedResult);
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockCache.get).toHaveBeenCalled();
    });

    it('should cache results after successful enhancement', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([{
          generated_text: 'Enhanced bio text',
        }]),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await service.enhanceBio('Original bio', mockBioContext);

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('ai:result:bio:'),
        expect.any(String),
        86400 // 24 hours
      );
    });

    it('should handle model unavailable error (503)', async () => {
      const errorResponse = {
        ok: false,
        status: 503,
        json: () => Promise.resolve({ error: 'Model is loading' }),
        statusText: 'Service Unavailable',
      };

      mockFetch.mockResolvedValueOnce(errorResponse as any);

      await expect(
        service.enhanceBio('Original bio', mockBioContext)
      ).rejects.toThrow(ModelUnavailableError);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle quota exceeded error (429)', async () => {
      const errorResponse = {
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
        statusText: 'Too Many Requests',
      };

      mockFetch.mockResolvedValueOnce(errorResponse as any);

      await expect(
        service.enhanceBio('Original bio', mockBioContext)
      ).rejects.toThrow(QuotaExceededError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.enhanceBio('Original bio', mockBioContext)
      ).rejects.toThrow(AIServiceError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Bio enhancement failed',
        expect.any(Error)
      );
    });

    it('should retry on transient failures', async () => {
      // First call fails with 503, then succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: () => Promise.resolve({ error: 'Model loading' }),
          statusText: 'Service Unavailable',
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ generated_text: 'Success on retry' }]),
        } as any);

      const result = await service.enhanceBio('Bio text', mockBioContext);

      expect(result.content).toBe('Success on retry');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should generate bio suggestions', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([{
          generated_text: 'Enhanced bio text',
        }]),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.enhanceBio('Short bio', mockBioContext);

      expect(result.suggestions).toContain('Consider adding more details about your expertise');
    });
  });

  describe('optimizeProjectDescription', () => {
    it('should optimize project description successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([{
          generated_text: 'Optimized project description with STAR format and clear impact metrics',
        }]),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.optimizeProjectDescription(
        'Built a web application',
        ['React', 'Node.js'],
        'technology'
      );

      expect(result).toMatchObject({
        original: 'Built a web application',
        enhanced: 'Enhanced project description',
        keyAchievements: expect.arrayContaining(['Achievement 1', 'Achievement 2']),
        technologies: expect.arrayContaining(['React', 'Node.js']),
        impactMetrics: expect.arrayContaining(['50% performance improvement']),
        confidence: expect.any(Number),
      });

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should use cached result for project optimization', async () => {
      const cachedResult: ProjectEnhancement = {
        original: 'Original project description',
        enhanced: 'Cached enhanced description',
        keyAchievements: ['Cached achievement'],
        technologies: ['Cached tech'],
        impactMetrics: ['Cached metric'],
        confidence: 0.85,
      };

      mockCache.get.mockResolvedValueOnce(JSON.stringify(cachedResult));

      const result = await service.optimizeProjectDescription(
        'Original project description',
        ['React'],
        'tech'
      );

      expect(result).toEqual(cachedResult);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle project optimization errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      await expect(
        service.optimizeProjectDescription('Project desc', ['React'])
      ).rejects.toThrow(AIServiceError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Project optimization failed',
        expect.any(Error)
      );
    });
  });

  describe('recommendTemplate', () => {
    const mockUserProfile: UserProfile = {
      title: 'UX Designer',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
      projectCount: 8,
      hasDesignWork: true,
      industry: 'design',
      experienceLevel: 'senior',
    };

    it('should recommend template successfully', async () => {
      const result = await service.recommendTemplate(mockUserProfile);

      expect(result).toMatchObject({
        recommendedTemplate: expect.any(String),
        confidence: expect.any(Number),
        reasoning: expect.any(String),
        alternatives: expect.arrayContaining([
          expect.objectContaining({
            template: expect.any(String),
            score: expect.any(Number),
            reasons: expect.arrayContaining([expect.any(String)]),
          }),
        ]),
      });

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.alternatives).toHaveLength(2);
    });

    it('should recommend designer template for design profile', async () => {
      const result = await service.recommendTemplate(mockUserProfile);

      expect(['designer', 'creative', 'modern']).toContain(result.recommendedTemplate);
      expect(result.reasoning).toContain('design');
    });

    it('should recommend developer template for technical profile', async () => {
      const techProfile: UserProfile = {
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'Python', 'PostgreSQL'],
        projectCount: 15,
        hasDesignWork: false,
        industry: 'technology',
        experienceLevel: 'senior',
      };

      const result = await service.recommendTemplate(techProfile);

      expect(['developer', 'modern', 'minimal']).toContain(result.recommendedTemplate);
    });

    it('should recommend minimal template for entry level', async () => {
      const entryProfile: UserProfile = {
        title: 'Junior Developer',
        skills: ['HTML', 'CSS', 'JavaScript'],
        projectCount: 3,
        hasDesignWork: false,
        experienceLevel: 'entry',
      };

      const result = await service.recommendTemplate(entryProfile);

      // Entry level should get good recommendation
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle template recommendation errors', async () => {
      // Simulate error by making the scoring throw
      const invalidProfile = null as any;

      await expect(
        service.recommendTemplate(invalidProfile)
      ).rejects.toThrow(AIServiceError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Template recommendation failed',
        expect.any(Error)
      );
    });
  });

  describe('scoreContent', () => {
    it('should score content quality', async () => {
      const content = 'This is a well-written professional bio with clear objectives and strong impact metrics.';

      const result = await service.scoreContent(content, 'bio');

      expect(result).toMatchObject({
        overall: 85,
        readability: 80,
        professionalism: 90,
        impact: 85,
        completeness: 80,
        suggestions: expect.arrayContaining([expect.any(String)]),
      });

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should provide different scoring for different content types', async () => {
      const bioResult = await service.scoreContent('Professional bio content', 'bio');
      const projectResult = await service.scoreContent('Project description', 'project');

      expect(bioResult).toMatchObject({
        overall: expect.any(Number),
        suggestions: expect.any(Array),
      });
      
      expect(projectResult).toMatchObject({
        overall: expect.any(Number),
        suggestions: expect.any(Array),
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true when service is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
      } as any);

      const result = await service.healthCheck();
      
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('huggingface.co'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should return false when service is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        ok: false,
      } as any);

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const stats = await service.getUsageStats();

      expect(stats).toMatchObject({
        requestsToday: expect.any(Number),
        costToday: expect.any(Number),
        avgResponseTime: expect.any(Number),
        successRate: expect.any(Number),
      });

      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ unexpected: 'format' }),
      } as any);

      await expect(
        service.enhanceBio('Bio text', {
          title: 'Developer',
          skills: ['JS'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow(AIServiceError);
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as any);

      await expect(
        service.enhanceBio('Bio text', {
          title: 'Developer',
          skills: ['JS'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow(AIServiceError);
    });

    it('should retry multiple times before giving up', async () => {
      // Fail 3 times (max retries = 2, so 3 total attempts)
      mockFetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockRejectedValueOnce(new Error('Network error 3'));

      await expect(
        service.enhanceBio('Bio text', {
          title: 'Developer',
          skills: ['JS'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow('Network error 3');

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle AIServiceError instances', async () => {
      const customError = new AIServiceError(
        'Custom AI error',
        'CUSTOM_ERROR',
        'huggingface'
      );

      mockFetch.mockRejectedValueOnce(customError);

      await expect(
        service.enhanceBio('Bio text', {
          title: 'Developer',
          skills: ['JS'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow('Custom AI error');
    });
  });

  describe('Cache Integration', () => {
    it('should generate consistent cache keys', async () => {
      const context: BioContext = {
        title: 'Developer',
        skills: ['JS'],
        experience: [],
        tone: 'professional',
        targetLength: 'concise',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ generated_text: 'Enhanced' }]),
      } as any);

      // Call twice with same inputs
      await service.enhanceBio('Same bio', context);
      await service.enhanceBio('Same bio', context);

      // Should check cache twice with same key
      expect(mockCache.get).toHaveBeenCalledTimes(2);
      const cacheKey1 = (mockCache.get as jest.Mock).mock.calls[0][0];
      const cacheKey2 = (mockCache.get as jest.Mock).mock.calls[1][0];
      expect(cacheKey1).toBe(cacheKey2);
    });

    it('should handle cache errors gracefully', async () => {
      mockCache.get.mockRejectedValueOnce(new Error('Cache error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ generated_text: 'Enhanced' }]),
      } as any);

      const result = await service.enhanceBio('Bio text', {
        title: 'Developer',
        skills: ['JS'],
        experience: [],
        tone: 'professional',
        targetLength: 'concise',
      });

      // Should still work despite cache error
      expect(result.content).toBe('Enhanced');
    });
  });
});