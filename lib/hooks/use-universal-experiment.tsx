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

/**
 * @fileoverview Universal Experiment React Hooks
 *
 * Comprehensive React integration for the universal experimentation system:
 * - Component-level experiment hooks
 * - Flow and journey experiment tracking
 * - Real-time variant configuration
 * - Automatic exposure and conversion tracking
 * - Performance monitoring and analytics
 *
 * @author PRISMA Business Team
 * @version 2.0.0 - Universal Platform
 */

'use client';

import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import {
  universalExperimentEngine,
  getExperimentVariant,
  trackExperimentExposure,
  trackExperimentConversion,
  UniversalExperimentVariant,
  ExperimentAssignment,
  ExperimentContext,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

// Context for experiment provider
interface ExperimentContextType {
  assignments: Map<string, ExperimentAssignment>;
  isLoading: boolean;
  userId: string | null;
  userContext: Record<string, unknown>;
  refreshAssignments: () => Promise<void>;
}

const ExperimentReactContext = createContext<ExperimentContextType | null>(
  null
);

/**
 * Universal Experiment Provider
 */
export function UniversalExperimentProvider({
  userId,
  userContext = {},
  children,
}: {
  userId: string | null;
  userContext?: Record<string, unknown>;
  children: ReactNode;
}) {
  const [assignments, setAssignments] = useState<
    Map<string, ExperimentAssignment>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const refreshAssignments = useCallback(async () => {
    if (!userId) {
      setAssignments(new Map());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get assignments for all contexts
      const contexts: ExperimentContext[] = [
        'global',
        'landing_page',
        'editor',
        'onboarding',
        'pricing',
        'upgrade_flow',
        'ai_enhancement',
        'template_selection',
        'publishing',
        'dashboard',
      ];

      const allAssignments = new Map<string, ExperimentAssignment>();

      for (const context of contexts) {
        const contextAssignments = await getExperimentVariant(
          userId,
          context,
          userContext
        );
        contextAssignments.forEach((assignment, experimentId) => {
          allAssignments.set(experimentId, assignment);
        });
      }

      setAssignments(allAssignments);
    } catch (_error) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  }, [userId, userContext]);

  useEffect(() => {
    refreshAssignments();
  }, [refreshAssignments]);

  const contextValue: ExperimentContextType = {
    assignments,
    isLoading,
    userId,
    userContext,
    refreshAssignments,
  };

  return (
    <ExperimentReactContext.Provider value={contextValue}>
      {children}
    </ExperimentReactContext.Provider>
  );
}

/**
 * Hook to access experiment context
 */
export function useExperimentContext(): ExperimentContextType {
  const context = useContext(ExperimentReactContext);
  if (!context) {
    throw new Error(
      'useExperimentContext must be used within UniversalExperimentProvider'
    );
  }
  return context;
}

/**
 * Hook for component-level experiments
 */
export function useComponentExperiment(
  componentId: string,
  context: ExperimentContext = 'component',
  options: {
    autoTrackExposure?: boolean;
    fallbackVariant?: string;
    onExposure?: (variantId: string) => void;
    onConversion?: (metricId: string, value: number) => void;
  } = {}
) {
  const { assignments, userId } = useExperimentContext();
  const [variantConfig, setVariantConfig] =
    useState<UniversalExperimentVariant | null>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [isExposed, setIsExposed] = useState(false);

  const {
    autoTrackExposure = true,
    fallbackVariant = 'control',
    onExposure,
    onConversion,
  } = options;

  // Find experiment assignment for this component
  useEffect(() => {
    const assignment = Array.from(assignments.values()).find(
      a =>
        a.context === context &&
        (a.experimentId.includes(componentId) ||
          a.userContext.sessionData?.componentId === componentId)
    );

    if (assignment && userId) {
      const variant = universalExperimentEngine.getVariantConfig(
        userId,
        assignment.experimentId
      );
      setVariantConfig(variant);
      setExperimentId(assignment.experimentId);
    } else {
      setVariantConfig(null);
      setExperimentId(null);
    }
  }, [assignments, componentId, context, userId]);

  const trackExposure = useCallback(async () => {
    if (!experimentId || !userId || isExposed) return;

    try {
      await trackExperimentExposure(userId, experimentId, context, {
        componentId,
        timestamp: Date.now(),
      });
      setIsExposed(true);

      if (onExposure && variantConfig) {
        onExposure(variantConfig.id);
      }
    } catch (_error) {
      // Error handled silently
    }
  }, [
    experimentId,
    userId,
    context,
    componentId,
    isExposed,
    onExposure,
    variantConfig,
  ]);

  // Auto-track exposure
  useEffect(() => {
    if (autoTrackExposure && experimentId && userId && !isExposed) {
      trackExposure();
    }
  }, [autoTrackExposure, experimentId, userId, isExposed, trackExposure]);

  const trackConversion = useCallback(
    async (
      metricId: string,
      value: number = 1,
      metadata?: Record<string, unknown>
    ) => {
      if (!experimentId || !userId) return;

      try {
        await trackExperimentConversion(userId, experimentId, {
          metricId,
          value,
          metadata: {
            componentId,
            timestamp: Date.now(),
            ...metadata,
          },
        });

        if (onConversion) {
          onConversion(metricId, value);
        }
      } catch (_error) {
        // Error handled silently
      }
    },
    [experimentId, userId, componentId, onConversion]
  );

  const getVariantProp = useCallback(
    (propName: string, defaultValue?: unknown): unknown => {
      return variantConfig?.config.componentProps?.[propName] ?? defaultValue;
    },
    [variantConfig]
  );

  const isVariant = useCallback(
    (variantId: string): boolean => {
      return variantConfig?.id === variantId;
    },
    [variantConfig]
  );

  return {
    variant: variantConfig?.id || fallbackVariant,
    variantConfig,
    experimentId,
    isControl: variantConfig?.isControl ?? true,
    trackExposure,
    trackConversion,
    getVariantProp,
    isVariant,
    isExposed,
  };
}

/**
 * Hook for flow/journey experiments
 */
export function useFlowExperiment(
  flowId: string,
  currentStep: string,
  context: ExperimentContext = 'global'
) {
  const { assignments, userId } = useExperimentContext();
  const [flowConfig, setFlowConfig] = useState<any[] | null>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const assignment = Array.from(assignments.values()).find(
      a => a.context === context && a.experimentId.includes(flowId)
    );

    if (assignment && userId) {
      const variant = universalExperimentEngine.getVariantConfig(
        userId,
        assignment.experimentId
      );
      setFlowConfig(variant?.config.flowSteps || null);
      setExperimentId(assignment.experimentId);
    }
  }, [assignments, flowId, context, userId]);

  const getCurrentStepConfig = useCallback(() => {
    if (!flowConfig) return null;
    return (
      flowConfig.find(
        (step: Record<string, unknown>) => step.stepId === currentStep
      )?.config || null
    );
  }, [flowConfig, currentStep]);

  const trackStepCompletion = useCallback(
    async (stepId: string, metadata?: Record<string, unknown>) => {
      if (!experimentId || !userId) return;

      await trackExperimentConversion(userId, experimentId, {
        metricId: 'step_completion',
        value: 1,
        metadata: {
          flowId,
          stepId,
          timestamp: Date.now(),
          ...metadata,
        },
      });
    },
    [experimentId, userId, flowId]
  );

  const trackFlowCompletion = useCallback(
    async (metadata?: Record<string, unknown>) => {
      if (!experimentId || !userId) return;

      await trackExperimentConversion(userId, experimentId, {
        metricId: 'flow_completion',
        value: 1,
        metadata: {
          flowId,
          timestamp: Date.now(),
          ...metadata,
        },
      });
    },
    [experimentId, userId, flowId]
  );

  return {
    flowConfig,
    currentStepConfig: getCurrentStepConfig(),
    experimentId,
    trackStepCompletion,
    trackFlowCompletion,
  };
}

