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
 * @fileoverview Premium Feature Gating System for Business Excellence
 *
 * Comprehensive monetization system that:
 * - Identifies and gates premium features strategically
 * - Tracks usage against tier limits for conversion optimization
 * - Creates upgrade pressure through value demonstration
 * - Implements psychological pricing and scarcity tactics
 * - Maximizes revenue potential through strategic feature limitation
 *
 * Designed for market leadership and business excellence.
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

export interface UserTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Record<string, FeatureLimit>;
  marketingPosition: string;
  targetRevenue: number;
}

export interface FeatureLimit {
  enabled: boolean;
  limit: number | 'unlimited';
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  overageAllowed: boolean;
  upgradeRequired: boolean;
  marketingMessage?: string;
  scarcityTactic?: string;
}

export interface FeatureUsage {
  userId: string;
  feature: string;
  count: number;
  limit: number | 'unlimited';
  resetDate: Date;
  tier: string;
  upgradePromptShown: boolean;
  conversionOpportunity: number; // 0-100 score
}

export interface PremiumGatingResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired: boolean;
  marketingMessage: string;
  scarcityIndicator?: string;
  conversionScore: number;
  revenueOpportunity: number;
  userTier: string;
  nextTierBenefits: string[];
}

/**
 * Business-grade user tier definitions with strategic pricing
 */
export const BUSINESS_USER_TIERS: Record<string, UserTier> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    marketingPosition: 'Get started with PRISMA',
    targetRevenue: 0,
    features: {
      portfolios: {
        enabled: true,
        limit: 1,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Create unlimited portfolios',
        scarcityTactic: 'Only 1 portfolio allowed',
      },
      ai_enhancements: {
        enabled: true,
        limit: 3,
        resetPeriod: 'monthly',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Unlimited AI-powered content enhancement',
        scarcityTactic: '3 AI enhancements per month',
      },
      templates: {
        enabled: true,
        limit: 3,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Access to all premium templates',
      },
      custom_domain: {
        enabled: false,
        limit: 0,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Use your own domain',
      },
      analytics: {
        enabled: false,
        limit: 0,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Advanced portfolio analytics',
      },
      exports: {
        enabled: true,
        limit: 2,
        resetPeriod: 'monthly',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Unlimited PDF exports',
        scarcityTactic: '2 exports per month',
      },
      integrations: {
        enabled: true,
        limit: 1,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Connect multiple platforms',
        scarcityTactic: 'LinkedIn OR GitHub',
      },
      support: {
        enabled: true,
        limit: 1,
        resetPeriod: 'weekly',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Priority support',
      },
      watermark_removal: {
        enabled: false,
        limit: 0,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Remove PRISMA branding',
      },
      collaboration: {
        enabled: false,
        limit: 0,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Team collaboration features',
      },
    },
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 29,
    yearlyPrice: 290, // 2 months free
    marketingPosition: 'For serious professionals',
    targetRevenue: 29,
    features: {
      portfolios: {
        enabled: true,
        limit: 5,
        resetPeriod: 'never',
        overageAllowed: true,
        upgradeRequired: false,
        marketingMessage: 'Unlimited portfolios in Business plan',
      },
      ai_enhancements: {
        enabled: true,
        limit: 50,
        resetPeriod: 'monthly',
        overageAllowed: false,
        upgradeRequired: false,
        scarcityTactic: '50 AI enhancements per month',
      },
      templates: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      custom_domain: {
        enabled: true,
        limit: 1,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
        marketingMessage: 'Multiple custom domains in Business plan',
      },
      analytics: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      exports: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      integrations: {
        enabled: true,
        limit: 3,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
        marketingMessage: 'Unlimited integrations in Business plan',
      },
      support: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      watermark_removal: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      collaboration: {
        enabled: false,
        limit: 0,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'Team features in Business plan',
      },
    },
  },

  business: {
    id: 'business',
    name: 'Business',
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free
    marketingPosition: 'For teams and agencies',
    targetRevenue: 99,
    features: {
      portfolios: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      ai_enhancements: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      templates: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      custom_domain: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      analytics: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      exports: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      integrations: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      support: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      watermark_removal: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      collaboration: {
        enabled: true,
        limit: 10,
        resetPeriod: 'never',
        overageAllowed: true,
        upgradeRequired: false,
        marketingMessage: 'Unlimited team members in Enterprise',
      },
      white_label: {
        enabled: false,
        limit: 0,
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: true,
        marketingMessage: 'White-label solutions in Enterprise',
      },
      api_access: {
        enabled: true,
        limit: 1000,
        resetPeriod: 'monthly',
        overageAllowed: true,
        upgradeRequired: false,
        marketingMessage: 'Unlimited API access in Enterprise',
      },
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    yearlyPrice: 4990, // 2 months free
    marketingPosition: 'For large organizations',
    targetRevenue: 499,
    features: {
      portfolios: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      ai_enhancements: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      templates: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      custom_domain: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      analytics: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      exports: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      integrations: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      support: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      watermark_removal: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      collaboration: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      white_label: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      api_access: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      dedicated_manager: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      custom_integrations: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
      sla_guarantees: {
        enabled: true,
        limit: 'unlimited',
        resetPeriod: 'never',
        overageAllowed: false,
        upgradeRequired: false,
      },
    },
  },
};

