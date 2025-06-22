/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview React Hooks for A/B Testing and Experimentation
 *
 * Provides React integration for the experimentation system:
 * - Experiment variant assignment and tracking
 * - Conversion event handling
 * - Feature flag integration
 * - Real-time experiment results
 * - Revenue impact measurement
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  experimentationEngine,
  getExperimentVariant,
  trackExperimentConversion,
  ExperimentConfig,
  ExperimentResult,
} from '@/lib/experimentation/ab-testing';
import { logger } from '@/lib/utils/logger';

export interface UseExperimentOptions {
  userId: string;
  experimentId: string;
  userContext?: Record<string, unknown>;
  autoTrackExposure?: boolean;
  fallbackVariant?: string;
}

export interface ExperimentState {
  variant: string | null;
  isLoading: boolean;
  error: string | null;
  config: Record<string, unknown> | null;
  isControl: boolean;
}

/**
 * Hook for using A/B experiments in React components
 */
export function useExperiment({
  userId,
  experimentId,
  userContext,
  autoTrackExposure = true,
  fallbackVariant = 'control',
}: UseExperimentOptions): ExperimentState & {
  trackConversion: (
    metricId: string,
    value: number,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  trackExposure: () => Promise<void>;
  isVariant: (variantId: string) => boolean;
} {
  const [state, setState] = useState<ExperimentState>({
    variant: null,
    isLoading: true,
    error: null,
    config: null,
    isControl: false,
  });

  // Assign user to experiment variant
  useEffect(() => {
    async function assignVariant() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const variant = await getExperimentVariant(
          userId,
          experimentId,
          userContext
        );
        const finalVariant = variant || fallbackVariant;

        const config = experimentationEngine.getVariantConfig(
          experimentId,
          finalVariant
        );
        const isControl =
          finalVariant === 'control' || finalVariant.includes('control');

        setState({
          variant: finalVariant,
          isLoading: false,
          error: null,
          config,
          isControl,
        });

        // Auto-track exposure if enabled
        if (autoTrackExposure && variant) {
          await experimentationEngine.trackExposure(userId, experimentId);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to assign experiment variant',
          variant: fallbackVariant,
          config: null,
          isControl: true,
        }));
      }
    }

    if (userId && experimentId) {
      assignVariant();
    }
  }, [userId, experimentId, userContext, autoTrackExposure, fallbackVariant]);

  const trackConversion = useCallback(
    async (
      metricId: string,
      value: number,
      metadata?: Record<string, unknown>
    ) => {
      try {
        await trackExperimentConversion(
          userId,
          experimentId,
          metricId,
          value,
          metadata
        );
      } catch (error) {
        logger.error('Failed to track experiment conversion:', error);
      }
    },
    [userId, experimentId]
  );

  const trackExposure = useCallback(async () => {
    try {
      await experimentationEngine.trackExposure(userId, experimentId);
    } catch (error) {
      logger.error('Failed to track experiment exposure:', error);
    }
  }, [userId, experimentId]);

  const isVariant = useCallback(
    (variantId: string) => {
      return state.variant === variantId;
    },
    [state.variant]
  );

  return {
    ...state,
    trackConversion,
    trackExposure,
    isVariant,
  };
}

/**
 * Hook for managing multiple experiments
 */
export function useExperiments(
  userId: string,
  experimentIds: string[],
  userContext?: Record<string, unknown>
): Record<string, ExperimentState> {
  const [experiments, setExperiments] = useState<
    Record<string, ExperimentState>
  >({});

  useEffect(() => {
    async function assignExperiments() {
      const newExperiments: Record<string, ExperimentState> = {};

      for (const experimentId of experimentIds) {
        try {
          const variant = await getExperimentVariant(
            userId,
            experimentId,
            userContext
          );
          const config = variant
            ? experimentationEngine.getVariantConfig(experimentId, variant)
            : null;

          newExperiments[experimentId] = {
            variant,
            isLoading: false,
            error: null,
            config,
            isControl:
              variant === 'control' || variant?.includes('control') || false,
          };

          // Track exposure
          if (variant) {
            await experimentationEngine.trackExposure(userId, experimentId);
          }
        } catch (error) {
          newExperiments[experimentId] = {
            variant: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to assign variant',
            config: null,
            isControl: false,
          };
        }
      }

      setExperiments(newExperiments);
    }

    if (userId && experimentIds.length > 0) {
      assignExperiments();
    }
  }, [userId, experimentIds, userContext]);

  return experiments;
}

/**
 * Hook for experiment results and analytics
 */
export function useExperimentResults(experimentId: string) {
  const [results, setResults] = useState<Map<
    string,
    ExperimentResult[]
  > | null>(null);
  const [significance, setSignificance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [experimentResults, significanceCheck] = await Promise.all([
        experimentationEngine.getResults(experimentId),
        experimentationEngine.checkSignificance(experimentId),
      ]);

      setResults(experimentResults);
      setSignificance(significanceCheck);
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
    significance,
    loading,
    error,
    refreshResults,
  };
}

/**
 * Hook for feature flags with experiment integration
 */
