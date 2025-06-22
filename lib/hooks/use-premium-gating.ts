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
 * @fileoverview React hooks for Premium Feature Gating
 *
 * Provides React integration for the premium gating system with:
 * - Real-time feature access checking
 * - Usage tracking and limit monitoring
 * - Upgrade prompt triggers
 * - Conversion optimization hooks
 * - A/B testing integration
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  premiumGating,
  PremiumGatingResult,
  BUSINESS_USER_TIERS,
} from '@/lib/monetization/premium-gating';
import {
  checkPremiumFeature,
  trackPremiumFeatureUsage,
  PREMIUM_FEATURE_FLAGS,
} from '@/lib/monetization/premium-gating-helpers';

export interface UsePremiumFeatureOptions {
  userId: string;
  userTier: string;
  feature: string;
  autoTrack?: boolean;
  onUpgradeRequired?: (result: PremiumGatingResult) => void;
  onLimitApproaching?: (remaining: number) => void;
}

export interface PremiumFeatureState {
  allowed: boolean;
  loading: boolean;
  error: string | null;
  result: PremiumGatingResult | null;
  remaining?: number;
  usagePercentage?: number;
  showUpgradePrompt: boolean;
  conversionScore: number;
}

/**
 * Hook for checking and managing premium feature access
 */
export function usePremiumFeature({
  userId,
  userTier,
  feature,
  autoTrack = false,
  onUpgradeRequired,
  onLimitApproaching: _onLimitApproaching,
}: UsePremiumFeatureOptions): PremiumFeatureState & {
  checkAccess: () => Promise<boolean>;
  trackUsage: () => Promise<void>;
  showUpgradeDialog: () => void;
} {
  const [state, setState] = useState<PremiumFeatureState>({
    allowed: false,
    loading: true,
    error: null,
    result: null,
    showUpgradePrompt: false,
    conversionScore: 0,
  });

  const checkAccess = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await checkPremiumFeature(userId, feature, userTier);

      const newState: PremiumFeatureState = {
        allowed: result.allowed,
        loading: false,
        error: null,
        result,
        showUpgradePrompt:
          result.upgradeRequired && result.conversionScore > 70,
        conversionScore: result.conversionScore,
      };

      // TODO: Calculate remaining usage if applicable
      // This would need proper PremiumGatingResult type implementation

      setState(newState);

      // Trigger upgrade callback if needed
      if (result.upgradeRequired && onUpgradeRequired) {
        onUpgradeRequired(result);
      }

      return result.allowed;
    } catch (_error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: _error instanceof Error ? _error.message : 'Unknown error',
        allowed: false,
      }));
      return false;
    }
  }, [userId, userTier, feature, onUpgradeRequired]);

  const trackUsage = useCallback(async (): Promise<void> => {
    try {
      await trackPremiumFeatureUsage(userId, feature, userTier, {
        timestamp: Date.now(),
        source: 'hook_usage',
        auto_tracked: autoTrack,
      });

      // Refresh access check after tracking
      await checkAccess();
    } catch (_error) {
      // Error handled silently
    }
  }, [userId, feature, userTier, autoTrack, checkAccess]);

  const showUpgradeDialog = useCallback(() => {
    setState(prev => ({ ...prev, showUpgradePrompt: true }));
  }, []);

  // Auto-check access on mount and dependency changes
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Auto-track usage if enabled and access is allowed
  useEffect(() => {
    if (autoTrack && state.allowed && !state.loading) {
      trackUsage();
    }
  }, [autoTrack, state.allowed, state.loading, trackUsage]);

  return {
    ...state,
    checkAccess,
    trackUsage,
    showUpgradeDialog,
  };
}

/**
 * Hook for managing user tier and upgrade recommendations
 */
