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

/**
 * Main referral hook - provides comprehensive referral functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Referral,
  ReferralCampaign,
  ReferralReward,
  UserReferralStats,
  CreateReferralRequest,
  CreateReferralResponse,
  SharePlatform,
  ReferralError,
} from '../types';
import { Logger } from '../utils/logger';

const logger = new Logger('useReferral');

// Hook state interfaces
export interface UseReferralState {
  // Current user's referrals
  referrals: Referral[];
  activeReferral: Referral | null;

  // Campaigns
  availableCampaigns: ReferralCampaign[];
  currentCampaign: ReferralCampaign | null;

  // Rewards
  rewards: ReferralReward[];
  totalEarnings: number;
  pendingRewards: number;

  // Statistics
  stats: UserReferralStats | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  sharing: boolean;

  // Error handling
  error: ReferralError | null;

  // Success states
  lastCreatedReferral: CreateReferralResponse | null;
  lastShareSuccess: boolean;
}

export interface UseReferralActions {
  // Referral management
  createReferral: (
    request?: CreateReferralRequest
  ) => Promise<CreateReferralResponse | null>;
  refreshReferrals: () => Promise<void>;

  // Sharing actions
  shareToSocial: (
    platform: SharePlatform,
    referral?: Referral
  ) => Promise<boolean>;
  copyShareLink: (referral?: Referral) => Promise<boolean>;
  generateShareContent: (
    platform: SharePlatform,
    referral?: Referral
  ) => ShareContent;

  // Campaign management
  selectCampaign: (campaign: ReferralCampaign) => void;
  refreshCampaigns: () => Promise<void>;

  // Utility actions
  clearError: () => void;
  refetch: () => Promise<void>;
}

export interface ShareContent {
  text: string;
  url: string;
  hashtags?: string[];
  via?: string;
}

export interface UseReferralConfig {
  userId: string;
  apiEndpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Main referral hook - provides comprehensive referral functionality
 */
