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

import React from 'react';
import { useReferral } from '../hooks/useReferral';

export interface ReferralDashboardProps {
  userId: string;
  className?: string;
}

export function ReferralDashboard({
  userId,
  className = '',
}: ReferralDashboardProps) {
  const {
    stats,
    activeReferral,
    loading,
    error,
    createReferral,
    copyShareLink,
  } = useReferral({ userId });

  if (loading) return <div className={className}>Loading...</div>;
  if (error) return <div className={className}>Error: {error.message}</div>;

  return (
    <div className={`referral-dashboard ${className}`}>
      <div className="stats-grid">
        <div className="stat">
          <h3>Total Referrals</h3>
          <p>{stats?.total_referrals || 0}</p>
        </div>
        <div className="stat">
          <h3>Successful</h3>
          <p>{stats?.successful_referrals || 0}</p>
        </div>
        <div className="stat">
          <h3>Total Earned</h3>
          <p>${stats?.total_rewards_earned || 0}</p>
        </div>
        <div className="stat">
          <h3>Conversion Rate</h3>
          <p>{((stats?.conversion_rate || 0) * 100).toFixed(2)}%</p>
        </div>
      </div>

      {activeReferral ? (
        <div className="active-referral">
          <h3>Your Referral Code</h3>
          <code>{activeReferral.code}</code>
          <button onClick={() => copyShareLink()}>Copy Link</button>
        </div>
      ) : (
        <button onClick={() => createReferral()}>Create Referral Link</button>
      )}
    </div>
  );
}
