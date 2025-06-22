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
