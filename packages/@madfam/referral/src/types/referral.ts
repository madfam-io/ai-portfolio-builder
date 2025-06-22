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
 * Core referral types
 */

export type ReferralStatus = 'pending' | 'converted' | 'expired' | 'fraudulent';

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

// API types
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
  campaign?: any; // Avoid circular dependency
}

export interface ConvertReferralRequest {
  code: string;
  referee_id: string;
  conversion_metadata?: Record<string, unknown>;
}

export interface ConvertReferralResponse {
  success: boolean;
  referral: Referral;
  rewards: any[]; // Avoid circular dependency
}

// Sharing types
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

export interface BrandingConfig {
  logo_url?: string;
  brand_color?: string;
  custom_domain?: string;
  watermark_enabled: boolean;
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
