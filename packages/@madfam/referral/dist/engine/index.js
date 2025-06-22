'use strict';

var supabaseJs = require('@supabase/supabase-js');
var logger = require('../utils/logger.js');
var analytics = require('../utils/analytics.js');
var types_index = require('../types/index.js');

const DEFAULT_CONFIG = {
  fraud_detection_enabled: true,
  auto_approve_low_risk: true,
  max_referrals_per_user: 100,
  conversion_window_days: 30,
  code_length: 8,
  enable_analytics: true,
  enable_gamification: true
};
class ReferralEngine {
  constructor(supabaseUrl, supabaseKey, config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);
    this.logger = new logger.Logger("ReferralEngine");
    this.analytics = new analytics.Analytics();
  }
  /**
   * Create a new referral for a user
   */
  async createReferral(userId, request = {}) {
    try {
      this.logger.info("Creating referral", {
        userId,
        campaignId: request.campaign_id
      });
      await this.validateUserEligibility(userId, request.campaign_id);
      const campaign = await this.getActiveCampaign(request.campaign_id);
      const code = await this.generateUniqueCode();
      const { data: referral, error } = await this.supabase.from("referrals").insert({
        referrer_id: userId,
        code,
        campaign_id: campaign?.id,
        metadata: request.metadata || {},
        attribution_data: {
          click_count: 0,
          touchpoints: [],
          last_click_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        risk_score: 0,
        fraud_flags: [],
        expires_at: new Date(
          Date.now() + this.config.conversion_window_days * 24 * 60 * 60 * 1e3
        ).toISOString()
      }).select().single();
      if (error) {
        this.logger.error("Failed to create referral", { error, userId });
        throw new Error("Failed to create referral");
      }
      const shareUrl = this.generateShareUrl(code, campaign || void 0);
      await this.trackEvent({
        referral_id: referral.id,
        campaign_id: campaign?.id,
        event_type: "referral_link_generated",
        user_id: userId,
        properties: {
          campaign_name: campaign?.name,
          share_url: shareUrl
        }
      });
      if (this.config.enable_analytics) {
        await this.analytics.track(userId, "referral_link_generated", {
          referral_id: referral.id,
          campaign_id: campaign?.id,
          campaign_name: campaign?.name,
          share_url: shareUrl
        });
      }
      this.logger.info("Referral created successfully", {
        referralId: referral.id,
        code,
        userId
      });
      return {
        referral,
        share_url: shareUrl,
        share_code: code
      };
    } catch (error) {
      this.logger.error("Error creating referral", { error, userId });
      throw error;
    }
  }
  /**
   * Track referral link click with attribution
   */
  async trackReferralClick(request) {
    try {
      this.logger.info("Tracking referral click", { code: request.code });
      const { data: referral, error: referralError } = await this.supabase.from("referrals").select("*, referral_campaigns(*)").eq("code", request.code).eq("status", "pending").single();
      if (referralError || !referral) {
        this.logger.warn("Invalid or expired referral code", {
          code: request.code,
          error: referralError
        });
        throw new ReferralValidationError(
          "Invalid or expired referral code",
          "INVALID_CODE"
        );
      }
      if (/* @__PURE__ */ new Date() > new Date(referral.expires_at)) {
        await this.expireReferral(referral.id);
        throw new ReferralValidationError(
          "Referral code has expired",
          "EXPIRED_CODE"
        );
      }
      const touchpoint = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: request.attribution_data.utm_source || "direct",
        medium: request.attribution_data.utm_medium,
        campaign: request.attribution_data.utm_campaign,
        ip_address: request.attribution_data.ip_address,
        user_agent: request.attribution_data.user_agent
      };
      const updatedAttributionData = {
        ...referral.attribution_data,
        ...request.attribution_data,
        click_count: (referral.attribution_data.click_count || 0) + 1,
        last_click_at: (/* @__PURE__ */ new Date()).toISOString(),
        touchpoints: [
          ...referral.attribution_data.touchpoints || [],
          touchpoint
        ].slice(-10)
        // Keep last 10 touchpoints
      };
      await this.supabase.from("referrals").update({
        attribution_data: updatedAttributionData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", referral.id);
      await this.trackEvent({
        referral_id: referral.id,
        campaign_id: referral.campaign_id,
        event_type: "referral_link_clicked",
        properties: {
          click_count: updatedAttributionData.click_count,
          source: touchpoint.source,
          device_fingerprint: request.device_fingerprint
        },
        ip_address: request.attribution_data.ip_address,
        user_agent: request.attribution_data.user_agent,
        device_fingerprint: request.device_fingerprint
      });
      const redirectUrl = this.generateRedirectUrl(
        referral,
        request.attribution_data
      );
      this.logger.info("Referral click tracked successfully", {
        referralId: referral.id,
        clickCount: updatedAttributionData.click_count
      });
      return {
        success: true,
        referral_id: referral.id,
        redirect_url: redirectUrl,
        campaign: referral.referral_campaigns
      };
    } catch (error) {
      this.logger.error("Error tracking referral click", {
        error,
        code: request.code
      });
      throw error;
    }
  }
  /**
   * Convert a referral when referee signs up and meets criteria
   */
  async convertReferral(request) {
    try {
      this.logger.info("Converting referral", {
        code: request.code,
        refereeId: request.referee_id
      });
      const { data: referral, error: referralError } = await this.supabase.from("referrals").select("*, referral_campaigns(*)").eq("code", request.code).eq("status", "pending").single();
      if (referralError || !referral) {
        throw new ReferralValidationError(
          "Invalid referral code for conversion",
          "INVALID_CODE"
        );
      }
      if (referral.referrer_id === request.referee_id) {
        throw new ReferralValidationError(
          "Self-referral not allowed",
          "SELF_REFERRAL"
        );
      }
      const { data: existingConversion } = await this.supabase.from("referrals").select("id").eq("referee_id", request.referee_id).eq("status", "converted").single();
      if (existingConversion) {
        throw new ReferralValidationError(
          "User has already converted another referral",
          "ALREADY_CONVERTED"
        );
      }
      if (this.config.fraud_detection_enabled) {
        const fraudResult = await this.detectFraud(
          referral,
          request.referee_id
        );
        if (fraudResult.risk_level === "critical") {
          await this.markReferralFraudulent(referral.id, fraudResult);
          throw new FraudDetectionError(
            "Referral blocked due to fraud detection",
            fraudResult.risk_score,
            fraudResult.flags
          );
        }
        if (fraudResult.risk_level === "high" && !this.config.auto_approve_low_risk) {
          await this.flagForReview(referral.id, fraudResult);
          this.logger.warn("Referral flagged for manual review", {
            referralId: referral.id,
            riskScore: fraudResult.risk_score
          });
        }
      }
      const { data: updatedReferral, error: updateError } = await this.supabase.from("referrals").update({
        referee_id: request.referee_id,
        status: "converted",
        converted_at: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          ...referral.metadata,
          conversion_metadata: request.conversion_metadata
        }
      }).eq("id", referral.id).select().single();
      if (updateError) {
        this.logger.error("Failed to update referral status", {
          error: updateError,
          referralId: referral.id
        });
        throw new Error("Failed to convert referral");
      }
      const rewards = await this.calculateAndCreateRewards(
        updatedReferral,
        referral.referral_campaigns
      );
      await this.trackEvent({
        referral_id: referral.id,
        campaign_id: referral.campaign_id,
        event_type: "referral_converted",
        user_id: request.referee_id,
        properties: {
          conversion_metadata: request.conversion_metadata,
          rewards_count: rewards.length,
          total_reward_value: rewards.reduce((sum, r) => sum + r.amount, 0)
        }
      });
      if (this.config.enable_analytics) {
        await this.analytics.track(request.referee_id, "referral_converted", {
          referral_id: referral.id,
          referrer_id: referral.referrer_id,
          campaign_id: referral.campaign_id,
          rewards_earned: rewards.length,
          total_reward_value: rewards.reduce((sum, r) => sum + r.amount, 0)
        });
        await this.analytics.track(
          referral.referrer_id,
          "referral_successful",
          {
            referral_id: referral.id,
            referee_id: request.referee_id,
            campaign_id: referral.campaign_id,
            rewards_earned: rewards.filter(
              (r) => r.user_id === referral.referrer_id
            ).length
          }
        );
      }
      this.logger.info("Referral converted successfully", {
        referralId: referral.id,
        referrerId: referral.referrer_id,
        refereeId: request.referee_id,
        rewardsCreated: rewards.length
      });
      return {
        success: true,
        referral: updatedReferral,
        rewards
      };
    } catch (error) {
      this.logger.error("Error converting referral", {
        error,
        code: request.code,
        refereeId: request.referee_id
      });
      throw error;
    }
  }
  /**
   * Get user's referral statistics
   */
  async getUserReferralStats(userId) {
    try {
      const { data: stats, error } = await this.supabase.from("user_referral_stats").select("*").eq("user_id", userId).single();
      if (error && error.code !== "PGRST116") {
        this.logger.error("Failed to fetch user referral stats", {
          error,
          userId
        });
        throw new Error("Failed to fetch referral statistics");
      }
      return stats || {
        user_id: userId,
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_earned: 0,
        total_rewards_paid: 0,
        pending_rewards: 0,
        conversion_rate: 0,
        average_reward_per_referral: 0,
        referral_rank: null,
        achievement_badges: [],
        current_streak: 0,
        best_streak: 0,
        first_referral_at: null,
        last_referral_at: null,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      this.logger.error("Error fetching user referral stats", {
        error,
        userId
      });
      throw error;
    }
  }
  /**
   * Get active campaigns for user
   */
  async getActiveCampaigns(userId) {
    try {
      let query = this.supabase.from("referral_campaigns").select("*").eq("status", "active").lte("start_date", (/* @__PURE__ */ new Date()).toISOString()).order("priority", { ascending: false });
      query = query.or(
        "end_date.is.null,end_date.gte." + (/* @__PURE__ */ new Date()).toISOString()
      );
      const { data: campaigns, error } = await query;
      if (error) {
        this.logger.error("Failed to fetch active campaigns", { error });
        return [];
      }
      if (!userId) {
        return campaigns || [];
      }
      const eligibleCampaigns = [];
      for (const campaign of campaigns) {
        const isEligible = await this.checkCampaignEligibility(
          userId,
          campaign
        );
        if (isEligible) {
          eligibleCampaigns.push(campaign);
        }
      }
      return eligibleCampaigns;
    } catch (error) {
      this.logger.error("Error fetching active campaigns", { error });
      return [];
    }
  }
  // Private helper methods
  async validateUserEligibility(userId, campaignId) {
    const { data: userStats } = await this.supabase.from("user_referral_stats").select("total_referrals").eq("user_id", userId).single();
    if (userStats && userStats.total_referrals >= this.config.max_referrals_per_user) {
      throw new ReferralValidationError(
        "User has exceeded maximum referrals limit",
        "MAX_REFERRALS_EXCEEDED"
      );
    }
    if (campaignId) {
      const { data: campaign } = await this.supabase.from("referral_campaigns").select("*").eq("id", campaignId).single();
      if (campaign && !await this.checkCampaignEligibility(userId, campaign)) {
        throw new ReferralValidationError(
          "User not eligible for this campaign",
          "NOT_ELIGIBLE"
        );
      }
    }
  }
  async getActiveCampaign(campaignId) {
    if (campaignId) {
      const { data: campaign } = await this.supabase.from("referral_campaigns").select("*").eq("id", campaignId).eq("status", "active").single();
      return campaign;
    }
    const { data: defaultCampaign } = await this.supabase.from("referral_campaigns").select("*").eq("status", "active").order("priority", { ascending: false }).limit(1).single();
    return defaultCampaign;
  }
  async generateUniqueCode() {
    const maxAttempts = 10;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const code = this.generateRandomCode();
      const { data: existing } = await this.supabase.from("referrals").select("id").eq("code", code).single();
      if (!existing) {
        return code;
      }
      attempts++;
    }
    throw new Error("Failed to generate unique referral code");
  }
  generateRandomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < this.config.code_length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  generateShareUrl(code, campaign) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.madfam.io";
    const params = new URLSearchParams({
      ref: code
    });
    if (campaign) {
      params.set("campaign", campaign.id);
    }
    return `${baseUrl}/signup?${params.toString()}`;
  }
  generateRedirectUrl(referral, attributionData) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.madfam.io";
    const params = new URLSearchParams({
      ref: referral.code
    });
    if (attributionData.utm_source)
      params.set("utm_source", attributionData.utm_source);
    if (attributionData.utm_medium)
      params.set("utm_medium", attributionData.utm_medium);
    if (attributionData.utm_campaign)
      params.set("utm_campaign", attributionData.utm_campaign);
    return `${baseUrl}/signup?${params.toString()}`;
  }
  async checkCampaignEligibility(userId, campaign) {
    const rules = campaign.eligibility_rules;
    if (rules.user_tiers && rules.user_tiers.length > 0) ;
    if (rules.min_account_age_days) ;
    if (rules.excluded_user_ids && rules.excluded_user_ids.includes(userId)) {
      return false;
    }
    if (rules.max_previous_referrals !== void 0) {
      const { data: previousReferrals } = await this.supabase.from("referrals").select("id").eq("referrer_id", userId).eq("campaign_id", campaign.id);
      if (previousReferrals && previousReferrals.length >= rules.max_previous_referrals) {
        return false;
      }
    }
    return true;
  }
  async detectFraud(referral, _refereeId) {
    const flags = [];
    let riskScore = 0;
    const { data: recentReferrals } = await this.supabase.from("referrals").select("id").eq("referrer_id", referral.referrer_id).gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString()
    );
    if (recentReferrals && recentReferrals.length > 5) {
      flags.push({
        type: "velocity_abuse",
        severity: "high",
        description: "Too many referrals created in 24 hours",
        evidence: { count: recentReferrals.length }
      });
      riskScore += 30;
    }
    const attributionData = referral.attribution_data;
    if (attributionData.ip_address) {
      const { data: sameIPReferrals } = await this.supabase.from("referral_events").select("referral_id").eq("ip_address", attributionData.ip_address).neq("referral_id", referral.id);
      if (sameIPReferrals && sameIPReferrals.length > 2) {
        flags.push({
          type: "ip_address_abuse",
          severity: "medium",
          description: "Multiple referrals from same IP address",
          evidence: {
            ip_address: attributionData.ip_address,
            count: sameIPReferrals.length
          }
        });
        riskScore += 20;
      }
    }
    const deviceFingerprint = attributionData.device_fingerprint;
    if (deviceFingerprint) {
      const { data: sameDeviceReferrals } = await this.supabase.from("referral_events").select("referral_id").eq("device_fingerprint", deviceFingerprint).neq("referral_id", referral.id);
      if (sameDeviceReferrals && sameDeviceReferrals.length > 1) {
        flags.push({
          type: "device_fingerprint_match",
          severity: "high",
          description: "Multiple referrals from same device",
          evidence: { device_fingerprint: deviceFingerprint }
        });
        riskScore += 25;
      }
    }
    let riskLevel;
    if (riskScore >= 70) riskLevel = "critical";
    else if (riskScore >= 50) riskLevel = "high";
    else if (riskScore >= 30) riskLevel = "medium";
    else riskLevel = "low";
    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      flags,
      recommended_action: this.getRecommendedAction(riskLevel),
      confidence: Math.min(95, 60 + flags.length * 10)
    };
  }
  getRecommendedAction(riskLevel) {
    switch (riskLevel) {
      case "low":
        return "approve";
      case "medium":
        return "review";
      case "high":
        return "investigate";
      case "critical":
        return "reject";
    }
  }
  async markReferralFraudulent(referralId, fraudResult) {
    await this.supabase.from("referrals").update({
      status: "fraudulent",
      risk_score: fraudResult.risk_score,
      fraud_flags: fraudResult.flags.map((f) => f.type),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", referralId);
    await this.trackEvent({
      referral_id: referralId,
      event_type: "fraud_detected",
      properties: {
        risk_score: fraudResult.risk_score,
        risk_level: fraudResult.risk_level,
        flags: fraudResult.flags
      }
    });
  }
  async flagForReview(referralId, fraudResult) {
    await this.supabase.from("referrals").update({
      risk_score: fraudResult.risk_score,
      fraud_flags: fraudResult.flags.map((f) => f.type),
      metadata: {
        flagged_for_review: true,
        fraud_detection_result: fraudResult
      },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", referralId);
  }
  async expireReferral(referralId) {
    await this.supabase.from("referrals").update({
      status: "expired",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", referralId);
  }
  async calculateAndCreateRewards(referral, campaign) {
    if (!campaign) {
      return [];
    }
    const rewards = [];
    if (campaign.referrer_reward) {
      const referrerReward = await this.createReward(
        referral.referrer_id,
        referral.id,
        campaign.referrer_reward,
        "referrer"
      );
      if (referrerReward) {
        rewards.push(referrerReward);
      }
    }
    if (campaign.referee_reward && referral.referee_id) {
      const refereeReward = await this.createReward(
        referral.referee_id,
        referral.id,
        campaign.referee_reward,
        "referee"
      );
      if (refereeReward) {
        rewards.push(refereeReward);
      }
    }
    return rewards;
  }
  async createReward(userId, referralId, rewardConfig, recipientType) {
    try {
      const { data: reward, error } = await this.supabase.from("referral_rewards").insert({
        user_id: userId,
        referral_id: referralId,
        type: rewardConfig.type,
        amount: rewardConfig.amount || rewardConfig.base_amount || 0,
        currency: rewardConfig.currency || "USD",
        description: `${rewardConfig.description} (${recipientType})`,
        status: this.config.auto_approve_low_risk ? "approved" : "pending",
        expires_at: rewardConfig.expires_at
      }).select().single();
      if (error) {
        this.logger.error("Failed to create reward", {
          error,
          userId,
          referralId
        });
        return null;
      }
      await this.trackEvent({
        referral_id: referralId,
        event_type: "reward_earned",
        user_id: userId,
        properties: {
          reward_type: rewardConfig.type,
          reward_amount: reward.amount,
          recipient_type: recipientType
        }
      });
      return reward;
    } catch (error) {
      this.logger.error("Error creating reward", { error, userId, referralId });
      return null;
    }
  }
  async trackEvent(event) {
    try {
      await this.supabase.from("referral_events").insert({
        ...event,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        properties: event.properties || {}
      });
    } catch (error) {
      this.logger.error("Failed to track referral event", { error, event });
    }
  }
}
function createReferralEngine(supabaseUrl, supabaseKey, config) {
  return new ReferralEngine(supabaseUrl, supabaseKey, config);
}
const referralEngine = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[ReferralEngine] Missing Supabase credentials. Engine will not be initialized."
    );
    return null;
  }
  return new ReferralEngine(supabaseUrl, supabaseKey);
})();

exports.FraudDetectionError = types_index.FraudDetectionError;
exports.ReferralValidationError = types_index.ReferralValidationError;
exports.isValidCampaignType = types_index.isValidCampaignType;
exports.isValidReferralStatus = types_index.isValidReferralStatus;
exports.isValidRewardType = types_index.isValidRewardType;
exports.ReferralEngine = ReferralEngine;
exports.createReferralEngine = createReferralEngine;
exports.referralEngine = referralEngine;