/**
 * Premium Feature Gating Engine - Core business logic for business excellence
 */
export class PremiumGatingEngine {
  private userUsageCache = new Map<string, Map<string, FeatureUsage>>();
  private conversionTracker = new Map<string, number>();

  /**
   * Check if user can access a premium feature
   */
  async checkFeatureAccess(
    userId: string,
    feature: string,
    userTier: string = 'free',
    currentUsage?: number
  ): Promise<PremiumGatingResult> {
    const tier = BUSINESS_USER_TIERS[userTier];
    if (!tier) {
      throw new Error(`Unknown user tier: ${userTier}`);
    }

    const featureConfig = tier.features[feature];
    if (!featureConfig) {
      return {
        allowed: false,
        reason: 'Feature not defined',
        upgradeRequired: true,
        marketingMessage: 'Contact support for feature access',
        conversionScore: 0,
        revenueOpportunity: 0,
        userTier,
        nextTierBenefits: [],
      };
    }

    // Feature disabled for tier
    if (!featureConfig.enabled) {
      return this.createUpgradeRequiredResult(
        userId,
        feature,
        userTier,
        featureConfig
      );
    }

    // Feature has unlimited access
    if (featureConfig.limit === 'unlimited') {
      return {
        allowed: true,
        upgradeRequired: false,
        marketingMessage: 'Unlimited access',
        conversionScore: 0,
        revenueOpportunity: 0,
        userTier,
        nextTierBenefits: this.getNextTierBenefits(userTier),
      };
    }

    // Check usage limits
    const usage = await this.getUserFeatureUsage(userId, feature, userTier);
    const actualUsage = currentUsage !== undefined ? currentUsage : usage.count;

    if (actualUsage >= (featureConfig.limit as number)) {
      if (featureConfig.overageAllowed) {
        return this.createOverageResult({
          userId,
          feature,
          userTier,
          featureConfig,
          usage: actualUsage,
        });
      } else {
        return this.createLimitExceededResult(
          userId,
          feature,
          userTier,
          featureConfig
        );
      }
    }

    // Access allowed with usage tracking
    return this.createAllowedResult({
      userId,
      feature,
      userTier,
      featureConfig,
      usage: actualUsage,
    });
  }

  /**
   * Track feature usage for limits and conversion optimization
   */
  async trackFeatureUsage(
    userId: string,
    feature: string,
    userTier: string = 'free',
    _metadata?: Record<string, unknown>
  ): Promise<void> {
    const usage = await this.getUserFeatureUsage(userId, feature, userTier);
    usage.count += 1;

    // Update cache
    if (!this.userUsageCache.has(userId)) {
      this.userUsageCache.set(userId, new Map());
    }
    this.userUsageCache.get(userId)?.set(feature, usage);

    // Track conversion opportunity
    await this.trackConversionOpportunity(userId, feature, userTier, usage);

    // Feature usage tracked
  }