/**
 * Hook for content experiments (text, messaging, copy)
 */
export function useContentExperiment(
  contentKey: string,
  defaultContent: string,
  context: ExperimentContext = 'global'
) {
  const { assignments, userId } = useExperimentContext();
  const [content, setContent] = useState(defaultContent);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const assignment = Array.from(assignments.values()).find(
      a => a.context === context
    );

    if (assignment && userId) {
      const variant = universalExperimentEngine.getVariantConfig(
        userId,
        assignment.experimentId
      );
      const variantContent = variant?.config.content?.[contentKey];
      setContent(variantContent || defaultContent);
      setExperimentId(assignment.experimentId);
    } else {
      setContent(defaultContent);
    }
  }, [assignments, contentKey, defaultContent, context, userId]);

  const trackContentInteraction = useCallback(
    async (interactionType: string, metadata?: Record<string, unknown>) => {
      if (!experimentId || !userId) return;

      await trackExperimentConversion(userId, experimentId, {
        metricId: 'content_interaction',
        value: 1,
        metadata: {
          contentKey,
          interactionType,
          content,
          timestamp: Date.now(),
          ...metadata,
        },
      });
    },
    [experimentId, userId, contentKey, content]
  );

  return {
    content,
    experimentId,
    trackContentInteraction,
  };
}

