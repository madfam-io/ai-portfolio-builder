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

export interface RewardHistoryProps {
  userId: string;
  limit?: number;
  className?: string;
}

export function RewardHistory({
  userId,
  limit = 10,
  className = '',
}: RewardHistoryProps) {
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
              <td>
                ${reward.amount} {reward.currency}
              </td>
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
