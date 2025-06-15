/**
 * @jest-environment node
 */

// Mock dependencies first
jest.mock('@/lib/cache/redis-cache.server', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  },
  CACHE_KEYS: {
    AI_RESULT: 'ai:result:'
  }
}));

jest.mock('@/lib/config', () => ({
  env: {
    HUGGINGFACE_API_KEY: 'test-api-key'
  }
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('@/lib/ai/huggingface/ModelManager');
jest.mock('@/lib/ai/huggingface/PromptBuilder');
jest.mock('@/lib/ai/huggingface/ContentScorer');

// Import after mocks
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';
import { ModelManager } from '@/lib/ai/huggingface/ModelManager';
import { PromptBuilder } from '@/lib/ai/huggingface/PromptBuilder';
import { ContentScorer } from '@/lib/ai/huggingface/ContentScorer';
import {
  BioContext,
  AIServiceError,
  ModelUnavailableError,
  QuotaExceededError
} from '@/lib/ai/types';

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;
  let mockModelManager: any;
  let mockPromptBuilder: any;
  let mockContentScorer: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockModelManager = {
      getAvailableModels: jest.fn(),
      getSelectedModels: jest.fn(),
      updateModelSelection: jest.fn(),
      selectModel: jest.fn()
    };

    mockPromptBuilder = {
      buildBioEnhancementPrompt: jest.fn(),
      buildProjectOptimizationPrompt: jest.fn(),
      buildTemplateRecommendationPrompt: jest.fn()
    };

    mockContentScorer = {
      scoreContent: jest.fn()
    };

    (ModelManager as jest.Mock).mockImplementation(() => mockModelManager);
    (PromptBuilder as jest.Mock).mockImplementation(() => mockPromptBuilder);
    (ContentScorer as jest.Mock).mockImplementation(() => mockContentScorer);

    service = new HuggingFaceService();
  });

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      expect(ModelManager).toHaveBeenCalled();
      expect(PromptBuilder).toHaveBeenCalled();
      expect(ContentScorer).toHaveBeenCalled();
    });

    it('should warn when no API key is provided', () => {
      jest.clearAllMocks();
      const { env } = require('@/lib/config');
      env.HUGGINGFACE_API_KEY = '';
      
      new HuggingFaceService();
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Hugging Face API key not provided. Service will operate in demo mode.'
      );
    });

    it('should accept custom API key and model preferences', () => {
      const customApiKey = 'custom-key';
      const preferences = { bioEnhancement: 'custom-model' };
      
      new HuggingFaceService(customApiKey, preferences);
      
      expect(ModelManager).toHaveBeenCalledWith(preferences);
    });
  });

  describe('getAvailableModels', () => {
    it('should return available models from ModelManager', async () => {
      const mockModels = [
        { id: 'model1', name: 'Model 1' },
        { id: 'model2', name: 'Model 2' }
      ];
      mockModelManager.getAvailableModels.mockResolvedValue(mockModels);

      const models = await service.getAvailableModels();

      expect(models).toEqual(mockModels);
      expect(mockModelManager.getAvailableModels).toHaveBeenCalled();
    });
  });

  describe('getSelectedModels', () => {
    it('should return selected models from ModelManager', () => {
      const mockSelection = {
        bioEnhancement: 'model1',
        projectOptimization: 'model2'
      };
      mockModelManager.getSelectedModels.mockReturnValue(mockSelection);

      const selection = service.getSelectedModels();

      expect(selection).toEqual(mockSelection);
      expect(mockModelManager.getSelectedModels).toHaveBeenCalled();
    });
  });

  describe('updateModelSelection', () => {
    it('should update model selection through ModelManager', () => {
      service.updateModelSelection('bioEnhancement', 'new-model');

      expect(mockModelManager.updateModelSelection).toHaveBeenCalledWith(
        'bioEnhancement',
        'new-model'
      );
    });
  });

  describe('enhanceBio', () => {
    const mockBio = 'I am a software developer';
    const mockContext: BioContext = {
      title: 'Senior Developer',
      skills: ['JavaScript', 'React'],
      tone: 'professional',
      targetLength: 'concise'
    };

    it('should return cached result if available', async () => {
      const cachedResult = {
        content: 'Enhanced bio content',
        qualityScore: 0.9
      };
      (cache.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedResult));

      const result = await service.enhanceBio(mockBio, mockContext);

      expect(result).toEqual(cachedResult);
      expect(cache.get).toHaveBeenCalled();
    });

    it('should enhance bio when not cached', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildBioEnhancementPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          generated_text: 'Enhanced bio content'
        })
      });

      mockContentScorer.scoreContent.mockResolvedValue({
        overall: 0.85,
        criteria: {
          clarity: 0.9,
          relevance: 0.8
        }
      });

      const result = await service.enhanceBio(mockBio, mockContext);

      expect(result).toEqual({
        content: 'Enhanced bio content',
        qualityScore: 0.85,
        confidence: 1,
        modelUsed: 'test-model',
        processingTime: expect.any(Number)
      });

      expect(cache.set).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildBioEnhancementPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      await expect(service.enhanceBio(mockBio, mockContext)).rejects.toThrow(
        ModelUnavailableError
      );
    });

    it('should handle quota exceeded errors', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildBioEnhancementPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(service.enhanceBio(mockBio, mockContext)).rejects.toThrow(
        QuotaExceededError
      );
    });

    it('should log errors when enhancement fails', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockRejectedValue(new Error('Model selection failed'));

      await expect(service.enhanceBio(mockBio, mockContext)).rejects.toThrow();
      
      expect(logger.error).toHaveBeenCalledWith(
        'Bio enhancement failed:',
        expect.any(Error)
      );
    });
  });

  describe('optimizeProjectDescription', () => {
    const mockDescription = 'Built a web app';
    const mockTechnologies = ['React', 'Node.js'];
    const mockIndustry = 'Technology';

    it('should optimize project description', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildProjectOptimizationPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          generated_text: 'Optimized project description'
        })
      });

      const result = await service.optimizeProjectDescription(
        mockDescription,
        mockTechnologies,
        mockIndustry
      );

      expect(result).toEqual({
        enhanced: 'Optimized project description',
        improvements: expect.any(Array),
        modelUsed: 'test-model',
        processingTime: expect.any(Number)
      });

      expect(mockPromptBuilder.buildProjectOptimizationPrompt).toHaveBeenCalledWith(
        mockDescription,
        mockTechnologies,
        mockIndustry
      );
    });

    it('should cache optimization results', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildProjectOptimizationPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          generated_text: 'Optimized description'
        })
      });

      await service.optimizeProjectDescription(
        mockDescription,
        mockTechnologies,
        mockIndustry
      );

      expect(cache.set).toHaveBeenCalledWith(
        expect.stringContaining('ai:result:project:'),
        expect.any(String),
        3600 // 1 hour TTL
      );
    });
  });

  describe('recommendTemplate', () => {
    const mockProfile = {
      title: 'Software Developer',
      skills: ['JavaScript', 'Python'],
      projectCount: 5,
      hasDesignWork: false,
      experienceLevel: 'mid' as const
    };

    it('should recommend template based on profile', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildTemplateRecommendationPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          generated_text: JSON.stringify({
            template: 'developer',
            confidence: 0.9,
            reasoning: 'Technical background'
          })
        })
      });

      const result = await service.recommendTemplate(mockProfile);

      expect(result).toEqual({
        recommendedTemplate: 'developer',
        confidence: 0.9,
        reasoning: ['Technical background'],
        alternatives: expect.any(Array),
        modelUsed: 'test-model',
        processingTime: expect.any(Number)
      });
    });

    it('should handle invalid JSON response', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      
      mockModelManager.selectModel.mockResolvedValue({
        modelId: 'test-model',
        endpoint: 'https://api.example.com/test-model'
      });

      mockPromptBuilder.buildTemplateRecommendationPrompt.mockReturnValue({
        system: 'System prompt',
        user: 'User prompt'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          generated_text: 'Not valid JSON'
        })
      });

      const result = await service.recommendTemplate(mockProfile);

      // Should fall back to default recommendation
      expect(result.recommendedTemplate).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('scoreContent', () => {
    it('should score content using ContentScorer', async () => {
      const mockContent = 'Sample content to score';
      const mockType = 'bio';
      const mockScore = {
        overall: 0.8,
        criteria: {
          clarity: 0.85,
          relevance: 0.75
        },
        suggestions: ['Add more details']
      };

      mockContentScorer.scoreContent.mockResolvedValue(mockScore);

      const result = await service.scoreContent(mockContent, mockType);

      expect(result).toEqual(mockScore);
      expect(mockContentScorer.scoreContent).toHaveBeenCalledWith(
        mockContent,
        mockType
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true when service is healthy', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'ok' })
      });

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should return false when service is unhealthy', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Health check failed:',
        expect.any(Error)
      );
    });
  });
});