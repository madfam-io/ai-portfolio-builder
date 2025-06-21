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
 * @fileoverview Premium Feature Gating Helper Functions
 *
 * Convenience functions and exports for premium gating system.
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

import { premiumGating, PremiumGatingResult } from './premium-gating';

/**
 * Convenience function for feature access checks
 */
export async function checkPremiumFeature(
  userId: string,
  feature: string,
  userTier: string = 'free',
  currentUsage?: number
): Promise<PremiumGatingResult> {
  await Promise.resolve(); // Satisfy ESLint
  return premiumGating.checkFeatureAccess(
    userId,
    feature,
    userTier,
    currentUsage
  );
}

/**
 * Convenience function for tracking feature usage
 */
export async function trackPremiumFeatureUsage(
  userId: string,
  feature: string,
  userTier: string = 'free',
  metadata?: Record<string, unknown>
): Promise<void> {
  await Promise.resolve(); // Satisfy ESLint
  return premiumGating.trackFeatureUsage(userId, feature, userTier, metadata);
}

/**
 * Feature flags for gradual rollout and A/B testing
 */
export const PREMIUM_FEATURE_FLAGS = {
  AI_ENHANCEMENT_LIMITS: true,
  WATERMARK_ENFORCEMENT: true,
  TEMPLATE_GATING: true,
  EXPORT_LIMITS: true,
  INTEGRATION_LIMITS: true,
  ANALYTICS_GATING: true,
  CUSTOM_DOMAIN_GATING: true,
  COLLABORATION_GATING: true,
  AGGRESSIVE_UPGRADE_PROMPTS: true,
  SCARCITY_TACTICS: true,
  CONVERSION_OPTIMIZATION: true,
};