export function useReferral(
  config: UseReferralConfig
): UseReferralState & UseReferralActions {
  const {
    userId,
    apiEndpoint = '/api/referral',
    autoRefresh = true,
    refreshInterval = 60000,
  } = config;

  // State management
  const [state, setState] = useState<UseReferralState>({
    referrals: [],
    activeReferral: null,
    availableCampaigns: [],
    currentCampaign: null,
    rewards: [],
    totalEarnings: 0,
    pendingRewards: 0,
    stats: null,
    loading: true,
    creating: false,
    sharing: false,
    error: null,
    lastCreatedReferral: null,
    lastShareSuccess: false,
  });

  // Fetch user's referrals
  const fetchReferrals = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiEndpoint}/user/${userId}/referrals`);
      if (!response.ok) throw new Error('Failed to fetch referrals');

      const referrals: Referral[] = await response.json();

      setState(prev => ({
        ...prev,
        referrals,
        activeReferral:
          referrals.find(r => r.status === 'pending') || referrals[0] || null,
      }));
    } catch (error) {
      logger.error('Failed to fetch referrals', { error, userId });
      setState(prev => ({
        ...prev,
        error: {
          code: 'FETCH_REFERRALS_FAILED',
          message: 'Failed to load your referrals',
        },
      }));
    }
  }, [userId, apiEndpoint]);

  // Fetch available campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiEndpoint}/campaigns?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');

      const campaigns: ReferralCampaign[] = await response.json();

      setState(prev => ({
        ...prev,
        availableCampaigns: campaigns,
        currentCampaign:
          campaigns.find(c => c.status === 'active') || campaigns[0] || null,
      }));
    } catch (error) {
      logger.error('Failed to fetch campaigns', { error, userId });
    }
  }, [userId, apiEndpoint]);

  // Fetch user rewards
  const fetchRewards = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiEndpoint}/user/${userId}/rewards`);
      if (!response.ok) throw new Error('Failed to fetch rewards');

      const rewards: ReferralReward[] = await response.json();

      const totalEarnings = rewards
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + r.amount, 0);

      const pendingRewards = rewards
        .filter(r => ['pending', 'approved'].includes(r.status))
        .reduce((sum, r) => sum + r.amount, 0);

      setState(prev => ({
        ...prev,
        rewards,
        totalEarnings,
        pendingRewards,
      }));
    } catch (error) {
      logger.error('Failed to fetch rewards', { error, userId });
    }
  }, [userId, apiEndpoint]);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiEndpoint}/user/${userId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const stats: UserReferralStats = await response.json();

      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      logger.error('Failed to fetch referral stats', {
        error,
        userId,
      });
    }
  }, [userId, apiEndpoint]);

  // Create new referral
  const createReferral = useCallback(
    async (
      request: CreateReferralRequest = {}
    ): Promise<CreateReferralResponse | null> => {
      if (!userId) {
        setState(prev => ({
          ...prev,
          error: { code: 'NO_USER', message: 'User not authenticated' },
        }));
        return null;
      }

      setState(prev => ({ ...prev, creating: true, error: null }));

      try {
        const response = await fetch(`${apiEndpoint}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...request,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create referral');
        }

        const result: CreateReferralResponse = await response.json();

        // Update state with new referral
        setState(prev => ({
          ...prev,
          referrals: [result.referral, ...prev.referrals],
          activeReferral: result.referral,
          lastCreatedReferral: result,
          creating: false,
        }));

        // Refresh stats
        await fetchStats();

        logger.info('Referral created successfully', {
          referralId: result.referral.id,
          userId,
        });

        return result;
      } catch (error) {
        logger.error('Failed to create referral', { error, userId });

        setState(prev => ({
          ...prev,
          creating: false,
          error: {
            code: 'CREATE_FAILED',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create referral',
          },
        }));

        return null;
      }
    },
    [userId, apiEndpoint, fetchStats]
  );

  // Share to social platform
  const shareToSocial = useCallback(
    async (platform: SharePlatform, referral?: Referral): Promise<boolean> => {
      const targetReferral = referral || state.activeReferral;
      if (!targetReferral) return false;

      setState(prev => ({ ...prev, sharing: true, error: null }));

      try {
        const shareContent = generateShareContent(platform, targetReferral);

        let success = false;

        switch (platform) {
          case 'twitter':
            success = await shareToTwitter(shareContent);
            break;
          case 'linkedin':
            success = await shareToLinkedIn(shareContent);
            break;
          case 'facebook':
            success = await shareToFacebook(shareContent);
            break;
          case 'whatsapp':
            success = await shareToWhatsApp(shareContent);
            break;
          case 'email':
            success = await shareToEmail(shareContent);
            break;
          case 'copy_link':
            success = await copyToClipboard(shareContent.url);
            break;
          default:
            success = false;
        }

        setState(prev => ({
          ...prev,
          sharing: false,
          lastShareSuccess: success,
        }));

        if (success) {
          // Track share event on backend
          await fetch(`${apiEndpoint}/track-share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referral_id: targetReferral.id,
              platform,
              share_content: shareContent,
            }),
          });
        }

        return success;
      } catch (error) {
        logger.error('Failed to share referral', {
          error,
          platform,
          referralId: targetReferral?.id,
        });

        setState(prev => ({
          ...prev,
          sharing: false,
          error: {
            code: 'SHARE_FAILED',
            message: `Failed to share to ${platform}`,
          },
        }));

        return false;
      }
    },
    [state.activeReferral, apiEndpoint]
  );

  // Copy share link to clipboard
  const copyShareLink = useCallback(
    async (referral?: Referral): Promise<boolean> => {
      const targetReferral = referral || state.activeReferral;
      if (!targetReferral) return false;

      return shareToSocial('copy_link', targetReferral);
    },
    [state.activeReferral, shareToSocial]
  );

  // Generate share content for platform
  const generateShareContent = useCallback(
    (platform: SharePlatform, referral?: Referral): ShareContent => {
      const targetReferral = referral || state.activeReferral;
      if (!targetReferral) {
        return { text: '', url: '' };
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'https://app.madfam.io';
      const shareUrl = `${baseUrl}/signup?ref=${targetReferral.code}`;

      const templates: Record<
        SharePlatform,
        { text: string; hashtags?: string[]; via?: string }
      > = {
        twitter: {
          text: `🚀 Join me on this amazing platform! Use my referral link:`,
          hashtags: ['referral', 'growth'],
          via: 'MADFAM_io',
        },
        linkedin: {
          text: `I've been using this amazing platform and thought you might be interested. Check it out:`,
        },
        facebook: {
          text: `Check out this amazing platform I've been using!`,
        },
        whatsapp: {
          text: `Hey! I found this amazing platform you should check out:`,
        },
        telegram: {
          text: `Hey! I found this amazing platform you should check out:`,
        },
        email: {
          text: `I wanted to share this amazing platform with you.`,
        },
        copy_link: {
          text: shareUrl,
        },
        qr_code: {
          text: shareUrl,
        },
        sms: {
          text: `Hey! Check out this amazing platform:`,
        },
      };

      const template = templates[platform] || templates.copy_link;

      return {
        text: template.text,
        url: shareUrl,
        hashtags: template.hashtags,
        via: template.via,
      };
    },
    [state.activeReferral]
  );

  // Select campaign
  const selectCampaign = useCallback((campaign: ReferralCampaign) => {
    setState(prev => ({ ...prev, currentCampaign: campaign }));
  }, []);

  // Refresh campaigns
  const refreshCampaigns = useCallback(async () => {
    await fetchCampaigns();
  }, [fetchCampaigns]);

  // Refresh referrals
  const refreshReferrals = useCallback(async () => {
    await fetchReferrals();
  }, [fetchReferrals]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refetch all data
  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    await Promise.all([
      fetchReferrals(),
      fetchCampaigns(),
      fetchRewards(),
      fetchStats(),
    ]);

    setState(prev => ({ ...prev, loading: false }));
  }, [fetchReferrals, fetchCampaigns, fetchRewards, fetchStats]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, refetch]);

  return {
    ...state,
    createReferral,
    shareToSocial,
    copyShareLink,
    generateShareContent,
    selectCampaign,
    refreshCampaigns,
    refreshReferrals,
    clearError,
    refetch,
  };
}