export function useUserTier(userId: string, initialTier: string = 'free') {
  const [userTier, setUserTier] = useState(initialTier);
  const [upgradeRecommendations, setUpgradeRecommendations] = useState<{
    currentTier: string;
    recommendedTier: string;
    reasons: string[];
    potentialRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const tierConfig = useMemo(() => BUSINESS_USER_TIERS[userTier], [userTier]);

  const getUpgradeRecommendations = useCallback(() => {
    setLoading(true);
    try {
      const recommendations = premiumGating.getUpgradeRecommendations(
        userId,
        userTier
      );
      // Transform the data to match the expected state shape
      setUpgradeRecommendations({
        currentTier: userTier,
        recommendedTier: recommendations.recommendedTier,
        reasons: recommendations.keyBenefits,
        potentialRevenue: recommendations.monthlyValue,
      });
    } catch (_error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [userId, userTier]);

  const upgradeTier = useCallback((newTier: string) => {
    // In a real implementation, this would handle the payment flow
    setUserTier(newTier);
    // Upgrade tracked
  }, []);

  const getWatermarkConfig = useCallback(() => {
    return premiumGating.getWatermarkConfig(userTier);
  }, [userTier]);

  useEffect(() => {
    getUpgradeRecommendations();
  }, [getUpgradeRecommendations]);

  return {
    userTier,
    tierConfig,
    upgradeRecommendations,
    loading,
    upgradeTier,
    getUpgradeRecommendations,
    getWatermarkConfig,
  };
}

/**
 * Hook for feature usage analytics and limits
 */
interface FeatureUsageData {
  used: number;
  limit: number | 'unlimited';
}

export function useFeatureUsage(userId: string, userTier: string = 'free') {
  const [usageData, setUsageData] = useState<Record<string, FeatureUsageData>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const refreshUsage = useCallback(() => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch usage data from the backend
      const mockUsage = {
        portfolios: {
          used: 1,
          limit:
            BUSINESS_USER_TIERS[userTier]?.features?.portfolios?.limit || 1,
        },
        ai_enhancements: {
          used: 2,
          limit:
            BUSINESS_USER_TIERS[userTier]?.features?.ai_enhancements?.limit ||
            3,
        },
        exports: {
          used: 1,
          limit: BUSINESS_USER_TIERS[userTier]?.features?.exports?.limit || 1,
        },
        integrations: {
          used: 1,
          limit:
            BUSINESS_USER_TIERS[userTier]?.features?.integrations?.limit || 1,
        },
      };
      setUsageData(mockUsage);
    } catch (_error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [userId, userTier]);

  const getFeatureUsagePercentage = useCallback(
    (feature: string): number => {
      const usage = usageData[feature];
      if (!usage || usage.limit === 'unlimited') return 0;
      return (usage.used / usage.limit) * 100;
    },
    [usageData]
  );

  const isFeatureNearLimit = useCallback(
    (feature: string, threshold: number = 80): boolean => {
      return getFeatureUsagePercentage(feature) >= threshold;
    },
    [getFeatureUsagePercentage]
  );

  const getFeatureStatus = useCallback(
    (
      feature: string
    ): 'available' | 'near_limit' | 'exceeded' | 'unlimited' => {
      const usage = usageData[feature];
      if (!usage) return 'available';
      if (usage.limit === 'unlimited') return 'unlimited';

      const percentage = getFeatureUsagePercentage(feature);
      if (percentage >= 100) return 'exceeded';
      if (percentage >= 80) return 'near_limit';
      return 'available';
    },
    [usageData, getFeatureUsagePercentage]
  );

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  return {
    usageData,
    loading,
    refreshUsage,
    getFeatureUsagePercentage,
    isFeatureNearLimit,
    getFeatureStatus,
  };
}

/**
 * Hook for A/B testing premium features
 */
export function usePremiumFeatureExperiment(
  experimentId: string,
  userId: string,
  _feature: string
) {
  const [variant, setVariant] = useState<'control' | 'treatment'>('control');
  const [experimentActive, setExperimentActive] = useState(false);

  useEffect(() => {
    // Simple A/B testing logic - in production, use a proper experimentation platform
    const userHash = userId.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const isInExperiment = Math.abs(userHash) % 100 < 50; // 50% of users
    setExperimentActive(isInExperiment);
    setVariant(isInExperiment ? 'treatment' : 'control');
  }, [userId, experimentId]);

  const getExperimentConfig = useCallback(() => {
    if (!experimentActive) return null;

    return {
      variant,
      config:
        variant === 'treatment'
          ? { aggressivePrompts: true, scarcityTactics: true }
          : { aggressivePrompts: false, scarcityTactics: false },
    };
  }, [variant, experimentActive]);

  return {
    variant,
    experimentActive,
    getExperimentConfig,
  };
}

/**
 * Hook for conversion optimization
 */
export function useConversionOptimization(userId: string, _userTier: string) {
  const [_conversionData, _setConversionData] = useState<{
    score: number;
    opportunities: string[];
    urgency: number;
  }>({
    score: 0,
    opportunities: [],
    urgency: 0,
  });

  const trackConversionEvent = useCallback(
    async (
      _event:
        | 'feature_blocked'
        | 'limit_reached'
        | 'upgrade_prompt_shown'
        | 'upgrade_prompt_clicked',
      _feature: string,
      _metadata?: Record<string, unknown>
    ) => {
      // Track conversion events for optimization
      // Conversion event tracked
      // In a real implementation, this would send data to analytics
      // await analytics.track('conversion_event', { event, feature, userId, userTier, ...metadata });
    },
    []
  );

  const getOptimalUpgradePrompt = useCallback(
    (feature: string) => {
      // Return optimized upgrade prompt based on user behavior
      const prompts = {
        aggressive: `Unlock unlimited ${feature} now! Limited time offer.`,
        gentle: `Upgrade to continue using ${feature}`,
        value_focused: `Get 10x more ${feature} with Professional plan`,
        social_proof: `Join 10,000+ professionals using unlimited ${feature}`,
      };

      // Simple logic - in production, use ML-based optimization
      const userHash = userId.length % 4;
      const promptTypes = Object.keys(prompts);
      return prompts[promptTypes[userHash] as keyof typeof prompts];
    },
    [userId]
  );

  return {
    conversionData: _conversionData,
    trackConversionEvent,
    getOptimalUpgradePrompt,
  };
}

/**
 * Comprehensive hook that combines all premium features
 */
export function usePremiumSystem(userId: string, initialTier: string = 'free') {
  const tierSystem = useUserTier(userId, initialTier);
  const usageSystem = useFeatureUsage(userId, tierSystem.userTier);
  const conversionSystem = useConversionOptimization(
    userId,
    tierSystem.userTier
  );

  const checkFeature = useCallback(
    (feature: string) => {
      // Return configuration for premium feature checking
      return {
        userId,
        userTier: tierSystem.userTier,
        feature,
        onUpgradeRequired: (result: PremiumGatingResult) => {
          conversionSystem.trackConversionEvent('feature_blocked', feature, {
            conversionScore: result.conversionScore,
            revenueOpportunity: result.revenueOpportunity,
          });
        },
        onLimitApproaching: (remaining: number) => {
          conversionSystem.trackConversionEvent('limit_reached', feature, {
            remaining,
          });
        },
      };
    },
    [userId, tierSystem.userTier, conversionSystem]
  );

  return {
    ...tierSystem,
    usage: usageSystem,
    conversion: conversionSystem,
    checkFeature,
    isFeatureEnabled: (feature: string) =>
      PREMIUM_FEATURE_FLAGS[feature as keyof typeof PREMIUM_FEATURE_FLAGS] ??
      true,
  };
}
