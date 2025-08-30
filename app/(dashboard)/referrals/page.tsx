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

'use client';

import { useEffect, useState } from 'react';
import { ReferralDashboard } from '@madfam/referral/components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setLoading(false);
    }
  }, [user, isLoading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReferralDashboard userId={user.id} />
    </div>
  );
}

export default ReferralsPage;