/**
 * Hook for pricing experiments
 */
export function usePricingExperiment(
  basePrice: number,
  currency: string = 'USD',
  context: ExperimentContext = 'pricing'
) {
  const { assignments, userId } = useExperimentContext();
  const [pricingConfig, setPricingConfig] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const assignment = Array.from(assignments.values()).find(
      a => a.context === context
    );

    if (assignment && userId) {
      const variant = universalExperimentEngine.getVariantConfig(
        userId,
        assignment.experimentId
      );
      setPricingConfig(variant?.config.pricingConfig || null);
      setExperimentId(assignment.experimentId);
    }
  }, [assignments, context, userId]);

  const getPrice = useCallback(() => {
    if (!pricingConfig) return basePrice;

    let finalPrice = Number(pricingConfig.basePrice || basePrice);

    // Apply discounts
    if (pricingConfig.discounts && Array.isArray(pricingConfig.discounts)) {
      for (const discount of pricingConfig.discounts) {
        if (discount.type === 'percentage') {
          finalPrice *= 1 - Number(discount.value) / 100;
        } else if (discount.type === 'fixed') {
          finalPrice -= Number(discount.value);
        }
      }
    }

    return Math.max(0, Math.round(finalPrice * 100) / 100);
  }, [pricingConfig, basePrice]);

  const trackPriceView = useCallback(async () => {
    if (!experimentId || !userId) return;

    await trackExperimentConversion(userId, experimentId, {
      metricId: 'price_view',
      value: 1,
      metadata: {
        basePrice,
        finalPrice: getPrice(),
        currency,
        timestamp: Date.now(),
      },
    });
  }, [experimentId, userId, basePrice, getPrice, currency]);

  const trackPurchase = useCallback(
    async (actualPrice: number, metadata?: Record<string, unknown>) => {
      if (!experimentId || !userId) return;

      await trackExperimentConversion(userId, experimentId, {
        metricId: 'purchase',
        value: actualPrice,
        metadata: {
          basePrice,
          experimentPrice: getPrice(),
          actualPrice,
          currency,
          timestamp: Date.now(),
          ...metadata,
        },
      });
    },
    [experimentId, userId, basePrice, getPrice, currency]
  );

  return {
    price: getPrice(),
    originalPrice: basePrice,
    currency: pricingConfig?.currency || currency,
    discounts: pricingConfig?.discounts || [],
    experimentId,
    trackPriceView,
    trackPurchase,
  };
}

/**
 * Hook for feature flag experiments
 */