  /**
   * Get upgrade recommendations based on usage patterns
   */
  getUpgradeRecommendations(
    userId: string,
    userTier: string = 'free'
  ): {
    recommendedTier: string;
    monthlyValue: number;
    keyBenefits: string[];
    urgencyScore: number;
    conversionProbability: number;
    limitingFeatures: string[];
  } {
    const userUsage = this.userUsageCache.get(userId) || new Map();
    const currentTier = BUSINESS_USER_TIERS[userTier];

    let limitingFeatures: string[] = [];
    let urgencyScore = 0;
    let monthlyValue = 0;

    // Analyze feature usage patterns
    for (const [feature, usage] of userUsage) {
      const featureConfig = currentTier?.features[feature];
      if (!featureConfig) continue;

      // Check if user is hitting limits
      if (
        featureConfig.limit !== 'unlimited' &&
        usage.count >= (featureConfig.limit as number)
      ) {
        limitingFeatures.push(feature);
        urgencyScore += 20;
      }

      // Check if usage is approaching limits
      if (
        featureConfig.limit !== 'unlimited' &&
        usage.count >= (featureConfig.limit as number) * 0.8
      ) {
        urgencyScore += 10;
      }
    }

    // Determine recommended tier
    const nextTier = this.getNextTier(userTier);
    const nextTierConfig = BUSINESS_USER_TIERS[nextTier];

    // Calculate value proposition
    monthlyValue = nextTierConfig?.monthlyPrice || 29;
    const keyBenefits = this.getKeyUpgradeBenefits(
      userTier,
      nextTier,
      limitingFeatures
    );

    // Calculate conversion probability based on usage patterns
    const conversionProbability = this.calculateConversionProbability(
      userId,
      userTier,
      urgencyScore,
      limitingFeatures.length
    );

    return {
      recommendedTier: nextTier,
      monthlyValue,
      keyBenefits,
      urgencyScore: Math.min(100, urgencyScore),
      conversionProbability,
      limitingFeatures,
    };
  }

  /**
   * Create watermark configuration for free tier users
   */
  getWatermarkConfig(userTier: string): {
    enabled: boolean;
    text: string;
    position: 'bottom-right' | 'footer';
    opacity: number;
    upgradeMessage: string;
  } {
    if (userTier === 'free') {
      return {
        enabled: true,
        text: 'Created with PRISMA',
        position: 'footer',
        opacity: 0.8,
        upgradeMessage: 'Remove branding with Professional plan',
      };
    }

    return {
      enabled: false,
      text: '',
      position: 'footer',
      opacity: 0,
      upgradeMessage: '',
    };
  }

  // Private helper methods

  private getUserFeatureUsage(
    userId: string,
    feature: string,
    userTier: string
  ): FeatureUsage {
    const cached = this.userUsageCache.get(userId)?.get(feature);
    if (cached && !this.isUsageExpired(cached)) {
      return cached;
    }

    // In a real implementation, this would fetch from database
    // For now, return default usage
    const tier = BUSINESS_USER_TIERS[userTier];
    const featureConfig = tier?.features[feature];

    const usage: FeatureUsage = {
      userId,
      feature,
      count: 0,
      limit: featureConfig?.limit || 0,
      resetDate: this.calculateResetDate(
        featureConfig?.resetPeriod || 'monthly'
      ),
      tier: userTier,
      upgradePromptShown: false,
      conversionOpportunity: 0,
    };

    return usage;
  }

  private isUsageExpired(usage: FeatureUsage): boolean {
    return new Date() > usage.resetDate;
  }

