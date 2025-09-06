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
 * @fileoverview Core Referral Engine - Temporarily Disabled
 * 
 * This module is being refactored to match the updated Prisma schema.
 * The original implementation has been backed up to engine.ts.bak
 */

export class ReferralEngine {
  constructor() {
    console.warn('ReferralEngine is temporarily disabled for refactoring');
  }

  // Placeholder methods to prevent import errors
  async createReferralCode() {
    throw new Error('ReferralEngine is temporarily disabled');
  }

  async processReferral() {
    throw new Error('ReferralEngine is temporarily disabled');
  }

  async trackReferral() {
    throw new Error('ReferralEngine is temporarily disabled');
  }

  async calculateRewards() {
    throw new Error('ReferralEngine is temporarily disabled');
  }
}

// Export placeholder types to prevent import errors
export interface ReferralConfig {
  enabled: boolean;
}

export interface ReferralMetrics {
  totalReferrals: number;
  conversionRate: number;
}

export const defaultReferralConfig: ReferralConfig = {
  enabled: false
};