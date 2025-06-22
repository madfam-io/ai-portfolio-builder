import { ReferralEngineConfig, CreateReferralRequest, CreateReferralResponse, TrackReferralClickRequest, TrackReferralClickResponse, ConvertReferralRequest, ConvertReferralResponse, UserReferralStats, ReferralCampaign } from '../types/index.js';
export { Achievement, AchievementCriteria, AnalyticsConfig, AttributionData, BrandingConfig, CampaignConfig, CampaignPerformance, CampaignStatus, CampaignType, DailyMetric, DatabaseConfig, DateRange, EligibilityRules, FraudDetectionError, FraudDetectionResult, FraudFlag, FraudFlagType, GamificationConfig, GeographicMetric, Milestone, PayoutMethod, Referral, ReferralAnalytics, ReferralError, ReferralEvent, ReferralEventType, ReferralReward, ReferralStatus, ReferralValidationError, RewardCondition, RewardConfiguration, RewardStatus, RewardTier, RewardType, ShareChannel, ShareConfiguration, SharePlatform, TopReferrer, TouchPoint, isValidCampaignType, isValidReferralStatus, isValidRewardType } from '../types/index.js';

/**
 * Core Referral Engine
 *
 * World-class referral tracking engine that powers viral growth through:
 * - Intelligent attribution tracking with multi-touch support
 * - Advanced fraud detection using ML and behavioral analysis
 * - Real-time reward calculation and optimization
 * - Comprehensive analytics and performance monitoring
 * - Seamless integration with existing infrastructure
 *
 * This engine is designed to scale to millions of referrals while maintaining
 * sub-100ms response times and 99.9% accuracy in attribution.
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */

/**
 * Core Referral Engine - The heart of MADFAM's viral growth system
 */
declare class ReferralEngine {
    private config;
    private supabase;
    private logger;
    private analytics;
    constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<ReferralEngineConfig>);
    /**
     * Create a new referral for a user
     */
    createReferral(userId: string, request?: CreateReferralRequest): Promise<CreateReferralResponse>;
    /**
     * Track referral link click with attribution
     */
    trackReferralClick(request: TrackReferralClickRequest): Promise<TrackReferralClickResponse>;
    /**
     * Convert a referral when referee signs up and meets criteria
     */
    convertReferral(request: ConvertReferralRequest): Promise<ConvertReferralResponse>;
    /**
     * Get user's referral statistics
     */
    getUserReferralStats(userId: string): Promise<UserReferralStats>;
    /**
     * Get active campaigns for user
     */
    getActiveCampaigns(userId?: string): Promise<ReferralCampaign[]>;
    private validateUserEligibility;
    private getActiveCampaign;
    private generateUniqueCode;
    private generateRandomCode;
    private generateShareUrl;
    private generateRedirectUrl;
    private checkCampaignEligibility;
    private detectFraud;
    private getRecommendedAction;
    private markReferralFraudulent;
    private flagForReview;
    private expireReferral;
    private calculateAndCreateRewards;
    private createReward;
    private trackEvent;
}
/**
 * Create a referral engine instance
 */
declare function createReferralEngine(supabaseUrl: string, supabaseKey: string, config?: Partial<ReferralEngineConfig>): ReferralEngine;
/**
 * Global referral engine instance (requires environment variables)
 */
declare const referralEngine: ReferralEngine | null;

export { ConvertReferralRequest, ConvertReferralResponse, CreateReferralRequest, CreateReferralResponse, ReferralCampaign, ReferralEngine, ReferralEngineConfig, TrackReferralClickRequest, TrackReferralClickResponse, UserReferralStats, createReferralEngine, referralEngine };
