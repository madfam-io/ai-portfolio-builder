/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview Referrals Dashboard Page
 *
 * Main page for the referral system that provides users with comprehensive
 * access to all referral features including sharing, tracking, and rewards.
 */

import { Metadata } from 'next';
import { ReferralDashboard } from '@madfam/referral';

export const metadata: Metadata = {
  title: 'Referrals - PRISMA by MADFAM',
  description: 'Share PRISMA with friends and earn rewards. Track your referrals, view earnings, and grow your network.',
  keywords: ['referrals', 'rewards', 'sharing', 'earnings', 'MADFAM', 'PRISMA'],
};

export function ReferralsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ReferralDashboard />
    </div>
  );
}

export default ReferralsPage;