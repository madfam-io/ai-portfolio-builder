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
 * Analytics types
 */

export interface ReferralAnalytics {
  period: {
    start: string;
    end: string;
  };

  // Growth metrics
  total_referrals: number;
  successful_referrals: number;
  conversion_rate: number;
  viral_coefficient: number;

  // Revenue metrics
  total_rewards_paid: number;
  average_reward_per_referral: number;
  cost_per_acquisition: number;
  roi: number;

  // Quality metrics
  referee_ltv_ratio: number; // vs organic users
  referrer_retention_boost: number;
  fraud_rate: number;

  // Performance by campaign
  campaign_performance: CampaignPerformance[];

  // Trends and insights
  daily_metrics: DailyMetric[];
  top_referrers: TopReferrer[];
  geographic_breakdown: GeographicMetric[];
}

export interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  referrals: number;
  conversions: number;
  conversion_rate: number;
  total_rewards: number;
  roi: number;
  fraud_rate: number;
}

export interface DailyMetric {
  date: string;
  referrals: number;
  conversions: number;
  rewards_paid: number;
  unique_referrers: number;
}

export interface TopReferrer {
  user_id: string;
  total_referrals: number;
  successful_referrals: number;
  total_rewards: number;
  conversion_rate: number;
}

export interface GeographicMetric {
  country: string;
  referrals: number;
  conversions: number;
  conversion_rate: number;
  average_reward: number;
}
