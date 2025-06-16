/**
 * Subscription management hook
 *
 * Provides subscription state, usage limits, and upgrade functions.
 * Automatically refreshes when limits change.
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

export interface SubscriptionLimits {
  subscription_tier: 'free' | 'pro' | 'business' | 'enterprise';
  subscription_status: string;
  current_usage: {
    portfolios: number;
    ai_requests: number;
  };
  limits: {
    max_portfolios: number;
    max_ai_requests: number;
  };
  can_create_portfolio: boolean;
  can_use_ai: boolean;
}

interface UseSubscriptionResult {
  limits: SubscriptionLimits | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  canCreatePortfolio: boolean;
  canUseAI: boolean;
  portfolioUsagePercentage: number;
  aiUsagePercentage: number;
  isUpgradeRequired: (action: 'portfolio' | 'ai') => boolean;
  planName: string;
  isFreeTier: boolean;
  isPaidTier: boolean;
}

export function useSubscription(): UseSubscriptionResult {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/user/limits', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch limits');
      }

      const data = await response.json();
      setLimits(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error('Failed to fetch subscription limits', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch limits on mount
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Computed values
  const canCreatePortfolio = limits?.can_create_portfolio ?? false;
  const canUseAI = limits?.can_use_ai ?? false;

  const portfolioUsagePercentage = limits
    ? limits.limits.max_portfolios === -1
      ? 0 // Unlimited
      : Math.round(
          (limits.current_usage.portfolios / limits.limits.max_portfolios) * 100
        )
    : 0;

  const aiUsagePercentage = limits
    ? limits.limits.max_ai_requests === -1
      ? 0 // Unlimited
      : Math.round(
          (limits.current_usage.ai_requests / limits.limits.max_ai_requests) *
            100
        )
    : 0;

  const isUpgradeRequired = useCallback(
    (action: 'portfolio' | 'ai') => {
      if (!limits) return false;

      if (action === 'portfolio') {
        return !limits.can_create_portfolio;
      }

      if (action === 'ai') {
        return !limits.can_use_ai;
      }

      return false;
    },
    [limits]
  );

  const planName = limits ? getPlanDisplayName(limits.subscription_tier) : '';
  const isFreeTier = limits?.subscription_tier === 'free';
  const isPaidTier = limits ? limits.subscription_tier !== 'free' : false;

  return {
    limits,
    loading,
    error,
    refresh: fetchLimits,
    canCreatePortfolio,
    canUseAI,
    portfolioUsagePercentage,
    aiUsagePercentage,
    isUpgradeRequired,
    planName,
    isFreeTier,
    isPaidTier,
  };
}

/**
 * Get display name for subscription tier
 */
function getPlanDisplayName(tier: string): string {
  switch (tier) {
    case 'free':
      return 'Free';
    case 'pro':
      return 'Pro';
    case 'business':
      return 'Business';
    case 'enterprise':
      return 'Enterprise';
    default:
      return 'Unknown';
  }
}

/**
 * Hook for checking specific limits without full subscription state
 */
export function useCanPerformAction(action: 'portfolio' | 'ai') {
  const { limits, loading } = useSubscription();

  if (loading || !limits) {
    return { canPerform: false, loading: true };
  }

  const canPerform =
    action === 'portfolio' ? limits.can_create_portfolio : limits.can_use_ai;

  return { canPerform, loading: false };
}