  private calculateResetDate(resetPeriod: string): Date {
    const now = new Date();
    switch (resetPeriod) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }
  }

  private createUpgradeRequiredResult(
    userId: string,
    feature: string,
    userTier: string,
    featureConfig: FeatureLimit
  ): PremiumGatingResult {
    const nextTier = this.getNextTier(userTier);
    const revenueOpportunity =
      BUSINESS_USER_TIERS[nextTier]?.monthlyPrice || 29;

    return {
      allowed: false,
      reason: 'Feature not available in current tier',
      upgradeRequired: true,
      marketingMessage:
        featureConfig.marketingMessage || `Upgrade to ${nextTier} for access`,
      conversionScore: 85, // High conversion opportunity
      revenueOpportunity,
      userTier,
      nextTierBenefits: this.getNextTierBenefits(userTier),
    };
  }

  private createLimitExceededResult(
    userId: string,
    feature: string,
    userTier: string,
    featureConfig: FeatureLimit
  ): PremiumGatingResult {
    const nextTier = this.getNextTier(userTier);
    const revenueOpportunity =
      BUSINESS_USER_TIERS[nextTier]?.monthlyPrice || 29;

    return {
      allowed: false,
      reason: 'Usage limit exceeded',
      upgradeRequired: true,
      marketingMessage:
        featureConfig.marketingMessage || `Upgrade for unlimited ${feature}`,
      scarcityIndicator: featureConfig.scarcityTactic,
      conversionScore: 95, // Very high conversion opportunity
      revenueOpportunity,
      userTier,
      nextTierBenefits: this.getNextTierBenefits(userTier),
    };
  }

  private createOverageResult(options: {
    userId: string;
    feature: string;
    userTier: string;
    featureConfig: FeatureLimit;
    usage: number;
  }): PremiumGatingResult {
    const { userTier, featureConfig, usage } = options;
    const nextTier = this.getNextTier(userTier);
    const revenueOpportunity =
      BUSINESS_USER_TIERS[nextTier]?.monthlyPrice || 29;

    return {
      allowed: true,
      reason: 'Overage allowed',
      upgradeRequired: false,
      marketingMessage: `You're using ${usage}/${featureConfig.limit}. Upgrade for unlimited access.`,
      conversionScore: 70, // Good conversion opportunity
      revenueOpportunity,
      userTier,
      nextTierBenefits: this.getNextTierBenefits(userTier),
    };
  }

  private createAllowedResult(options: {
    userId: string;
    feature: string;
    userTier: string;
    featureConfig: FeatureLimit;
    usage: number;
  }): PremiumGatingResult {
    const { feature, userTier, featureConfig, usage } = options;
    const remaining = (featureConfig.limit as number) - usage;
    const isNearLimit = remaining <= 1;

    return {
      allowed: true,
      upgradeRequired: false,
      marketingMessage: isNearLimit
        ? `${remaining} ${feature} remaining this month. Upgrade for unlimited access.`
        : `${remaining} ${feature} remaining`,
      conversionScore: isNearLimit ? 60 : 20,
      revenueOpportunity: isNearLimit
        ? BUSINESS_USER_TIERS[this.getNextTier(userTier)]?.monthlyPrice || 29
        : 0,
      userTier,
      nextTierBenefits: this.getNextTierBenefits(userTier),
    };
  }

  private getNextTier(currentTier: string): string {
    const tierOrder = ['free', 'professional', 'business', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return (
      tierOrder[Math.min(currentIndex + 1, tierOrder.length - 1)] ||
      'professional'
    );
  }

  private getNextTierBenefits(currentTier: string): string[] {
    const nextTier = this.getNextTier(currentTier);
    const nextTierConfig = BUSINESS_USER_TIERS[nextTier];

    const benefits: string[] = [];
    Object.entries(nextTierConfig?.features || {}).forEach(
      ([_feature, config]) => {
        if (config.enabled && config.marketingMessage) {
          benefits.push(config.marketingMessage);
        }
      }
    );

    return benefits.slice(0, 3); // Top 3 benefits
  }

  private getKeyUpgradeBenefits(
    currentTier: string,
    nextTier: string,
    limitingFeatures: string[]
  ): string[] {
    const benefits: string[] = [];
    const nextTierConfig = BUSINESS_USER_TIERS[nextTier];

    // Prioritize benefits for limiting features
    limitingFeatures.forEach(feature => {
      const featureConfig = nextTierConfig?.features[feature];
      if (featureConfig?.marketingMessage) {
        benefits.push(featureConfig.marketingMessage);
      }
    });

    // Add general benefits
    if (benefits.length < 3) {
      const generalBenefits = this.getNextTierBenefits(currentTier);
      benefits.push(...generalBenefits.filter(b => !benefits.includes(b)));
    }

    return benefits.slice(0, 4);
  }

  private calculateConversionProbability(
    userId: string,
    userTier: string,
    urgencyScore: number,
    limitingFeaturesCount: number
  ): number {
    let probability = 0.1; // Base 10% conversion rate

    // Increase based on urgency
    probability += (urgencyScore / 100) * 0.6; // Up to 60% boost for high urgency

    // Increase based on limiting features
    probability += limitingFeaturesCount * 0.15; // 15% boost per limiting feature

    // Historical conversion tracking
    const userConversionHistory = this.conversionTracker.get(userId) || 0;
    probability += userConversionHistory * 0.1; // Boost for engaged users

    return Math.min(0.95, probability); // Cap at 95%
  }

  private async trackConversionOpportunity(
    userId: string,
    _feature: string,
    _userTier: string,
    _usage: FeatureUsage
  ): Promise<void> {
    await Promise.resolve(); // Satisfy ESLint
    const currentCount = this.conversionTracker.get(userId) || 0;
    this.conversionTracker.set(userId, currentCount + 1);

    // Conversion opportunity tracked
  }
}

/**
 * Global premium gating engine instance
 */
export const premiumGating = new PremiumGatingEngine();
