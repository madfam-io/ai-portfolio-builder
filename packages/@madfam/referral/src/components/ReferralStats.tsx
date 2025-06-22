import React from 'react';
import { useReferralStats } from '../hooks/useReferralStats';

export interface ReferralStatsProps {
  userId: string;
  className?: string;
}

export function ReferralStats({ userId, className = '' }: ReferralStatsProps) {
  const { stats, loading, error } = useReferralStats({ userId });

  if (loading) return <div className={className}>Loading stats...</div>;
  if (error) return <div className={className}>Error loading stats</div>;
  if (!stats) return null;

  return (
    <div className={`referral-stats ${className}`}>
      <h3>Your Performance</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Referrals</h4>
          <p className="stat-value">{stats.total_referrals}</p>
          <p className="stat-label">All time</p>
        </div>
        
        <div className="stat-card">
          <h4>Success Rate</h4>
          <p className="stat-value">
            {((stats.conversion_rate || 0) * 100).toFixed(1)}%
          </p>
          <p className="stat-label">Conversion</p>
        </div>
        
        <div className="stat-card">
          <h4>Total Earned</h4>
          <p className="stat-value">${stats.total_rewards_earned}</p>
          <p className="stat-label">Lifetime</p>
        </div>
        
        <div className="stat-card">
          <h4>Current Streak</h4>
          <p className="stat-value">{stats.current_streak}</p>
          <p className="stat-label">Days</p>
        </div>
      </div>

      {stats.achievement_badges.length > 0 && (
        <div className="achievements">
          <h4>Achievements</h4>
          <div className="badges">
            {stats.achievement_badges.map(badge => (
              <span key={badge} className="badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.referral_rank && (
        <div className="rank">
          <h4>Your Rank</h4>
          <p className="rank-value">#{stats.referral_rank}</p>
        </div>
      )}
    </div>
  );
}