export function useFeatureFlag(
  flagName: string,
  userId: string,
  defaultValue: boolean = false
): {
  isEnabled: boolean;
  variant: string | null;
  config: Record<string, unknown> | null;
} {
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const [variant, setVariant] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function checkFeatureFlag() {
      try {
        // Check if there's an experiment for this feature flag
        const experimentId = `feature_${flagName}`;
        const experimentVariant = await getExperimentVariant(
          userId,
          experimentId
        );

        if (experimentVariant) {
          setVariant(experimentVariant);
          setIsEnabled(
            experimentVariant === 'enabled' || experimentVariant === 'treatment'
          );

          const variantConfig = experimentationEngine.getVariantConfig(
            experimentId,
            experimentVariant
          );
          setConfig(variantConfig);
        } else {
          // Fallback to default feature flag logic
          setIsEnabled(defaultValue);
          setVariant(null);
          setConfig(null);
        }
      } catch (error) {
        logger.error('Failed to check feature flag:', error);
        setIsEnabled(defaultValue);
      }
    }

    if (userId && flagName) {
      checkFeatureFlag();
    }
  }, [flagName, userId, defaultValue]);

  return { isEnabled, variant, config };
}

/**
 * Hook for revenue experiments specifically
 */
export function useRevenueExperiment(
  userId: string,
  experimentId: string,
  basePrice: number,
  userContext?: Record<string, unknown>
) {
  const experiment = useExperiment({
    userId,
    experimentId,
    userContext,
    autoTrackExposure: true,
  });

  const getPrice = useCallback(() => {
    if (!experiment.config || experiment.isControl) {
      return basePrice;
    }

    const priceMultiplier = (experiment.config.priceMultiplier as number) || 1;
    return Math.round(basePrice * priceMultiplier);
  }, [basePrice, experiment.config, experiment.isControl]);

  const trackPurchase = useCallback(
    async (actualPrice: number, metadata?: Record<string, unknown>) => {
      await experiment.trackConversion('purchase', actualPrice, {
        base_price: basePrice,
        actual_price: actualPrice,
        price_variant: experiment.variant,
        ...metadata,
      });
    },
    [experiment, basePrice]
  );

  const trackUpgrade = useCallback(
    async (tier: string, revenue: number) => {
      await experiment.trackConversion('upgrade', revenue, {
        tier,
        revenue,
        price_variant: experiment.variant,
      });
    },
    [experiment]
  );

  return {
    ...experiment,
    price: getPrice(),
    trackPurchase,
    trackUpgrade,
  };
}

/**
 * Hook for conversion optimization experiments
 */
export function useConversionExperiment(
  userId: string,
  experimentId: string,
  userContext?: Record<string, unknown>
) {
  const experiment = useExperiment({
    userId,
    experimentId,
    userContext,
    autoTrackExposure: true,
  });

  const trackSignup = useCallback(
    async (metadata?: Record<string, unknown>) => {
      await experiment.trackConversion('signup', 1, metadata);
    },
    [experiment]
  );

  const trackTrial = useCallback(
    async (metadata?: Record<string, unknown>) => {
      await experiment.trackConversion('trial_start', 1, metadata);
    },
    [experiment]
  );

  const trackActivation = useCallback(
    async (metadata?: Record<string, unknown>) => {
      await experiment.trackConversion('activation', 1, metadata);
    },
    [experiment]
  );

  const trackFeatureUsage = useCallback(
    async (feature: string, metadata?: Record<string, unknown>) => {
      await experiment.trackConversion('feature_usage', 1, {
        feature,
        ...metadata,
      });
    },
    [experiment]
  );

  return {
    ...experiment,
    trackSignup,
    trackTrial,
    trackActivation,
    trackFeatureUsage,
  };
}

/**
 * Experiment configuration constants
 */
export const EXPERIMENTS = {
  // Pricing experiments
  PRICING_TEST: 'pricing_test_v1',
  TRIAL_LENGTH: 'trial_length_v1',

  // UI/UX experiments
  ONBOARDING_FLOW: 'onboarding_flow_v2',
  UPGRADE_PROMPTS: 'upgrade_prompts_v1',
  TEMPLATE_SELECTION: 'template_selection_v1',

  // Feature experiments
  AI_ENHANCEMENT_LIMIT: 'ai_limit_v1',
  EXPORT_LIMITS: 'export_limits_v1',

  // Conversion experiments
  SIGNUP_FLOW: 'signup_flow_v3',
  LANDING_PAGE: 'landing_page_v2',
} as const;

/**
 * Metric definitions for experiments
 */
export const EXPERIMENT_METRICS = {
  // Conversion metrics
  SIGNUP_RATE: 'signup_rate',
  TRIAL_CONVERSION: 'trial_conversion',
  PAID_CONVERSION: 'paid_conversion',

  // Revenue metrics
  REVENUE_PER_USER: 'revenue_per_user',
  LIFETIME_VALUE: 'lifetime_value',
  UPGRADE_REVENUE: 'upgrade_revenue',

  // Engagement metrics
  FEATURE_ADOPTION: 'feature_adoption',
  SESSION_DURATION: 'session_duration',
  PORTFOLIO_COMPLETION: 'portfolio_completion',

  // Retention metrics
  DAY_1_RETENTION: 'day_1_retention',
  DAY_7_RETENTION: 'day_7_retention',
  DAY_30_RETENTION: 'day_30_retention',
} as const;
