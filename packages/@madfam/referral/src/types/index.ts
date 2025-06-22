/**
 * @fileoverview Referral System Type Definitions
 *
 * Comprehensive type system for MADFAM's world-class referral program.
 * Designed for type safety, extensibility, and developer experience.
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */

// Core referral status types
export type ReferralStatus = 'pending' | 'converted' | 'expired' | 'fraudulent';
export type RewardStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'expired'
  | 'cancelled';
export type CampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

// Reward types
export type RewardType =
  | 'cash'
  | 'credit'
  | 'discount'
  | 'subscription_credit'
  | 'feature_unlock';
export type PayoutMethod =
  | 'stripe'
  | 'platform_credit'
  | 'subscription_discount';

// Campaign types
export type CampaignType =
  | 'double_sided'
  | 'milestone'
  | 'tiered'
  | 'seasonal'
  | 'product_specific';

// Core referral interface
export interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  code: string;
  campaign_id?: string;

  // Status and timing
  status: ReferralStatus;
  first_click_at: string;
  converted_at?: string;
  expires_at: string;

  // Tracking data
  metadata: Record<string, unknown>;
  attribution_data: AttributionData;

  // Fraud detection
  risk_score: number;
  fraud_flags: string[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Attribution tracking data
export interface AttributionData {
  // Source tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;

  // Technical tracking
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;

  // Location data
  country?: string;
  city?: string;

  // Session data
  session_id?: string;
  click_count: number;
  last_click_at: string;

  // Conversion path
  touchpoints: TouchPoint[];
}

// Touch point in attribution journey
export interface TouchPoint {
  timestamp: string;
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  ip_address?: string;
  user_agent?: string;
}

// Referral reward interface
export interface ReferralReward {
  id: string;
  user_id: string;
  referral_id: string;

  // Reward details
  type: RewardType;
  amount: number;
  currency: string;
  description: string;

  // Processing
  status: RewardStatus;
  payout_method?: PayoutMethod;
  external_payout_id?: string;

  // Timing
  expires_at?: string;
  redeemed_at?: string;
  created_at: string;
  updated_at: string;
}

// Campaign configuration
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

// Campaign configuration types
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

// Eligibility rules
export interface EligibilityRules {
  user_tiers?: string[];
  min_account_age_days?: number;
  excluded_user_ids?: string[];
  required_features?: string[];
  geographic_restrictions?: string[];
  max_previous_referrals?: number;
}

// Reward configuration
export interface RewardConfiguration {
  type: RewardType;
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

// Referral events for analytics
export interface ReferralEvent {
  id: string;
  referral_id?: string;
  campaign_id?: string;

  // Event details
  event_type: ReferralEventType;
  event_source?: string;

  // User and session
  user_id?: string;
  session_id?: string;

  // Technical tracking
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;

  // Properties and context
  properties: Record<string, unknown>;
  device_fingerprint?: string;
  country?: string;
  city?: string;

  // Timestamp
  timestamp: string;
}

export type ReferralEventType =
  | 'referral_link_generated'
  | 'referral_link_clicked'
  | 'referral_signup_started'
  | 'referral_signup_completed'
  | 'referral_converted'
  | 'reward_earned'
  | 'reward_redeemed'
  | 'fraud_detected'
  | 'campaign_exposure'
  | 'share_action';

// User referral statistics
export interface UserReferralStats {
  user_id: string;

  // Referral counts
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;

  // Rewards
  total_rewards_earned: number;
  total_rewards_paid: number;
  pending_rewards: number;

  // Performance metrics
  conversion_rate: number;
  average_reward_per_referral: number;

  // Gamification
  referral_rank?: number;
  achievement_badges: string[];
  current_streak: number;
  best_streak: number;

  // Timestamps
  first_referral_at?: string;
  last_referral_at?: string;
  updated_at: string;
}

// API request/response types
export interface CreateReferralRequest {
  campaign_id?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateReferralResponse {
  referral: Referral;
  share_url: string;
  share_code: string;
}

export interface TrackReferralClickRequest {
  code: string;
  attribution_data: Partial<AttributionData>;
  device_fingerprint?: string;
}

export interface TrackReferralClickResponse {
  success: boolean;
  referral_id: string;
  redirect_url: string;
  campaign?: ReferralCampaign;
}

export interface ConvertReferralRequest {
  code: string;
  referee_id: string;
  conversion_metadata?: Record<string, unknown>;
}

export interface ConvertReferralResponse {
  success: boolean;
  referral: Referral;
  rewards: ReferralReward[];
}

// Analytics and reporting types
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

// Fraud detection types
export interface FraudDetectionResult {
  risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  recommended_action: 'approve' | 'review' | 'reject' | 'investigate';
  confidence: number;
}

export interface FraudFlag {
  type: FraudFlagType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, unknown>;
}

export type FraudFlagType =
  | 'velocity_abuse'
  | 'similarity_pattern'
  | 'device_fingerprint_match'
  | 'ip_address_abuse'
  | 'email_pattern_suspicious'
  | 'user_agent_suspicious'
  | 'geographic_anomaly'
  | 'payment_method_risk'
  | 'behavioral_anomaly'
  | 'ml_model_flag';

// Sharing and distribution types
export interface ShareConfiguration {
  channels: ShareChannel[];
  custom_message?: string;
  tracking_parameters: Record<string, string>;
  branding: BrandingConfig;
}

export interface ShareChannel {
  platform: SharePlatform;
  enabled: boolean;
  custom_message?: string;
  template?: string;
  auto_tracking?: boolean;
}

export type SharePlatform =
  | 'email'
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'whatsapp'
  | 'telegram'
  | 'copy_link'
  | 'qr_code'
  | 'sms';

export interface BrandingConfig {
  logo_url?: string;
  brand_color?: string;
  custom_domain?: string;
  watermark_enabled: boolean;
}

// Gamification types
export interface GamificationConfig {
  leaderboard_enabled: boolean;
  badges_enabled: boolean;
  streak_tracking: boolean;
  achievement_notifications: boolean;
  social_proof: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_url?: string;
  badge_color?: string;
  criteria: AchievementCriteria;
  reward?: RewardConfiguration;
}

export interface AchievementCriteria {
  type: 'referral_count' | 'conversion_rate' | 'streak' | 'revenue_generated';
  threshold: number;
  timeframe?: string; // e.g., 'monthly', 'weekly'
}

// Error types
export interface ReferralError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ReferralValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ReferralValidationError';
  }
}

export class FraudDetectionError extends Error {
  constructor(
    message: string,
    public riskScore: number,
    public flags: FraudFlag[]
  ) {
    super(message);
    this.name = 'FraudDetectionError';
  }
}

// Utility types
export type ReferralEngineConfig = {
  default_campaign_id?: string;
  fraud_detection_enabled: boolean;
  auto_approve_low_risk: boolean;
  max_referrals_per_user: number;
  conversion_window_days: number;
  code_length: number;
  enable_analytics: boolean;
  enable_gamification: boolean;
};

export type DatabaseConfig = {
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_key: string;
};

export type AnalyticsConfig = {
  posthog_project_id?: string;
  posthog_api_key?: string;
  custom_analytics_endpoint?: string;
  enable_detailed_tracking: boolean;
};

// Export utility type guards
export function isValidReferralStatus(
  status: string
): status is ReferralStatus {
  return ['pending', 'converted', 'expired', 'fraudulent'].includes(status);
}

export function isValidRewardType(type: string): type is RewardType {
  return [
    'cash',
    'credit',
    'discount',
    'subscription_credit',
    'feature_unlock',
  ].includes(type);
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

// Re-export all types
export * from './referral';
export * from './campaign';
export * from './reward';
export * from './analytics';
export * from './fraud';
export * from './gamification';
export * from './config';
