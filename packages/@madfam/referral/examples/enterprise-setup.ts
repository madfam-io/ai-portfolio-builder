/**
 * Enterprise setup example with advanced features
 */

import { createReferralEngine, ReferralEngine } from '@madfam/referral';
import type {
  ReferralCampaign,
  FraudDetectionResult,
  ReferralAnalytics,
} from '@madfam/referral';

class EnterpriseReferralSystem {
  private engine: ReferralEngine;
  private webhookUrl: string;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    webhookUrl: string
  ) {
    this.webhookUrl = webhookUrl;
    
    // Initialize with enterprise configuration
    this.engine = createReferralEngine(supabaseUrl, supabaseKey, {
      fraud_detection_enabled: true,
      auto_approve_low_risk: false, // Manual approval for enterprise
      max_referrals_per_user: 1000,
      conversion_window_days: 90,
      code_length: 10,
      enable_analytics: true,
      enable_gamification: true,
    });
  }

  /**
   * Create an enterprise B2B campaign
   */
  async createB2BCampaign(): Promise<ReferralCampaign> {
    const campaign: Partial<ReferralCampaign> = {
      name: 'Enterprise Partner Program',
      description: 'Refer enterprise clients and earn substantial rewards',
      type: 'tiered',
      config: {
        fraud_detection_enabled: true,
        auto_approve_rewards: false,
        tiers: [
          {
            min_referrals: 1,
            max_referrals: 5,
            multiplier: 1,
            bonus_amount: 500,
          },
          {
            min_referrals: 6,
            max_referrals: 15,
            multiplier: 1.5,
            bonus_amount: 1000,
          },
          {
            min_referrals: 16,
            multiplier: 2,
            bonus_amount: 2500,
          },
        ],
        required_actions: ['enterprise_demo', 'contract_signed'],
      },
      referrer_reward: {
        type: 'cash',
        base_amount: 5000,
        currency: 'USD',
        description: 'Enterprise referral commission',
        conditions: [
          {
            condition_type: 'user_tier',
            condition_value: 'enterprise',
            reward_modifier: 1.5,
          },
          {
            condition_type: 'geographic',
            condition_value: 'US',
            reward_modifier: 1.2,
          },
        ],
      },
      referee_reward: {
        type: 'subscription_credit',
        amount: 10000,
        currency: 'USD',
        description: 'Enterprise onboarding credit',
        discount_duration_months: 3,
      },
      eligibility_rules: {
        user_tiers: ['enterprise', 'partner'],
        min_account_age_days: 30,
        required_features: ['verified_business'],
        geographic_restrictions: ['US', 'CA', 'UK', 'EU'],
      },
      budget: 1000000,
      status: 'active',
      priority: 100,
    };

    // In a real scenario, this would create the campaign in your database
    console.log('Creating enterprise campaign:', campaign);
    return campaign as ReferralCampaign;
  }

  /**
   * Advanced fraud detection with custom rules
   */
  async performEnhancedFraudCheck(
    referralId: string,
    additionalData: any
  ): Promise<FraudDetectionResult> {
    // Get basic fraud detection from engine
    const basicResult = await this.engine.getUserReferralStats(referralId);
    
    // Add enterprise-specific checks
    const enhancedChecks = {
      corporate_email_verified: this.verifyCorporateEmail(additionalData.email),
      company_domain_valid: this.validateCompanyDomain(additionalData.domain),
      linkedin_profile_verified: await this.verifyLinkedInProfile(additionalData.linkedin),
      business_registration_valid: await this.checkBusinessRegistration(additionalData.company),
    };

    // Calculate enhanced risk score
    let riskScore = 0;
    if (!enhancedChecks.corporate_email_verified) riskScore += 25;
    if (!enhancedChecks.company_domain_valid) riskScore += 20;
    if (!enhancedChecks.linkedin_profile_verified) riskScore += 15;
    if (!enhancedChecks.business_registration_valid) riskScore += 30;

    const riskLevel = 
      riskScore >= 70 ? 'critical' :
      riskScore >= 50 ? 'high' :
      riskScore >= 30 ? 'medium' : 'low';

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      flags: [],
      recommended_action: riskLevel === 'low' ? 'approve' : 'review',
      confidence: 85,
    };
  }

  /**
   * Analytics dashboard data
   */
  async getEnterpriseAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<ReferralAnalytics> {
    // Mock analytics data - in production, this would query your analytics DB
    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total_referrals: 1250,
      successful_referrals: 375,
      conversion_rate: 0.30,
      viral_coefficient: 2.1,
      total_rewards_paid: 1875000,
      average_reward_per_referral: 5000,
      cost_per_acquisition: 5000,
      roi: 3.5,
      referee_ltv_ratio: 1.4,
      referrer_retention_boost: 0.25,
      fraud_rate: 0.02,
      campaign_performance: [
        {
          campaign_id: 'enterprise-2024',
          campaign_name: 'Enterprise Partner Program',
          referrals: 450,
          conversions: 135,
          conversion_rate: 0.30,
          total_rewards: 675000,
          roi: 4.2,
          fraud_rate: 0.01,
        },
      ],
      daily_metrics: [],
      top_referrers: [
        {
          user_id: 'partner-001',
          total_referrals: 45,
          successful_referrals: 18,
          total_rewards: 90000,
          conversion_rate: 0.40,
        },
      ],
      geographic_breakdown: [
        {
          country: 'US',
          referrals: 750,
          conversions: 225,
          conversion_rate: 0.30,
          average_reward: 5000,
        },
      ],
    };
  }

  /**
   * Webhook integration for real-time events
   */
  async sendWebhook(event: string, data: any): Promise<void> {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': new Date().toISOString(),
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }

  /**
   * Automated reward approval workflow
   */
  async processRewardApproval(rewardId: string): Promise<boolean> {
    // Get reward details
    const reward = await this.getRewardDetails(rewardId);
    
    // Check approval criteria
    const criteria = {
      fraud_check_passed: reward.fraud_score < 30,
      amount_within_limits: reward.amount <= 10000,
      referee_verified: reward.referee_verified,
      conversion_validated: reward.conversion_validated,
    };

    const autoApprove = Object.values(criteria).every(Boolean);

    if (autoApprove) {
      await this.approveReward(rewardId);
      await this.sendWebhook('reward.approved', { rewardId, criteria });
      return true;
    } else {
      await this.flagForManualReview(rewardId, criteria);
      await this.sendWebhook('reward.review_required', { rewardId, criteria });
      return false;
    }
  }

  // Helper methods
  private verifyCorporateEmail(email: string): boolean {
    const corporateDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    const domain = email.split('@')[1];
    return !corporateDomains.includes(domain);
  }

  private validateCompanyDomain(domain: string): boolean {
    // Check if domain exists and has proper DNS records
    return domain.length > 0 && !domain.includes('temp');
  }

  private async verifyLinkedInProfile(linkedinUrl: string): Promise<boolean> {
    // Mock verification - in production, use LinkedIn API
    return linkedinUrl.includes('linkedin.com/company/');
  }

  private async checkBusinessRegistration(company: string): Promise<boolean> {
    // Mock check - in production, use business verification API
    return company.length > 3;
  }

  private async getRewardDetails(rewardId: string): Promise<any> {
    // Mock data - in production, fetch from database
    return {
      id: rewardId,
      amount: 5000,
      fraud_score: 15,
      referee_verified: true,
      conversion_validated: true,
    };
  }

  private async approveReward(rewardId: string): Promise<void> {
    console.log(`Reward ${rewardId} approved automatically`);
  }

  private async flagForManualReview(rewardId: string, criteria: any): Promise<void> {
    console.log(`Reward ${rewardId} flagged for review:`, criteria);
  }
}

