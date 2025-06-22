/**
 * Basic usage example of @madfam/referral
 */

import { createReferralEngine } from '@madfam/referral';

async function basicExample() {
  // Initialize the referral engine
  const referralEngine = createReferralEngine(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    {
      fraud_detection_enabled: true,
      enable_analytics: true,
      enable_gamification: true,
    }
  );

  const userId = 'user-123';

  try {
    // 1. Create a referral
    console.log('Creating referral...');
    const { referral, share_url, share_code } = await referralEngine.createReferral(
      userId,
      {
        campaign_id: 'default-campaign',
        metadata: {
          source: 'dashboard',
          user_tier: 'premium',
        },
      }
    );

    console.log('Referral created:');
    console.log(`- Code: ${share_code}`);
    console.log(`- URL: ${share_url}`);
    console.log(`- ID: ${referral.id}`);

    // 2. Track a click
    console.log('\nTracking referral click...');
    const clickResult = await referralEngine.trackReferralClick({
      code: share_code,
      attribution_data: {
        utm_source: 'twitter',
        utm_medium: 'social',
        utm_campaign: 'summer-growth',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        country: 'US',
        city: 'San Francisco',
      },
      device_fingerprint: 'unique-device-id',
    });

    console.log('Click tracked:');
    console.log(`- Referral ID: ${clickResult.referral_id}`);
    console.log(`- Redirect URL: ${clickResult.redirect_url}`);

    // 3. Convert the referral
    console.log('\nConverting referral...');
    const convertResult = await referralEngine.convertReferral({
      code: share_code,
      referee_id: 'new-user-456',
      conversion_metadata: {
        signup_source: 'web',
        plan: 'starter',
      },
    });

    console.log('Referral converted:');
    console.log(`- Success: ${convertResult.success}`);
    console.log(`- Rewards created: ${convertResult.rewards.length}`);
    convertResult.rewards.forEach(reward => {
      console.log(`  - ${reward.type}: $${reward.amount} ${reward.currency}`);
    });

    // 4. Get user stats
    console.log('\nFetching user stats...');
    const stats = await referralEngine.getUserReferralStats(userId);

    console.log('User stats:');
    console.log(`- Total referrals: ${stats.total_referrals}`);
    console.log(`- Successful: ${stats.successful_referrals}`);
    console.log(`- Total earned: $${stats.total_rewards_earned}`);
    console.log(`- Conversion rate: ${(stats.conversion_rate * 100).toFixed(2)}%`);

    // 5. Get active campaigns
    console.log('\nFetching active campaigns...');
    const campaigns = await referralEngine.getActiveCampaigns(userId);

    console.log(`Found ${campaigns.length} active campaigns:`);
    campaigns.forEach(campaign => {
      console.log(`- ${campaign.name} (${campaign.type})`);
      console.log(`  Referrer reward: ${campaign.referrer_reward.type} - $${campaign.referrer_reward.amount}`);
      console.log(`  Referee reward: ${campaign.referee_reward.type} - $${campaign.referee_reward.amount}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
basicExample();