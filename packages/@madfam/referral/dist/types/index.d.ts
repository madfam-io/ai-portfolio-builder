/**
 * @fileoverview Referral System Type Definitions
 *
 * Comprehensive type system for MADFAM's world-class referral program.
 * Designed for type safety, extensibility, and developer experience.
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */
type ReferralStatus = 'pending' | 'converted' | 'expired' | 'fraudulent';
type RewardStatus = 'pending' | 'approved' | 'paid' | 'expired' | 'cancelled';
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
type RewardType = 'cash' | 'credit' | 'discount' | 'subscription_credit' | 'feature_unlock';
type PayoutMethod = 'stripe' | 'platform_credit' | 'subscription_discount';
type CampaignType = 'double_sided' | 'milestone' | 'tiered' | 'seasonal' | 'product_specific';
interface Referral {
    id: string;
    referrer_id: string;
    referee_id?: string;
    code: string;
    campaign_id?: string;
    status: ReferralStatus;
    first_click_at: string;
    converted_at?: string;
    expires_at: string;
    metadata: Record<string, unknown>;
    attribution_data: AttributionData;
    risk_score: number;
    fraud_flags: string[];
    created_at: string;
    updated_at: string;
}
interface AttributionData {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
    ip_address?: string;
    user_agent?: string;
    device_fingerprint?: string;
    country?: string;
    city?: string;
    session_id?: string;
    click_count: number;
    last_click_at: string;
    touchpoints: TouchPoint[];
}
interface TouchPoint {
    timestamp: string;
    source: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    ip_address?: string;
    user_agent?: string;
}
interface ReferralReward {
    id: string;
    user_id: string;
    referral_id: string;
    type: RewardType;
    amount: number;
    currency: string;
    description: string;
    status: RewardStatus;
    payout_method?: PayoutMethod;
    external_payout_id?: string;
    expires_at?: string;
    redeemed_at?: string;
    created_at: string;
    updated_at: string;
}
interface ReferralCampaign {
    id: string;
    name: string;
    description?: string;
    type: CampaignType;
    config: CampaignConfig;
    target_segments: string[];
    eligibility_rules: EligibilityRules;
    referrer_reward: RewardConfiguration;
    referee_reward: RewardConfiguration;
    start_date: string;
    end_date?: string;
    budget?: number;
    spent: number;
    max_referrals_per_user?: number;
    status: CampaignStatus;
    priority: number;
    experiment_id?: string;
    experiment_variant?: string;
    created_at: string;
    updated_at: string;
}
interface CampaignConfig {
    max_referrals_per_user?: number;
    conversion_window_days?: number;
    fraud_detection_enabled?: boolean;
    auto_approve_rewards?: boolean;
    milestones?: Milestone[];
    tiers?: RewardTier[];
    seasonal_multiplier?: number;
    peak_periods?: DateRange[];
    target_features?: string[];
    required_actions?: string[];
}
interface Milestone {
    referrals: number;
    bonus_multiplier: number;
    badge?: string;
    title?: string;
}
interface RewardTier {
    min_referrals: number;
    max_referrals?: number;
    multiplier: number;
    bonus_amount?: number;
}
interface DateRange {
    start: string;
    end: string;
    multiplier?: number;
}
interface EligibilityRules {
    user_tiers?: string[];
    min_account_age_days?: number;
    excluded_user_ids?: string[];
    required_features?: string[];
    geographic_restrictions?: string[];
    max_previous_referrals?: number;
}
interface RewardConfiguration {
    type: RewardType;
    amount?: number;
    base_amount?: number;
    currency: string;
    description: string;
    discount_percentage?: number;
    discount_duration_months?: number;
    feature_ids?: string[];
    unlock_duration_days?: number;
    conditions?: RewardCondition[];
}
interface RewardCondition {
    condition_type: 'user_tier' | 'signup_date' | 'feature_usage' | 'geographic';
    condition_value: string | number;
    reward_modifier: number;
}
interface ReferralEvent {
    id: string;
    referral_id?: string;
    campaign_id?: string;
    event_type: ReferralEventType;
    event_source?: string;
    user_id?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
    referer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    properties: Record<string, unknown>;
    device_fingerprint?: string;
    country?: string;
    city?: string;
    timestamp: string;
}
type ReferralEventType = 'referral_link_generated' | 'referral_link_clicked' | 'referral_signup_started' | 'referral_signup_completed' | 'referral_converted' | 'reward_earned' | 'reward_redeemed' | 'fraud_detected' | 'campaign_exposure' | 'share_action';
interface UserReferralStats {
    user_id: string;
    total_referrals: number;
    successful_referrals: number;
    pending_referrals: number;
    total_rewards_earned: number;
    total_rewards_paid: number;
    pending_rewards: number;
    conversion_rate: number;
    average_reward_per_referral: number;
    referral_rank?: number;
    achievement_badges: string[];
    current_streak: number;
    best_streak: number;
    first_referral_at?: string;
    last_referral_at?: string;
    updated_at: string;
}
interface CreateReferralRequest {
    campaign_id?: string;
    metadata?: Record<string, unknown>;
}
interface CreateReferralResponse {
    referral: Referral;
    share_url: string;
    share_code: string;
}
interface TrackReferralClickRequest {
    code: string;
    attribution_data: Partial<AttributionData>;
    device_fingerprint?: string;
}
interface TrackReferralClickResponse {
    success: boolean;
    referral_id: string;
    redirect_url: string;
    campaign?: ReferralCampaign;
}
interface ConvertReferralRequest {
    code: string;
    referee_id: string;
    conversion_metadata?: Record<string, unknown>;
}
interface ConvertReferralResponse {
    success: boolean;
    referral: Referral;
    rewards: ReferralReward[];
}
interface ReferralAnalytics {
    period: {
        start: string;
        end: string;
    };
    total_referrals: number;
    successful_referrals: number;
    conversion_rate: number;
    viral_coefficient: number;
    total_rewards_paid: number;
    average_reward_per_referral: number;
    cost_per_acquisition: number;
    roi: number;
    referee_ltv_ratio: number;
    referrer_retention_boost: number;
    fraud_rate: number;
    campaign_performance: CampaignPerformance[];
    daily_metrics: DailyMetric[];
    top_referrers: TopReferrer[];
    geographic_breakdown: GeographicMetric[];
}
interface CampaignPerformance {
    campaign_id: string;
    campaign_name: string;
    referrals: number;
    conversions: number;
    conversion_rate: number;
    total_rewards: number;
    roi: number;
    fraud_rate: number;
}
interface DailyMetric {
    date: string;
    referrals: number;
    conversions: number;
    rewards_paid: number;
    unique_referrers: number;
}
interface TopReferrer {
    user_id: string;
    total_referrals: number;
    successful_referrals: number;
    total_rewards: number;
    conversion_rate: number;
}
interface GeographicMetric {
    country: string;
    referrals: number;
    conversions: number;
    conversion_rate: number;
    average_reward: number;
}
interface FraudDetectionResult {
    risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    flags: FraudFlag[];
    recommended_action: 'approve' | 'review' | 'reject' | 'investigate';
    confidence: number;
}
interface FraudFlag {
    type: FraudFlagType;
    severity: 'low' | 'medium' | 'high';
    description: string;
    evidence: Record<string, unknown>;
}
type FraudFlagType = 'velocity_abuse' | 'similarity_pattern' | 'device_fingerprint_match' | 'ip_address_abuse' | 'email_pattern_suspicious' | 'user_agent_suspicious' | 'geographic_anomaly' | 'payment_method_risk' | 'behavioral_anomaly' | 'ml_model_flag';
interface ShareConfiguration {
    channels: ShareChannel[];
    custom_message?: string;
    tracking_parameters: Record<string, string>;
    branding: BrandingConfig;
}
interface ShareChannel {
    platform: SharePlatform;
    enabled: boolean;
    custom_message?: string;
    template?: string;
    auto_tracking?: boolean;
}
type SharePlatform = 'email' | 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'telegram' | 'copy_link' | 'qr_code' | 'sms';
interface BrandingConfig {
    logo_url?: string;
    brand_color?: string;
    custom_domain?: string;
    watermark_enabled: boolean;
}
interface GamificationConfig {
    leaderboard_enabled: boolean;
    badges_enabled: boolean;
    streak_tracking: boolean;
    achievement_notifications: boolean;
    social_proof: boolean;
}
interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_url?: string;
    badge_color?: string;
    criteria: AchievementCriteria;
    reward?: RewardConfiguration;
}
interface AchievementCriteria {
    type: 'referral_count' | 'conversion_rate' | 'streak' | 'revenue_generated';
    threshold: number;
    timeframe?: string;
}
interface ReferralError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
declare class ReferralValidationError extends Error {
    code: string;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
}
declare class FraudDetectionError extends Error {
    riskScore: number;
    flags: FraudFlag[];
    constructor(message: string, riskScore: number, flags: FraudFlag[]);
}
type ReferralEngineConfig = {
    default_campaign_id?: string;
    fraud_detection_enabled: boolean;
    auto_approve_low_risk: boolean;
    max_referrals_per_user: number;
    conversion_window_days: number;
    code_length: number;
    enable_analytics: boolean;
    enable_gamification: boolean;
};
type DatabaseConfig = {
    supabase_url: string;
    supabase_anon_key: string;
    supabase_service_key: string;
};
type AnalyticsConfig = {
    posthog_project_id?: string;
    posthog_api_key?: string;
    custom_analytics_endpoint?: string;
    enable_detailed_tracking: boolean;
};
declare function isValidReferralStatus(status: string): status is ReferralStatus;
declare function isValidRewardType(type: string): type is RewardType;
declare function isValidCampaignType(type: string): type is CampaignType;

export { FraudDetectionError, ReferralValidationError, isValidCampaignType, isValidReferralStatus, isValidRewardType };
export type { Achievement, AchievementCriteria, AnalyticsConfig, AttributionData, BrandingConfig, CampaignConfig, CampaignPerformance, CampaignStatus, CampaignType, ConvertReferralRequest, ConvertReferralResponse, CreateReferralRequest, CreateReferralResponse, DailyMetric, DatabaseConfig, DateRange, EligibilityRules, FraudDetectionResult, FraudFlag, FraudFlagType, GamificationConfig, GeographicMetric, Milestone, PayoutMethod, Referral, ReferralAnalytics, ReferralCampaign, ReferralEngineConfig, ReferralError, ReferralEvent, ReferralEventType, ReferralReward, ReferralStatus, RewardCondition, RewardConfiguration, RewardStatus, RewardTier, RewardType, ShareChannel, ShareConfiguration, SharePlatform, TopReferrer, TouchPoint, TrackReferralClickRequest, TrackReferralClickResponse, UserReferralStats };
