/**
 * React integration example of @madfam/referral
 */

import React, { useState } from 'react';
import {
  useReferral,
  useReferralCampaigns,
  useReferralStats,
  useReferralShare,
} from '@madfam/referral/hooks';

// Main referral dashboard component
export function ReferralDashboard({ userId }: { userId: string }) {
  const {
    referrals,
    activeReferral,
    stats,
    rewards,
    totalEarnings,
    pendingRewards,
    loading,
    error,
    createReferral,
    refreshReferrals,
  } = useReferral({
    userId,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });

  const { share, copyLink, generateShareUrl } = useReferralShare({
    defaultHashtags: ['referral', 'growth'],
    defaultVia: 'YourApp',
  });

  const [creating, setCreating] = useState(false);

  const handleCreateReferral = async () => {
    setCreating(true);
    try {
      const result = await createReferral();
      if (result) {
        alert(`Referral created! Share this link: ${result.share_url}`);
      }
    } catch (err) {
      console.error('Failed to create referral:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleShare = async (platform: any) => {
    if (!activeReferral) return;

    const success = await share(platform, activeReferral);
    if (success) {
      alert(`Shared successfully on ${platform}!`);
    }
  };

  const handleCopyLink = async () => {
    if (!activeReferral) return;

    const success = await copyLink(activeReferral);
    if (success) {
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="loading">Loading referral data...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error.message}</p>
        <button onClick={refreshReferrals}>Retry</button>
      </div>
    );
  }

  return (
    <div className="referral-dashboard">
      <h1>Referral Dashboard</h1>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatCard
          title="Total Referrals"
          value={stats?.total_referrals || 0}
          icon="📊"
        />
        <StatCard
          title="Successful"
          value={stats?.successful_referrals || 0}
          icon="✅"
        />
        <StatCard
          title="Total Earned"
          value={`$${totalEarnings.toFixed(2)}`}
          icon="💰"
        />
        <StatCard
          title="Pending"
          value={`$${pendingRewards.toFixed(2)}`}
          icon="⏳"
        />
      </div>

      {/* Active Referral */}
      {activeReferral ? (
        <div className="active-referral">
          <h2>Your Referral Link</h2>
          <div className="referral-code">
            <code>{activeReferral.code}</code>
          </div>
          <div className="share-buttons">
            <button onClick={() => handleShare('twitter')}>
              Share on Twitter
            </button>
            <button onClick={() => handleShare('linkedin')}>
              Share on LinkedIn
            </button>
            <button onClick={() => handleShare('whatsapp')}>
              Share on WhatsApp
            </button>
            <button onClick={handleCopyLink}>Copy Link</button>
          </div>
          <p className="share-url">{generateShareUrl(activeReferral)}</p>
        </div>
      ) : (
        <div className="no-referral">
          <p>You don't have an active referral link yet.</p>
          <button onClick={handleCreateReferral} disabled={creating}>
            {creating ? 'Creating...' : 'Create Referral Link'}
          </button>
        </div>
      )}

      {/* Recent Referrals */}
      <div className="recent-referrals">
        <h2>Recent Referrals</h2>
        {referrals.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Created</th>
                <th>Converted</th>
              </tr>
            </thead>
            <tbody>
              {referrals.slice(0, 5).map(referral => (
                <tr key={referral.id}>
                  <td>{referral.code}</td>
                  <td>
                    <StatusBadge status={referral.status} />
                  </td>
                  <td>{new Date(referral.created_at).toLocaleDateString()}</td>
                  <td>
                    {referral.converted_at
                      ? new Date(referral.converted_at).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No referrals yet. Create your first one!</p>
        )}
      </div>

      {/* Rewards History */}
      <div className="rewards-history">
        <h2>Rewards History</h2>
        {rewards.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rewards.slice(0, 5).map(reward => (
                <tr key={reward.id}>
                  <td>{reward.type}</td>
                  <td>
                    ${reward.amount} {reward.currency}
                  </td>
                  <td>
                    <StatusBadge status={reward.status} />
                  </td>
                  <td>{new Date(reward.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No rewards earned yet. Start referring to earn!</p>
        )}
      </div>
    </div>
  );
}

// Campaign selector component
export function CampaignSelector({ userId }: { userId: string }) {
  const { activeCampaigns, loading, error, getCampaignById } =
    useReferralCampaigns({
      userId,
      autoRefresh: true,
    });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );

  if (loading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error loading campaigns: {error.message}</div>;

  const selectedCampaign = selectedCampaignId
    ? getCampaignById(selectedCampaignId)
    : null;

  return (
    <div className="campaign-selector">
      <h2>Available Campaigns</h2>
      <select
        value={selectedCampaignId || ''}
        onChange={e => setSelectedCampaignId(e.target.value || null)}
      >
        <option value="">Select a campaign</option>
        {activeCampaigns.map(campaign => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.name}
          </option>
        ))}
      </select>

      {selectedCampaign && (
        <div className="campaign-details">
          <h3>{selectedCampaign.name}</h3>
          <p>{selectedCampaign.description}</p>
          <div className="rewards">
            <div>
              <h4>Referrer Reward</h4>
              <p>
                {selectedCampaign.referrer_reward.type}: $
                {selectedCampaign.referrer_reward.amount}{' '}
                {selectedCampaign.referrer_reward.currency}
              </p>
            </div>
            <div>
              <h4>Referee Reward</h4>
              <p>
                {selectedCampaign.referee_reward.type}: $
                {selectedCampaign.referee_reward.amount}{' '}
                {selectedCampaign.referee_reward.currency}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Leaderboard component
export function ReferralLeaderboard() {
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Fetch leaderboard data
    fetch('/api/referral/leaderboard')
      .then(res => res.json())
      .then(data => {
        setTopReferrers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <div className="referral-leaderboard">
      <h2>Top Referrers</h2>
      <ol>
        {topReferrers.map((referrer, index) => (
          <li key={referrer.user_id}>
            <span className="rank">#{index + 1}</span>
            <span className="name">{referrer.name}</span>
            <span className="stats">
              {referrer.total_referrals} referrals • $
              {referrer.total_rewards.toFixed(2)} earned
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Utility components
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <div className="icon">{icon}</div>
      <div className="content">
        <h3>{title}</h3>
        <p className="value">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getColor = () => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'converted':
      case 'paid':
      case 'approved':
        return 'green';
      case 'expired':
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return <span className={`status-badge status-${getColor()}`}>{status}</span>;
}

// App component
export default function App() {
  const userId = 'current-user-id'; // Get from auth context

  return (
    <div className="app">
      <ReferralDashboard userId={userId} />
      <CampaignSelector userId={userId} />
      <ReferralLeaderboard />
    </div>
  );
}
