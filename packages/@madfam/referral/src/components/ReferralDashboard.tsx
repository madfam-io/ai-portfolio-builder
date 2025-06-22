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
