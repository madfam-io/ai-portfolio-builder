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
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ReferralsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        router.push('/auth/signin');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUserId(user.id);
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReferralDashboard userId={userId} />
    </div>
  );
}

export default ReferralsPage;
