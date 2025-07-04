/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { aiClient } from '@/lib/ai/client';

import { AIState, AIActions, AIEnhancement } from './types';

/**
 * AI Store
 * Manages AI model selection, enhancement history, and AI operations
 */

const initialState: AIState = {
  selectedModels: {
    bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    project: 'microsoft/Phi-3.5-mini-instruct',
    template: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
  },
  availableModels: [],
  enhancementHistory: [],
  quotaUsed: 0,
  quotaLimit: 100,
  isProcessing: false,
  error: null,
};

export const useAIStore = create<AIState & AIActions>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          ...initialState,

          // Model management
          setSelectedModel: (type, modelId) =>
            set(state => {
              state.selectedModels[type] = modelId;
            }),

          setAvailableModels: models =>
            set(state => {
              state.availableModels = models;
            }),

          // Enhancement history
          addEnhancement: enhancement =>
            set(state => {
              state.enhancementHistory.unshift(enhancement);
              // Keep only last 50 enhancements
              if (state.enhancementHistory.length > 50) {
                state.enhancementHistory = state.enhancementHistory.slice(
                  0,
                  50
                );
              }
            }),

          clearHistory: () =>
            set(state => {
              state.enhancementHistory = [];
            }),

          // Quota management
          setQuota: (used, limit) =>
            set(state => {
              state.quotaUsed = used;
              state.quotaLimit = limit;
            }),

          // State management
          setProcessing: isProcessing =>
            set(state => {
              state.isProcessing = isProcessing;
            }),

          setError: error =>
            set(state => {
              state.error = error;
            }),

          // AI operations
          enhanceBio: async text => {
            const { selectedModels, quotaUsed, quotaLimit } = get();

            if (quotaUsed >= quotaLimit) {
              throw new Error('AI enhancement quota exceeded');
            }

            set(state => {
              state.isProcessing = true;
              state.error = null;
            });

            try {
              // Update client preferences before enhancing
              aiClient.updateModelSelection('bio', selectedModels.bio);

              const enhanced = await aiClient.enhanceBio(text, {
                title: '',
                skills: [],
                experience: [],
                tone: 'professional',
                industry: 'tech',
                targetLength: 'concise',
              });

              const enhancement: AIEnhancement = {
                id: `enhancement-${Date.now()}`,
                type: 'bio',
                originalText: text,
                enhancedText: enhanced.content,
                model: selectedModels.bio,
                timestamp: new Date(),
                quality: enhanced.qualityScore || 0.8,
              };

              set(state => {
                state.enhancementHistory.unshift(enhancement);
                state.quotaUsed += 1;
                state.isProcessing = false;
              });

              return enhanced.content;
            } catch (error: unknown) {
              set(state => {
                state.error =
                  error instanceof Error ? error.message : 'Enhancement failed';
                state.isProcessing = false;
              });
              throw error;
            }
          },

          enhanceProject: async text => {
            const { selectedModels, quotaUsed, quotaLimit } = get();

            if (quotaUsed >= quotaLimit) {
              throw new Error('AI enhancement quota exceeded');
            }

            set(state => {
              state.isProcessing = true;
              state.error = null;
            });

            try {
              // Update client preferences before enhancing
              aiClient.updateModelSelection('project', selectedModels.project);

              const enhanced = await aiClient.optimizeProject(
                text,
                [],
                'Project'
              );

              const enhancement: AIEnhancement = {
                id: `enhancement-${Date.now()}`,
                type: 'project',
                originalText: text,
                enhancedText: enhanced.enhanced,
                model: selectedModels.project,
                timestamp: new Date(),
                quality: 0.8,
              };

              set(state => {
                state.enhancementHistory.unshift(enhancement);
                state.quotaUsed += 1;
                state.isProcessing = false;
              });

              return enhanced.enhanced;
            } catch (error: unknown) {
              set(state => {
                state.error =
                  error instanceof Error ? error.message : 'Enhancement failed';
                state.isProcessing = false;
              });
              throw error;
            }
          },

          recommendTemplate: async data => {
            const { selectedModels, quotaUsed, quotaLimit } = get();

            if (quotaUsed >= quotaLimit) {
              throw new Error('AI enhancement quota exceeded');
            }

            set(state => {
              state.isProcessing = true;
              state.error = null;
            });

            try {
              // Update client preferences before recommending
              aiClient.updateModelSelection(
                'template',
                selectedModels.template
              );

              const recommendation = await aiClient.recommendTemplate(
                data as unknown as Parameters<
                  typeof aiClient.recommendTemplate
                >[0]
              );

              set(state => {
                state.quotaUsed += 1;
                state.isProcessing = false;
              });

              // Transform to expected format
              return {
                recommendedTemplate: recommendation.recommendedTemplate,
                confidence: recommendation.confidence,
                alternatives: recommendation.alternatives.map(
                  alt => alt.template
                ),
              };
            } catch (error: unknown) {
              set(state => {
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Recommendation failed';
                state.isProcessing = false;
              });
              throw error;
            }
          },

          loadModels: async () => {
            set(state => {
              state.isProcessing = true;
              state.error = null;
            });

            try {
              // Fetch available models from API
              const response = await fetch('/api/ai/models');
              const models = await response.json();

              set(state => {
                state.availableModels = models;
                state.isProcessing = false;
              });
            } catch (error: unknown) {
              set(state => {
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Failed to load models';
                state.isProcessing = false;
              });
              throw error;
            }
          },
        })),
        {
          name: 'ai-store',
          // Persist model preferences and quota
          partialize: state => ({
            selectedModels: state.selectedModels,
            quotaUsed: state.quotaUsed,
            quotaLimit: state.quotaLimit,
          }),
        }
      )
    ),
    {
      name: 'ai-store',
    }
  )
);