// Usage example
async function runEnterpriseExample() {
  const enterprise = new EnterpriseReferralSystem(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    process.env.WEBHOOK_URL!
  );

  // Create B2B campaign
  const campaign = await enterprise.createB2BCampaign();
  console.log('Created campaign:', campaign.name);

  // Perform fraud check
  const fraudResult = await enterprise.performEnhancedFraudCheck(
    'referral-123',
    {
      email: 'john@company.com',
      domain: 'company.com',
      linkedin: 'https://linkedin.com/company/company',
      company: 'Company Inc',
    }
  );
  console.log('Fraud check result:', fraudResult);

  // Get analytics
  const analytics = await enterprise.getEnterpriseAnalytics(
    new Date('2024-01-01'),
    new Date('2024-12-31')
  );
  console.log('Analytics:', {
    totalReferrals: analytics.total_referrals,
    conversionRate: `${(analytics.conversion_rate * 100).toFixed(2)}%`,
    roi: analytics.roi,
    totalRevenue: analytics.total_rewards_paid,
  });

  // Process reward approval
  const approved = await enterprise.processRewardApproval('reward-456');
  console.log('Reward approval:', approved ? 'Auto-approved' : 'Manual review required');
}

// Export for use
export { EnterpriseReferralSystem, runEnterpriseExample };