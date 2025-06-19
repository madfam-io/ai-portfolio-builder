import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import type { AIEnhancement } from '@/lib/store/types';


// We need to mock before importing the store
jest.mock('@/lib/ai/client', () => ({
  aiClient: {
    updateModelSelection: jest.fn(),
    enhanceBio: jest.fn(),
    optimizeProject: jest.fn(),
    recommendTemplate: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Import after mocking
import { useAIStore } from '@/lib/store/ai-store';
import { aiClient } from '@/lib/ai/client';


// Unmock the store from comprehensive-test-setup.tsx
jest.unmock('@/lib/store/ai-store');

describe('AI Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Get the actual store and reset it
    const { result } = renderHook(() => useAIStore());
    act(() => {
      result.current.setSelectedModel(
        'bio',
        'meta-llama/Meta-Llama-3.1-8B-Instruct'

      result.current.setSelectedModel(
        'project',
        'microsoft/Phi-3.5-mini-instruct'

      result.current.setSelectedModel(
        'template',
        'meta-llama/Meta-Llama-3.1-8B-Instruct'

      result.current.setAvailableModels([]);
      result.current.clearHistory();
      result.current.setQuota(0, 100);
      result.current.setProcessing(false);
      result.current.setError(null);
    });
  });

  describe('Model Management', () => {
    it('should set selected model for specific type', () => {
      const { result } = renderHook(() => useAIStore());

      act(() => {
        result.current.setSelectedModel('bio', 'new-model-id');
      });

      expect(result.current.selectedModels.bio).toBe('new-model-id');
      expect(result.current.selectedModels.project).toBe(
        'microsoft/Phi-3.5-mini-instruct'

    });

    it('should set available models', () => {
      const mockModels = [
        { id: 'model-1', name: 'Model 1' },
        { id: 'model-2', name: 'Model 2' },
      ];

      const { setAvailableModels } = useAIStore.getState();

      act(() => {
        setAvailableModels(mockModels as any);
      });

      const { availableModels } = useAIStore.getState();
      expect(availableModels).toEqual(mockModels);
    });

    it('should load models from API', async () => {
      const mockModels = [
        { id: 'model-1', name: 'Model 1' },
        { id: 'model-2', name: 'Model 2' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockModels),
      });

      const { loadModels } = useAIStore.getState();

      await act(async () => {
        await loadModels();
      });

      const { availableModels, isProcessing, error } = useAIStore.getState();
      expect(availableModels).toEqual(mockModels);
      expect(isProcessing).toBe(false);
      expect(error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/models');
    });

    it('should handle model loading error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')

      const { loadModels } = useAIStore.getState();

      await expect(
        act(async () => {
          await loadModels();
        })
      ).rejects.toThrow('Network error');

      const { error, isProcessing } = useAIStore.getState();
      expect(error).toBe('Network error');
      expect(isProcessing).toBe(false);
    });
  });

  describe('Enhancement History', () => {
    it('should add enhancement to history', () => {
      const enhancement: AIEnhancement = {
        id: 'test-1',
        type: 'bio',
        originalText: 'Original bio',
        enhancedText: 'Enhanced bio',
        model: 'test-model',
        timestamp: new Date(),
        quality: 0.9,
      };

      const { addEnhancement } = useAIStore.getState();

      act(() => {
        addEnhancement(enhancement);
      });

      const { enhancementHistory } = useAIStore.getState();
      expect(enhancementHistory).toHaveLength(1);
      expect(enhancementHistory[0]).toEqual(enhancement);
    });

    it('should keep only last 50 enhancements', () => {
      const { addEnhancement } = useAIStore.getState();

      act(() => {
        // Add 55 enhancements
        for (let i = 0; i < 55; i++) {
          addEnhancement({
            id: `test-${i}`,
            type: 'bio',
            originalText: `Original ${i}`,
            enhancedText: `Enhanced ${i}`,
            model: 'test-model',
            timestamp: new Date(),
            quality: 0.9,
          });
        }
      });

      const { enhancementHistory } = useAIStore.getState();
      expect(enhancementHistory).toHaveLength(50);
      expect(enhancementHistory[0].id).toBe('test-54'); // Most recent
      expect(enhancementHistory[49].id).toBe('test-5'); // 50th item
    });

    it('should clear enhancement history', () => {
      const { addEnhancement, clearHistory } = useAIStore.getState();

      act(() => {
        addEnhancement({
          id: 'test-1',
          type: 'bio',
          originalText: 'Original',
          enhancedText: 'Enhanced',
          model: 'test-model',
          timestamp: new Date(),
          quality: 0.9,
        });
      });

      expect(useAIStore.getState().enhancementHistory).toHaveLength(1);

      act(() => {
        clearHistory();
      });

      expect(useAIStore.getState().enhancementHistory).toHaveLength(0);
    });
  });

  describe('Quota Management', () => {
    it('should set quota values', () => {
      const { setQuota } = useAIStore.getState();

      act(() => {
        setQuota(25, 50);
      });

      const { quotaUsed, quotaLimit } = useAIStore.getState();
      expect(quotaUsed).toBe(25);
      expect(quotaLimit).toBe(50);
    });

    it('should calculate remaining quota correctly', () => {
      const { setQuota } = useAIStore.getState();

      act(() => {
        setQuota(30, 100);
      });

      const state = useAIStore.getState();
      const quota = {
        used: state.quotaUsed,
        limit: state.quotaLimit,
        remaining: state.quotaLimit - state.quotaUsed,
      };

      expect(quota.remaining).toBe(70);
    });
  });

  describe('AI Operations', () => {
    describe('enhanceBio', () => {
      it('should enhance bio successfully', async () => {
        const mockEnhanced = {
          content: 'Enhanced bio text',
          qualityScore: 0.85,
          suggestions: ['Add more details'],
        };

        (aiClient.enhanceBio as jest.Mock).mockResolvedValue(mockEnhanced);

        const { enhanceBio } = useAIStore.getState();

        let result: string;
        await act(async () => {
          result = await enhanceBio('Original bio text');
        });

        expect(aiClient.updateModelSelection).toHaveBeenCalledWith(
          'bio',
          'meta-llama/Meta-Llama-3.1-8B-Instruct'

        expect(aiClient.enhanceBio).toHaveBeenCalledWith(
          'Original bio text',
          expect.objectContaining({
            title: '',
            skills: [],
            experience: [],
            tone: 'professional',
            industry: 'tech',
            targetLength: 'concise',
          })

        expect(result!).toBe('Enhanced bio text');

        const { enhancementHistory, quotaUsed, isProcessing, error } =
          useAIStore.getState();
        expect(enhancementHistory).toHaveLength(1);
        expect(enhancementHistory[0]).toMatchObject({
          type: 'bio',
          originalText: 'Original bio text',
          enhancedText: 'Enhanced bio text',
          quality: 0.85,
        });
        expect(quotaUsed).toBe(1);
        expect(isProcessing).toBe(false);
        expect(error).toBeNull();
      });

      it('should handle quota exceeded error', async () => {
        const { setQuota, enhanceBio } = useAIStore.getState();

        act(() => {
          setQuota(100, 100); // Quota fully used
        });

        await expect(
          act(async () => {
            await enhanceBio('Text');
          })
        ).rejects.toThrow('AI enhancement quota exceeded');

        expect(aiClient.enhanceBio).not.toHaveBeenCalled();
      });

      it('should handle enhancement error', async () => {
        (aiClient.enhanceBio as jest.Mock).mockRejectedValue(
          new Error('API error')

        const { enhanceBio } = useAIStore.getState();

        await expect(
          act(async () => {
            await enhanceBio('Text');
          })
        ).rejects.toThrow('API error');

        const { error, isProcessing } = useAIStore.getState();
        expect(error).toBe('API error');
        expect(isProcessing).toBe(false);
      });
    });

    describe('enhanceProject', () => {
      it('should enhance project successfully', async () => {
        const mockEnhanced = {
          enhanced: 'Enhanced project description',
          keyAchievements: ['Increased performance', 'Reduced costs'],
        };

        (aiClient.optimizeProject as jest.Mock).mockResolvedValue(mockEnhanced);

        const { enhanceProject } = useAIStore.getState();

        let result: string;
        await act(async () => {
          result = await enhanceProject('Original project description');
        });

        expect(aiClient.updateModelSelection).toHaveBeenCalledWith(
          'project',
          'microsoft/Phi-3.5-mini-instruct'

        expect(aiClient.optimizeProject).toHaveBeenCalledWith(
          'Original project description',
          [],
          'Project'

        expect(result!).toBe('Enhanced project description');

        const { enhancementHistory, quotaUsed } = useAIStore.getState();
        expect(enhancementHistory).toHaveLength(1);
        expect(enhancementHistory[0]).toMatchObject({
          type: 'project',
          originalText: 'Original project description',
          enhancedText: 'Enhanced project description',
        });
        expect(quotaUsed).toBe(1);
      });
    });

    describe('recommendTemplate', () => {
      it('should recommend template successfully', async () => {
        const mockRecommendation = {
          template: 'modern',
          confidence: 0.9,
          reasons: ['Clean design', 'Good for tech'],
        };

        (aiClient.recommendTemplate as jest.Mock).mockResolvedValue(
      mockRecommendation
    );

    const { recommendTemplate } = useAIStore.getState();

        const profileData = {
          title: 'Software Engineer',
          skills: ['React', 'TypeScript'],
        };

        let result: any;
        await act(async () => {
          result = await recommendTemplate(profileData);
        });

        expect(aiClient.updateModelSelection).toHaveBeenCalledWith(
          'template',
          'meta-llama/Meta-Llama-3.1-8B-Instruct'

        expect(aiClient.recommendTemplate).toHaveBeenCalledWith(profileData);
        expect(result).toEqual(mockRecommendation);

        const { quotaUsed } = useAIStore.getState();
        expect(quotaUsed).toBe(1);
      });
    });
  });

  describe('State Management', () => {
    it('should set processing state', () => {
      const { setProcessing } = useAIStore.getState();

      act(() => {
        setProcessing(true);
      });

      expect(useAIStore.getState().isProcessing).toBe(true);

      act(() => {
        setProcessing(false);
      });

      expect(useAIStore.getState().isProcessing).toBe(false);
    });

    it('should set error state', () => {
      const { setError } = useAIStore.getState();

      act(() => {
        setError('Test error message');
      });

      expect(useAIStore.getState().error).toBe('Test error message');

      act(() => {
        setError(null);
      });

      expect(useAIStore.getState().error).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should persist selected models and quota', () => {
      const { setSelectedModel, setQuota } = useAIStore.getState();

      act(() => {
        setSelectedModel('bio', 'persisted-model');
        setQuota(50, 200);
      });

      // Simulate store rehydration
      const persistedState = {
        selectedModels: useAIStore.getState().selectedModels,
        quotaUsed: useAIStore.getState().quotaUsed,
        quotaLimit: useAIStore.getState().quotaLimit,
      };

      expect(persistedState).toEqual({
        selectedModels: {
          bio: 'persisted-model',
          project: 'microsoft/Phi-3.5-mini-instruct',
          template: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        },
        quotaUsed: 50,
        quotaLimit: 200,
      });
    });
  });
});
