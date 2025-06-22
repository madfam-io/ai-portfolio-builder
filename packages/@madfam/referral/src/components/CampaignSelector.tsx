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