// Helper functions for sharing

async function shareToTwitter(content: ShareContent): Promise<boolean> {
  const text = encodeURIComponent(content.text);
  const url = encodeURIComponent(content.url);
  const hashtags = content.hashtags?.join(',') || '';
  const via = content.via || '';

  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}`;

  return openShareWindow(twitterUrl);
}

async function shareToLinkedIn(content: ShareContent): Promise<boolean> {
  const url = encodeURIComponent(content.url);
  const title = encodeURIComponent('Check this out!');
  const summary = encodeURIComponent(content.text);

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;

  return openShareWindow(linkedinUrl);
}

async function shareToFacebook(content: ShareContent): Promise<boolean> {
  const url = encodeURIComponent(content.url);
  const quote = encodeURIComponent(content.text);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;

  return openShareWindow(facebookUrl);
}

async function shareToWhatsApp(content: ShareContent): Promise<boolean> {
  const text = encodeURIComponent(`${content.text} ${content.url}`);
  const whatsappUrl = `https://wa.me/?text=${text}`;

  return openShareWindow(whatsappUrl);
}

async function shareToEmail(content: ShareContent): Promise<boolean> {
  const subject = encodeURIComponent('Check this out!');
  const body = encodeURIComponent(`${content.text}\n\n${content.url}`);

  const emailUrl = `mailto:?subject=${subject}&body=${body}`;

  window.location.href = emailUrl;
  return true;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    logger.error('Failed to copy to clipboard', { error });
    return false;
  }
}

function openShareWindow(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      'share',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      // Check if popup was closed (indicating user completed share)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          resolve(true);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(
        () => {
          clearInterval(checkClosed);
          if (!popup.closed) {
            popup.close();
          }
          resolve(false);
        },
        5 * 60 * 1000
      );
    } else {
      resolve(false);
    }
  });
}
