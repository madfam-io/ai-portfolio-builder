/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Campaign types
 */

export type CampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type CampaignType =
  | 'double_sided'
  | 'milestone'
  | 'tiered'
  | 'seasonal'
  | 'product_specific';

export interface ReferralCampaign {
  id: string;
  name: string;
  description?: string;

  // Campaign configuration
  type: CampaignType;
  config: CampaignConfig;

  // Targeting
  target_segments: string[];
  eligibility_rules: EligibilityRules;

  // Rewards
  referrer_reward: RewardConfiguration;
  referee_reward: RewardConfiguration;

  // Timing and budget
  start_date: string;
  end_date?: string;
  budget?: number;
  spent: number;
  max_referrals_per_user?: number;

  // Status and optimization
  status: CampaignStatus;
  priority: number;
  experiment_id?: string;
  experiment_variant?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CampaignConfig {
  max_referrals_per_user?: number;
  conversion_window_days?: number;
  fraud_detection_enabled?: boolean;
  auto_approve_rewards?: boolean;

  // Milestone campaign specific
  milestones?: Milestone[];

  // Tiered campaign specific
  tiers?: RewardTier[];

  // Seasonal campaign specific
  seasonal_multiplier?: number;
  peak_periods?: DateRange[];

  // Product specific
  target_features?: string[];
  required_actions?: string[];
}

export interface Milestone {
  referrals: number;
  bonus_multiplier: number;
  badge?: string;
  title?: string;
}

export interface RewardTier {
  min_referrals: number;
  max_referrals?: number;
  multiplier: number;
  bonus_amount?: number;
}

export interface DateRange {
  start: string;
  end: string;
  multiplier?: number;
}

export interface EligibilityRules {
  user_tiers?: string[];
  min_account_age_days?: number;
  excluded_user_ids?: string[];
  required_features?: string[];
  geographic_restrictions?: string[];
  max_previous_referrals?: number;
}

export interface RewardConfiguration {
  type: string; // From reward types
  amount?: number;
  base_amount?: number;
  currency: string;
  description: string;

  // Discount specific
  discount_percentage?: number;
  discount_duration_months?: number;

  // Feature unlock specific
  feature_ids?: string[];
  unlock_duration_days?: number;

  // Conditional rewards
  conditions?: RewardCondition[];
}

export interface RewardCondition {
  condition_type: 'user_tier' | 'signup_date' | 'feature_usage' | 'geographic';
  condition_value: string | number;
  reward_modifier: number; // Multiplier or addition
}

export function isValidCampaignType(type: string): type is CampaignType {
  return [
    'double_sided',
    'milestone',
    'tiered',
    'seasonal',
    'product_specific',
  ].includes(type);
}
