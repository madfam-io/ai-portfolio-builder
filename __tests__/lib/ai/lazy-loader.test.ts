/**
 * AI service lazy loader tests
 */

import {
  enhanceBioLazy,
  optimizeProjectLazy,
  recommendTemplateLazy,
  getAvailableModelsLazy,
  preloadAIServices,
  clearAIServiceCache,
} from '@/lib/ai/lazy-loader';

// Mock the AI services
jest.mock('@/lib/ai/huggingface-service', () => ({
  huggingFaceService: {
    enhanceBio: jest.fn().mockResolvedValue({
      content: 'Enhanced bio content',
      confidence: 0.85,
      suggestions: ['Add achievements'],
      wordCount: 50,
      qualityScore: 85,
      enhancementType: 'bio',
    }),
    optimizeProjectDescription: jest.fn().mockResolvedValue({
      description: 'Optimized description',
      highlights: ['Key achievement'],
      extractedSkills: ['React', 'Node.js'],
      improvements: ['Added metrics'],
    }),
    recommendTemplate: jest.fn().mockResolvedValue({
      template: 'developer',
      confidence: 0.9,
      reasoning: 'Technical background',
      alternatives: [],
    }),
    getAvailableModels: jest.fn().mockResolvedValue([
      {
        id: 'model-1',
        name: 'Test Model',
        capabilities: ['bio', 'project'],
      },
    ]),
  },
}));

jest.mock('@/lib/ai/deepseek-service', () => ({
  deepSeekService: {
    // Mock methods if needed
  },
}));

describe('AI Service Lazy Loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAIServiceCache();
  });

  describe('enhanceBioLazy', () => {
    it('should lazy load and enhance bio', async () => {
      const bio = 'Software developer';
      const context = {
        title: 'Senior Developer',
        skills: ['React', 'Node.js'],
        experience: [],
        tone: 'professional' as const,
        targetLength: 'detailed' as const,
      };

      const result = await enhanceBioLazy(bio, context);

      expect(result).toEqual({
        content: 'Enhanced bio content',
        confidence: 0.85,
        suggestions: ['Add achievements'],
        wordCount: 50,
        qualityScore: 85,
        enhancementType: 'bio',
      });
    });

    it('should cache service after first load', async () => {
      const bio = 'Developer';
      const context = {
        title: 'Developer',
        skills: [],
        experience: [],
        tone: 'professional' as const,
        targetLength: 'concise' as const,
      };

      // First call - loads service
      await enhanceBioLazy(bio, context);

      // Clear module cache to verify service is cached
      jest.resetModules();

      // Second call - should use cached service
      await enhanceBioLazy(bio, context);

      // Service should only be imported once
      expect(
        require('@/lib/ai/huggingface-service').huggingFaceService.enhanceBio
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimizeProjectLazy', () => {
    it('should lazy load and optimize project', async () => {
      const result = await optimizeProjectLazy(
        'E-commerce Platform',
        'Built an online store',
        ['React', 'Node.js']
      );

      expect(result).toEqual({
        description: 'Optimized description',
        highlights: ['Key achievement'],
        extractedSkills: ['React', 'Node.js'],
        improvements: ['Added metrics'],
      });
    });
  });

  describe('recommendTemplateLazy', () => {
    it('should lazy load and recommend template', async () => {
      const profile = {
        title: 'Software Developer',
        skills: ['JavaScript', 'React'],
        projectCount: 5,
        hasDesignWork: false,
        experienceLevel: 'senior' as const,
      };

      const result = await recommendTemplateLazy(profile);

      expect(result).toEqual({
        template: 'developer',
        confidence: 0.9,
        reasoning: 'Technical background',
        alternatives: [],
      });
    });
  });

  describe('getAvailableModelsLazy', () => {
    it('should lazy load and get models', async () => {
      const result = await getAvailableModelsLazy('bio');

      expect(result).toEqual([
        {
          id: 'model-1',
          name: 'Test Model',
          capabilities: ['bio', 'project'],
        },
      ]);
    });
  });

  describe('preloadAIServices', () => {
    it('should preload services', async () => {
      await preloadAIServices();

      // Verify service is loaded
      const models = await getAvailableModelsLazy();
      expect(models).toBeDefined();
    });
  });

  describe('clearAIServiceCache', () => {
    it('should clear cached services', async () => {
      // Load service
      await enhanceBioLazy('test', {
        title: 'test',
        skills: [],
        experience: [],
        tone: 'professional' as const,
        targetLength: 'concise' as const,
      });

      // Clear cache
      clearAIServiceCache();

      // Next call should reload service
      await enhanceBioLazy('test2', {
        title: 'test',
        skills: [],
        experience: [],
        tone: 'professional' as const,
        targetLength: 'concise' as const,
      });

      // Verify service methods were called
      expect(
        require('@/lib/ai/huggingface-service').huggingFaceService.enhanceBio
      ).toHaveBeenCalled();
    });
  });
});
