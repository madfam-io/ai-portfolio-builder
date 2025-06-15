import {
  SUPPORTED_MODELS,
  DEFAULT_MODEL,
  MODEL_CONFIGS,
  getModelConfig,
  isModelSupported,
  getModelsByCategory,
  getModelDescription,
  ModelCategory,
  ModelConfig
} from '@/lib/ai/huggingface/models';

describe('HuggingFace Models Configuration', () => {
  describe('SUPPORTED_MODELS', () => {
    it('should contain expected models', () => {
      expect(SUPPORTED_MODELS).toContain('meta-llama/Llama-3.1-8B-Instruct');
      expect(SUPPORTED_MODELS).toContain('microsoft/Phi-3.5-mini-instruct');
      expect(SUPPORTED_MODELS).toContain('mistralai/Mistral-7B-Instruct-v0.3');
      expect(SUPPORTED_MODELS.length).toBeGreaterThan(0);
    });

    it('should have all models in MODEL_CONFIGS', () => {
      SUPPORTED_MODELS.forEach(model => {
        expect(MODEL_CONFIGS[model]).toBeDefined();
      });
    });
  });

  describe('DEFAULT_MODEL', () => {
    it('should be a supported model', () => {
      expect(SUPPORTED_MODELS).toContain(DEFAULT_MODEL);
    });

    it('should have configuration', () => {
      expect(MODEL_CONFIGS[DEFAULT_MODEL]).toBeDefined();
    });
  });

  describe('MODEL_CONFIGS', () => {
    it('should have required fields for each model', () => {
      Object.entries(MODEL_CONFIGS).forEach(([modelId, config]) => {
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('provider');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('maxTokens');
        expect(config).toHaveProperty('category');
        expect(config).toHaveProperty('performance');
        expect(config).toHaveProperty('bestFor');
      });
    });

    it('should have valid performance ratings', () => {
      Object.values(MODEL_CONFIGS).forEach(config => {
        expect(config.performance.speed).toBeGreaterThanOrEqual(1);
        expect(config.performance.speed).toBeLessThanOrEqual(5);
        expect(config.performance.quality).toBeGreaterThanOrEqual(1);
        expect(config.performance.quality).toBeLessThanOrEqual(5);
      });
    });

    it('should have non-empty bestFor arrays', () => {
      Object.values(MODEL_CONFIGS).forEach(config => {
        expect(config.bestFor).toBeInstanceOf(Array);
        expect(config.bestFor.length).toBeGreaterThan(0);
      });
    });

    it('should have valid categories', () => {
      const validCategories: ModelCategory[] = ['general', 'fast', 'quality', 'specialized'];
      
      Object.values(MODEL_CONFIGS).forEach(config => {
        expect(validCategories).toContain(config.category);
      });
    });
  });

  describe('getModelConfig', () => {
    it('should return config for supported model', () => {
      const config = getModelConfig('meta-llama/Llama-3.1-8B-Instruct');
      
      expect(config).toBeDefined();
      expect(config?.name).toBe('Llama 3.1 8B');
      expect(config?.provider).toBe('Meta');
    });

    it('should return undefined for unsupported model', () => {
      const config = getModelConfig('unsupported/model');
      
      expect(config).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const config = getModelConfig('');
      
      expect(config).toBeUndefined();
    });
  });

  describe('isModelSupported', () => {
    it('should return true for supported models', () => {
      expect(isModelSupported('meta-llama/Llama-3.1-8B-Instruct')).toBe(true);
      expect(isModelSupported('microsoft/Phi-3.5-mini-instruct')).toBe(true);
    });

    it('should return false for unsupported models', () => {
      expect(isModelSupported('openai/gpt-4')).toBe(false);
      expect(isModelSupported('unknown/model')).toBe(false);
      expect(isModelSupported('')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isModelSupported('META-LLAMA/LLAMA-3.1-8B-INSTRUCT')).toBe(false);
    });
  });

  describe('getModelsByCategory', () => {
    it('should return models for general category', () => {
      const generalModels = getModelsByCategory('general');
      
      expect(generalModels).toBeInstanceOf(Array);
      expect(generalModels.length).toBeGreaterThan(0);
      expect(generalModels).toContain('meta-llama/Llama-3.1-8B-Instruct');
    });

    it('should return models for fast category', () => {
      const fastModels = getModelsByCategory('fast');
      
      expect(fastModels).toBeInstanceOf(Array);
      expect(fastModels.length).toBeGreaterThan(0);
      expect(fastModels).toContain('microsoft/Phi-3.5-mini-instruct');
    });

    it('should return empty array for invalid category', () => {
      const models = getModelsByCategory('invalid' as ModelCategory);
      
      expect(models).toEqual([]);
    });

    it('should not have duplicate models in results', () => {
      const categories: ModelCategory[] = ['general', 'fast', 'quality', 'specialized'];
      
      categories.forEach(category => {
        const models = getModelsByCategory(category);
        const uniqueModels = [...new Set(models)];
        expect(models.length).toBe(uniqueModels.length);
      });
    });
  });

  describe('getModelDescription', () => {
    it('should return full description for supported model', () => {
      const description = getModelDescription('meta-llama/Llama-3.1-8B-Instruct');
      
      expect(description).toContain('Llama 3.1 8B');
      expect(description).toContain('Meta');
      expect(description).toContain('High-quality');
    });

    it('should return unknown model message for unsupported model', () => {
      const description = getModelDescription('unknown/model');
      
      expect(description).toBe('Unknown model');
    });

    it('should include performance metrics in description', () => {
      const description = getModelDescription('microsoft/Phi-3.5-mini-instruct');
      
      expect(description).toContain('Speed:');
      expect(description).toContain('Quality:');
    });

    it('should include best use cases in description', () => {
      const description = getModelDescription('mistralai/Mistral-7B-Instruct-v0.3');
      
      expect(description).toContain('Best for:');
    });
  });

  describe('Model configurations integrity', () => {
    it('should have consistent token limits', () => {
      Object.values(MODEL_CONFIGS).forEach(config => {
        expect(config.maxTokens).toBeGreaterThan(0);
        expect(config.maxTokens).toBeLessThanOrEqual(32768); // Reasonable upper limit
      });
    });

    it('should have unique model names', () => {
      const names = Object.values(MODEL_CONFIGS).map(c => c.name);
      const uniqueNames = [...new Set(names)];
      
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have at least one model per category', () => {
      const categories: ModelCategory[] = ['general', 'fast', 'quality', 'specialized'];
      
      categories.forEach(category => {
        const modelsInCategory = Object.values(MODEL_CONFIGS).filter(
          config => config.category === category
        );
        expect(modelsInCategory.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Type safety', () => {
    it('should export ModelConfig type', () => {
      const testConfig: ModelConfig = {
        name: 'Test Model',
        provider: 'Test Provider',
        description: 'Test Description',
        maxTokens: 1000,
        category: 'general',
        performance: {
          speed: 5,
          quality: 5
        },
        bestFor: ['testing']
      };

      expect(testConfig).toBeDefined();
    });

    it('should export ModelCategory type', () => {
      const testCategory: ModelCategory = 'general';
      expect(testCategory).toBe('general');
    });
  });
});