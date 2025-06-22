/**
 * Reward types
 */

export type RewardStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'expired'
  | 'cancelled';

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

export function isValidRewardType(type: string): type is RewardType {
  return [
    'cash',
    'credit',
    'discount',
    'subscription_credit',
    'feature_unlock',
  ].includes(type);
}
