export { ReferralEngine, createReferralEngine, referralEngine } from './engine/index.js';
export { ReferralDashboard } from './components/ReferralDashboard.js';
export { ShareHub } from './components/ShareHub.js';
export { RewardHistory } from './components/RewardHistory.js';
export { CampaignSelector } from './components/CampaignSelector.js';
export { ReferralStats } from './components/ReferralStats.js';
export { ShareContent, UseReferralActions, UseReferralState, useReferral } from './hooks/useReferral.js';
export { useReferralCampaigns } from './hooks/useReferralCampaigns.js';
export { useReferralStats } from './hooks/useReferralStats.js';
export { useReferralShare } from './hooks/useReferralShare.js';
export { Achievement, AchievementCriteria, AnalyticsConfig, AttributionData, BrandingConfig, CampaignConfig, CampaignPerformance, CampaignStatus, CampaignType, ConvertReferralRequest, ConvertReferralResponse, CreateReferralRequest, CreateReferralResponse, DailyMetric, DatabaseConfig, DateRange, EligibilityRules, FraudDetectionError, FraudDetectionResult, FraudFlag, FraudFlagType, GamificationConfig, GeographicMetric, Milestone, PayoutMethod, Referral, ReferralAnalytics, ReferralCampaign, ReferralEngineConfig, ReferralError, ReferralEvent, ReferralEventType, ReferralReward, ReferralStatus, ReferralValidationError, RewardCondition, RewardConfiguration, RewardStatus, RewardTier, RewardType, ShareChannel, ShareConfiguration, SharePlatform, TopReferrer, TouchPoint, TrackReferralClickRequest, TrackReferralClickResponse, UserReferralStats, isValidCampaignType, isValidReferralStatus, isValidRewardType } from './types/index.js';
export { Logger } from './utils/logger.js';
export { Analytics, AnalyticsEvent } from './utils/analytics.js';

/**
 * @madfam/referral - World-class referral system for viral growth
 *
 * Build powerful referral programs with fraud detection, analytics, and gamification.
 *
 * @packageDocumentation
 */

declare const VERSION = "1.0.0";
declare const PACKAGE_NAME = "@madfam/referral";

export { PACKAGE_NAME, VERSION };
