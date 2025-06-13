import { renderHook, act } from '@testing-library/react';

import { useAIStore } from '@/lib/store/ai-store';

/**
 * Tests for AI Store
 * Testing Zustand state management for AI preferences and history
 */

describe('AI Store', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useAIStore());
    act(() => {
      result.current.clearHistory();
      result.current.resetModelPreferences();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAIStore());

      expect(result.current.modelPreferences).toEqual({
        bioModel: 'meta-llama/Llama-3.1-8B-Instruct',
        projectModel: 'microsoft/Phi-3.5-mini-instruct',
        templateModel: 'meta-llama/Llama-3.1-8B-Instruct',
        tone: 'professional',
        targetLength: 'concise',
        autoEnhance: false,
      });
      expect(result.current.enhancementHistory).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.currentEnhancement).toBeNull();
      expect(result.current.usageStats).toEqual({
        bioEnhancements: 0,
        projectOptimizations: 0,
        templateRecommendations: 0,
        totalCost: 0,
      });
    });
  });

  describe('Model Selection', () => {
    it('should update bio model preference', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.setBioModel('mistralai/Mistral-7B-Instruct-v0.3');
      });

      expect(result.current.modelPreferences.bioModel).toBe(
        'mistralai/Mistral-7B-Instruct-v0.3'
      );
    });

    it('should update project model preference', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.setProjectModel(
          'deepseek-ai/deepseek-coder-6.7b-instruct'
        );
      });

      expect(result.current.modelPreferences.projectModel).toBe(
        'deepseek-ai/deepseek-coder-6.7b-instruct'
      );
    });

    it('should update template model preference', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.setTemplateModel('mistralai/Mistral-7B-Instruct-v0.3');
      });

      expect(result.current.modelPreferences.templateModel).toBe(
        'mistralai/Mistral-7B-Instruct-v0.3'
      );
    });
  });

  describe('Preferences', () => {
    it('should update tone preference', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.setTone('casual');
      });

      expect(result.current.modelPreferences.tone).toBe('casual');

      act(() => {
        result.current.setTone('formal');
      });

      expect(result.current.modelPreferences.tone).toBe('formal');
    });

    it('should update target length preference', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.setTargetLength('detailed');
      });

      expect(result.current.modelPreferences.targetLength).toBe('detailed');

      act(() => {
        result.current.setTargetLength('brief');
      });

      expect(result.current.modelPreferences.targetLength).toBe('brief');
    });

    it('should toggle auto enhance', () => {
      const { result } = renderHook(() => useAIStore());

      expect(result.current.modelPreferences.autoEnhance).toBe(false);

      act(() => {
        result.current.toggleAutoEnhance();
      });

      expect(result.current.modelPreferences.autoEnhance).toBe(true);

      act(() => {
        result.current.toggleAutoEnhance();
      });

      expect(result.current.modelPreferences.autoEnhance).toBe(false);
    });

    it('should update all preferences at once', () => {
      const { result } = renderHook(() => useAIStore());

      const newPreferences = {
        bioModel: 'new-model',
        projectModel: 'new-project-model',
        templateModel: 'new-template-model',
        tone: 'creative' as const,
        targetLength: 'comprehensive' as const,
        autoEnhance: true,
      };

      act(() => {
        result.current.updatePreferences(newPreferences);
      });

      expect(result.current.modelPreferences).toEqual(newPreferences);
    });

    it('should reset preferences to defaults', () => {
      const { result } = renderHook(() => useAIStore());

      // Change preferences
      act(() => {
        result.current.setTone('casual');
        result.current.toggleAutoEnhance();
      });

      expect(result.current.modelPreferences.tone).toBe('casual');
      expect(result.current.modelPreferences.autoEnhance).toBe(true);

      // Reset
      act(() => {
        result.current.resetModelPreferences();
      });

      expect(result.current.modelPreferences.tone).toBe('professional');
      expect(result.current.modelPreferences.autoEnhance).toBe(false);
    });
  });

  describe('History Management', () => {
    it('should add bio enhancement to history', () => {
      const { result } = renderHook(() => useAIStore());

      const enhancement = {
        id: '1',
        type: 'bio' as const,
        input: 'I am a developer',
        output:
          'Experienced software developer with expertise in full-stack development',
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        timestamp: new Date(),
        score: 85,
      };

      act(() => {
        result.current.addToHistory(enhancement);
      });

      expect(result.current.enhancementHistory).toHaveLength(1);
      expect(result.current.enhancementHistory[0]).toEqual(enhancement);
    });

    it('should add multiple items to history', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.addToHistory({
          id: '1',
          type: 'bio',
          input: 'Bio 1',
          output: 'Enhanced Bio 1',
          model: 'model1',
          timestamp: new Date(),
          score: 80,
        });

        result.current.addToHistory({
          id: '2',
          type: 'project',
          input: 'Project 1',
          output: 'Enhanced Project 1',
          model: 'model2',
          timestamp: new Date(),
          score: 90,
        });
      });

      expect(result.current.enhancementHistory).toHaveLength(2);
    });

    it('should remove item from history', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.addToHistory({
          id: '1',
          type: 'bio',
          input: 'Bio 1',
          output: 'Enhanced Bio 1',
          model: 'model1',
          timestamp: new Date(),
          score: 80,
        });

        result.current.addToHistory({
          id: '2',
          type: 'project',
          input: 'Project 1',
          output: 'Enhanced Project 1',
          model: 'model2',
          timestamp: new Date(),
          score: 90,
        });
      });

      expect(result.current.enhancementHistory).toHaveLength(2);

      act(() => {
        result.current.removeFromHistory('1');
      });

      expect(result.current.enhancementHistory).toHaveLength(1);
      expect(result.current.enhancementHistory[0].id).toBe('2');
    });

    it('should clear all history', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.addToHistory({
          id: '1',
          type: 'bio',
          input: 'Bio 1',
          output: 'Enhanced Bio 1',
          model: 'model1',
          timestamp: new Date(),
          score: 80,
        });

        result.current.addToHistory({
          id: '2',
          type: 'project',
          input: 'Project 1',
          output: 'Enhanced Project 1',
          model: 'model2',
          timestamp: new Date(),
          score: 90,
        });
      });

      expect(result.current.enhancementHistory).toHaveLength(2);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.enhancementHistory).toEqual([]);
    });

    it('should get history by type', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.addToHistory({
          id: '1',
          type: 'bio',
          input: 'Bio 1',
          output: 'Enhanced Bio 1',
          model: 'model1',
          timestamp: new Date(),
          score: 80,
        });

        result.current.addToHistory({
          id: '2',
          type: 'project',
          input: 'Project 1',
          output: 'Enhanced Project 1',
          model: 'model2',
          timestamp: new Date(),
          score: 90,
        });

        result.current.addToHistory({
          id: '3',
          type: 'bio',
          input: 'Bio 2',
          output: 'Enhanced Bio 2',
          model: 'model1',
          timestamp: new Date(),
          score: 85,
        });
      });

      const bioHistory = result.current.getHistoryByType('bio');
      expect(bioHistory).toHaveLength(2);
      expect(bioHistory.every(h => h.type === 'bio')).toBe(true);

      const projectHistory = result.current.getHistoryByType('project');
      expect(projectHistory).toHaveLength(1);
      expect(projectHistory[0].type).toBe('project');
    });
  });

  describe('Processing State', () => {
    it('should set processing state', () => {
      const { result } = renderHook(() => useAIStore());

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        result.current.setProcessing(true);
      });

      expect(result.current.isProcessing).toBe(true);

      act(() => {
        result.current.setProcessing(false);
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should set current task', () => {
      const { result } = renderHook(() => useAIStore());

      expect(result.current.currentEnhancement).toBeNull();

      act(() => {
        result.current.setCurrentTask('Enhancing bio...');
      });

      expect(result.current.currentEnhancement).toBe('Enhancing bio...');

      act(() => {
        result.current.setCurrentTask(null);
      });

      expect(result.current.currentEnhancement).toBeNull();
    });
  });

  describe('Usage Tracking', () => {
    it('should track bio enhancement usage', () => {
      const { result } = renderHook(() => useAIStore());

      expect(result.current.usageStats.bioEnhancements).toBe(0);

      act(() => {
        result.current.incrementUsage('bioEnhancements', 0.001);
      });

      expect(result.current.usageStats.bioEnhancements).toBe(1);
      expect(result.current.usageStats.totalCost).toBe(0.001);
    });

    it('should track project optimization usage', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.incrementUsage('projectOptimizations', 0.002);
      });

      expect(result.current.usageStats.projectOptimizations).toBe(1);
      expect(result.current.usageStats.totalCost).toBe(0.002);
    });

    it('should track template recommendation usage', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.incrementUsage('templateRecommendations', 0.0005);
      });

      expect(result.current.usageStats.templateRecommendations).toBe(1);
      expect(result.current.usageStats.totalCost).toBe(0.0005);
    });

    it('should accumulate total cost', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.incrementUsage('bioEnhancements', 0.001);
        result.current.incrementUsage('projectOptimizations', 0.002);
        result.current.incrementUsage('templateRecommendations', 0.0005);
      });

      expect(result.current.usageStats.totalCost).toBe(0.0035);
      expect(result.current.usageStats.bioEnhancements).toBe(1);
      expect(result.current.usageStats.projectOptimizations).toBe(1);
      expect(result.current.usageStats.templateRecommendations).toBe(1);
    });

    it('should reset usage stats', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.incrementUsage('bioEnhancements', 0.001);
        result.current.incrementUsage('projectOptimizations', 0.002);
      });

      expect(result.current.usageStats.totalCost).toBeGreaterThan(0);

      act(() => {
        result.current.resetUsage();
      });

      expect(result.current.usageStats).toEqual({
        bioEnhancements: 0,
        projectOptimizations: 0,
        templateRecommendations: 0,
        totalCost: 0,
      });
    });
  });

  describe('Model Performance Tracking', () => {
    it('should track model performance metrics', () => {
      const { result } = renderHook(() => useAIStore());

      const metrics = {
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        responseTime: 1250,
        quality: 85,
        cost: 0.001,
      };

      act(() => {
        result.current.updateModelMetrics(metrics);
      });

      const modelMetrics = result.current.getModelMetrics(
        'meta-llama/Llama-3.1-8B-Instruct'
      );
      expect(modelMetrics).toEqual(metrics);
    });

    it('should get best performing model for task', () => {
      const { result } = renderHook(() => useAIStore());

      // Add some history with scores
      act(() => {
        result.current.addToHistory({
          id: '1',
          type: 'bio',
          input: 'Bio 1',
          output: 'Enhanced Bio 1',
          model: 'model1',
          timestamp: new Date(),
          score: 80,
        });

        result.current.addToHistory({
          id: '2',
          type: 'bio',
          input: 'Bio 2',
          output: 'Enhanced Bio 2',
          model: 'model2',
          timestamp: new Date(),
          score: 95,
        });

        result.current.addToHistory({
          id: '3',
          type: 'bio',
          input: 'Bio 3',
          output: 'Enhanced Bio 3',
          model: 'model1',
          timestamp: new Date(),
          score: 85,
        });
      });

      const bestModel = result.current.getBestModelForTask('bio');
      expect(bestModel).toBe('model2'); // Has highest average score
    });
  });
});
