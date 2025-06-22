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
import { useReferralCampaigns } from '../hooks/useReferralCampaigns';

export interface CampaignSelectorProps {
  userId?: string;
  onSelect?: (campaignId: string) => void;
  className?: string;
}

export function CampaignSelector({
  userId,
  onSelect,
  className = '',
}: CampaignSelectorProps) {
  const { activeCampaigns, loading, error } = useReferralCampaigns({ userId });

  if (loading) return <div className={className}>Loading campaigns...</div>;
  if (error) return <div className={className}>Error loading campaigns</div>;

  return (
    <div className={`campaign-selector ${className}`}>
      <h3>Available Campaigns</h3>
      <div className="campaigns-grid">
        {activeCampaigns.map(campaign => (
          <div key={campaign.id} className="campaign-card">
            <h4>{campaign.name}</h4>
            <p>{campaign.description}</p>
            <div className="rewards">
              <div>
                <span>You earn:</span>
                <strong>
                  $
                  {campaign.referrer_reward.amount ||
                    campaign.referrer_reward.base_amount ||
                    0}
                </strong>
              </div>
              <div>
                <span>Friend gets:</span>
                <strong>
                  $
                  {campaign.referee_reward.amount ||
                    campaign.referee_reward.base_amount ||
                    0}
                </strong>
              </div>
            </div>
            {onSelect && (
              <button onClick={() => onSelect(campaign.id)}>
                Select Campaign
              </button>
            )}
          </div>
        ))}
      </div>
      {activeCampaigns.length === 0 && <p>No active campaigns available.</p>}
    </div>
  );
}