export function useFeatureFlagExperiment(
  featureName: string,
  defaultEnabled: boolean = false,
  context: ExperimentContext = 'global'
) {
  const { assignments, userId } = useExperimentContext();
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const assignment = Array.from(assignments.values()).find(
      a => a.context === context
    );

    if (assignment && userId) {
      const variant = universalExperimentEngine.getVariantConfig(
        userId,
        assignment.experimentId
      );
      const featureEnabled = variant?.config.featureFlags?.[featureName];
      setIsEnabled(
        featureEnabled !== undefined ? featureEnabled : defaultEnabled
      );
      setExperimentId(assignment.experimentId);
    } else {
      setIsEnabled(defaultEnabled);
    }
  }, [assignments, featureName, defaultEnabled, context, userId]);

  const trackFeatureUsage = useCallback(
    async (metadata?: Record<string, unknown>) => {
      if (!experimentId || !userId) return;

      await trackExperimentConversion(userId, experimentId, {
        metricId: 'feature_usage',
        value: 1,
        metadata: {
          featureName,
          enabled: isEnabled,
          timestamp: Date.now(),
          ...metadata,
        },
      });
    },
    [experimentId, userId, featureName, isEnabled]
  );

  return {
    isEnabled,
    experimentId,
    trackFeatureUsage,
  };
}

/**
 * Hook for AI/algorithm experiments
 */
export function useAlgorithmExperiment(
  algorithmName: string,
  defaultParams: Record<string, unknown> = {},
  context: ExperimentContext = 'ai_enhancement'
) {
  const { assignments, userId } = useExperimentContext();
  const [params, setParams] = useState(defaultParams);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const assignment = Array.from(assignments.values()).find(
      a => a.context === context
    );

    if (assignment && userId) {
      const variant = universalExperimentEngine.getVariantConfig(
        userId,
        assignment.experimentId
      );
      const algorithmParams = variant?.config.algorithmParams?.[algorithmName];
      setParams(
        algorithmParams ? { ...algorithmParams } : { ...defaultParams }
      );
      setExperimentId(assignment.experimentId);
    } else {
      setParams({ ...defaultParams });
    }
  }, [assignments, algorithmName, defaultParams, context, userId]);

  const trackAlgorithmUsage = useCallback(
    async (
      resultQuality: number,
      processingTime: number,
      metadata?: Record<string, unknown>
    ) => {
      if (!experimentId || !userId) return;

      await trackExperimentConversion(userId, experimentId, {
        metricId: 'algorithm_usage',
        value: 1,
        metadata: {
          algorithmName,
          params,
          resultQuality,
          processingTime,
          timestamp: Date.now(),
          ...metadata,
        },
      });
    },
    [experimentId, userId, algorithmName, params]
  );

  return {
    params,
    experimentId,
    trackAlgorithmUsage,
  };
}

/**
 * Hook for experiment results (admin/analytics use)
 */
export function useExperimentResults(experimentId: string) {
  const [results, setResults] = useState<Map<
    string,
    ExperimentResult[]
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const experimentResults =
        await universalExperimentEngine.getExperimentResults(experimentId);
      setResults(experimentResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, [experimentId]);

  useEffect(() => {
    refreshResults();
  }, [refreshResults]);

  return {
    results,
    loading,
    error,
    refreshResults,
  };
}

/**
 * Pre-configured experiment hooks for common use cases
 */

// Upgrade flow experiment
export function useUpgradeFlowExperiment() {
  return useFlowExperiment('upgrade_flow', 'start', 'upgrade_flow');
}

// Onboarding experiment
export function useOnboardingExperiment(currentStep: string) {
  return useFlowExperiment('onboarding', currentStep, 'onboarding');
}

// Pricing page experiment
export function usePricingPageExperiment() {
  return useComponentExperiment('pricing_page', 'pricing');
}

// AI enhancement experiment
export function useAIEnhancementExperiment() {
  return useAlgorithmExperiment('bio_enhancement', {
    model: 'llama-3.1',
    temperature: 0.7,
    maxTokens: 150,
  });
}

// Template selection experiment
export function useTemplateSelectionExperiment() {
  return useComponentExperiment('template_selector', 'template_selection');
}
