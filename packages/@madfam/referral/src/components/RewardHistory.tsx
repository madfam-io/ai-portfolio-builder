import React from 'react';
import { useReferral } from '../hooks/useReferral';

export interface RewardHistoryProps {
  userId: string;
  limit?: number;
  className?: string;
}

export function RewardHistory({ userId, limit = 10, className = '' }: RewardHistoryProps) {
  const { rewards, totalEarnings, pendingRewards } = useReferral({ userId });

  return (
    <div className={`reward-history ${className}`}>
      <h3>Reward History</h3>
      
      <div className="reward-summary">
        <div>
          <span>Total Earned:</span>
          <strong>${totalEarnings.toFixed(2)}</strong>
        </div>
        <div>
          <span>Pending:</span>
          <strong>${pendingRewards.toFixed(2)}</strong>
        </div>
      </div>

      <table className="rewards-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rewards.slice(0, limit).map(reward => (
            <tr key={reward.id}>
              <td>{reward.type}</td>
              <td>${reward.amount} {reward.currency}</td>
              <td className={`status-${reward.status}`}>{reward.status}</td>
              <td>{new Date(reward.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rewards.length === 0 && (
        <p className="no-rewards">No rewards earned yet. Start referring!</p>
      )}
    </div>
  );
}