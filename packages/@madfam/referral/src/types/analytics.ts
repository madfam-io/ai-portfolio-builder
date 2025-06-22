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