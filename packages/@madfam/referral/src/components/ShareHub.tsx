import React from 'react';
import { useReferral } from '../hooks/useReferral';
import type { SharePlatform } from '../types';

export interface ShareHubProps {
  userId: string;
  platforms?: SharePlatform[];
  className?: string;
}

const DEFAULT_PLATFORMS: SharePlatform[] = [
  'twitter',
  'linkedin',
  'facebook',
  'whatsapp',
  'email',
  'copy_link',
];

export function ShareHub({ 
  userId, 
  platforms = DEFAULT_PLATFORMS,
  className = '' 
}: ShareHubProps) {
  const { activeReferral, shareToSocial, sharing } = useReferral({ userId });

  if (!activeReferral) {
    return <div className={className}>No active referral to share</div>;
  }

  return (
    <div className={`share-hub ${className}`}>
      <h3>Share Your Referral</h3>
      <div className="share-buttons">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => shareToSocial(platform)}
            disabled={sharing}
            className={`share-button share-${platform}`}
          >
            Share on {platform}
          </button>
        ))}
      </div>
    </div>
  );
}