/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview React Hooks for Referral System
 *
 * Comprehensive React hooks that provide seamless integration with MADFAM's
 * referral system, including real-time updates, optimistic UI updates,
 * and error handling with retry mechanisms.
 *
 * These hooks follow React best practices and provide excellent developer
 * experience while maintaining performance and type safety.
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { captureEvent } from '@/lib/analytics/posthog/client';
import { logger } from '@/lib/utils/logger';
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

/**
 * Main referral hook - provides comprehensive referral functionality
 */
export function useReferral(): UseReferralState & UseReferralActions {
  const { user } = useAuthStore();

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
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/referral/user/${user.id}/referrals`);
      if (!response.ok) throw new Error('Failed to fetch referrals');

      const referrals: Referral[] = await response.json();

      setState(prev => ({
        ...prev,
        referrals,
        activeReferral:
          referrals.find(r => r.status === 'pending') || referrals[0] || null,
      }));
    } catch (error) {
      logger.error('Failed to fetch referrals', { error, userId: user.id });
      setState(prev => ({
        ...prev,
        error: {
          code: 'FETCH_REFERRALS_FAILED',
          message: 'Failed to load your referrals',
        },
      }));
    }
  }, [user?.id]);

  // Fetch available campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/referral/campaigns?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');

      const campaigns: ReferralCampaign[] = await response.json();

      setState(prev => ({
        ...prev,
        availableCampaigns: campaigns,
        currentCampaign:
          campaigns.find(c => c.status === 'active') || campaigns[0] || null,
      }));
    } catch (error) {
      logger.error('Failed to fetch campaigns', { error, userId: user.id });
    }
  }, [user?.id]);

  // Fetch user rewards
  const fetchRewards = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/referral/user/${user.id}/rewards`);
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
      logger.error('Failed to fetch rewards', { error, userId: user.id });
    }
  }, [user?.id]);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/referral/user/${user.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const stats: UserReferralStats = await response.json();

      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      logger.error('Failed to fetch referral stats', {
        error,
        userId: user.id,
      });
    }
  }, [user?.id]);

  // Create new referral
  const createReferral = useCallback(
    async (
      request: CreateReferralRequest = {}
    ): Promise<CreateReferralResponse | null> => {
      if (!user?.id) {
        setState(prev => ({
          ...prev,
          error: { code: 'NO_USER', message: 'User not authenticated' },
        }));
        return null;
      }

      setState(prev => ({ ...prev, creating: true, error: null }));

      try {
        const response = await fetch('/api/referral/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
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

        // Track creation event
        captureEvent('referral_created', {
          referral_id: result.referral.id,
          campaign_id: result.referral.campaign_id,
          share_url: result.share_url,
        });

        // Refresh stats
        await fetchStats();

        logger.info('Referral created successfully', {
          referralId: result.referral.id,
          userId: user.id,
        });

        return result;
      } catch (error) {
        logger.error('Failed to create referral', { error, userId: user.id });

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
    [user?.id, fetchStats]
  );

  // Generate share content for platform (defined before shareToSocial to avoid dependency issues)
  const generateShareContent = (
    platform: SharePlatform,
    referral?: Referral
  ): ShareContent => {
    const targetReferral = referral || state.activeReferral;
    if (!targetReferral) {
      return { text: '', url: '' };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://prisma.madfam.io';
    const shareUrl = `${baseUrl}/signup?ref=${targetReferral.code}`;

    const templates: Record<
      SharePlatform,
      { text: string; hashtags?: string[]; via?: string }
    > = {
      twitter: {
        text: `🚀 Just discovered PRISMA by MADFAM - it transforms CVs into stunning portfolio websites in under 3 minutes! Try it out with my referral link:`,
        hashtags: ['portfolio', 'AI', 'career', 'MADFAM'],
        via: 'MADFAM_io',
      },
      linkedin: {
        text: `I've been using PRISMA by MADFAM to create professional portfolio websites with AI assistance. It's incredibly fast and the results are impressive. Check it out:`,
      },
      facebook: {
        text: `Check out PRISMA by MADFAM - an AI-powered tool that creates beautiful portfolio websites from your CV in minutes. Perfect for job seekers and professionals!`,
      },
      whatsapp: {
        text: `Hey! I found this amazing AI tool called PRISMA that creates portfolio websites from CVs in just 3 minutes. You should try it:`,
      },
      telegram: {
        text: `Hey! I found this amazing AI tool called PRISMA that creates portfolio websites from CVs in just 3 minutes. You should try it:`,
      },
      email: {
        text: `I wanted to share PRISMA by MADFAM with you - it's an AI-powered platform that creates stunning portfolio websites from CVs in under 3 minutes. Perfect for showcasing your skills and experience professionally.`,
      },
      copy_link: {
        text: shareUrl,
      },
      qr_code: {
        text: shareUrl,
      },
      sms: {
        text: `Hey! Check out PRISMA by MADFAM - creates portfolio websites from CVs in 3 minutes:`,
      },
    };

    const template = templates[platform] || templates.copy_link;

    return {
      text: template.text,
      url: shareUrl,
      hashtags: template.hashtags,
      via: template.via,
    };
  };

  // Share to social platform
  const shareToSocial = useCallback(
    async (platform: SharePlatform, referral?: Referral): Promise<boolean> => {
      const targetReferral = referral || state.activeReferral;
      if (!targetReferral) return false;

      setState(prev => ({ ...prev, sharing: true, error: null }));

      try {
        const shareContent = generateShareContent(platform, targetReferral);

        // Track share attempt
        captureEvent('referral_share_attempted', {
          platform,
          referral_id: targetReferral.id,
          share_url: shareContent.url,
        });

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
            success = shareToEmail(shareContent);
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
          // Track successful share
          captureEvent('referral_shared', {
            platform,
            referral_id: targetReferral.id,
            share_url: shareContent.url,
          });

          // Track share event on backend
          await fetch('/api/referral/track-share', {
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
    [state.activeReferral]
  );

  // Copy share link to clipboard
  const copyShareLink = useCallback(
    (referral?: Referral): Promise<boolean> => {
      const targetReferral = referral || state.activeReferral;
      if (!targetReferral) return Promise.resolve(false);

      // Call shareToSocial which returns a Promise
      return shareToSocial('copy_link', targetReferral);
    },
    [state.activeReferral, shareToSocial]
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
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  // Memoized derived values (removed unused variables)
  // These values could be exposed in the return object if needed

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

function shareToTwitter(content: ShareContent): Promise<boolean> {
  const text = encodeURIComponent(content.text);
  const url = encodeURIComponent(content.url);
  const hashtags = content.hashtags?.join(',') || '';
  const via = content.via || '';

  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}`;

  return openShareWindow(twitterUrl);
}

function shareToLinkedIn(content: ShareContent): Promise<boolean> {
  const url = encodeURIComponent(content.url);
  const title = encodeURIComponent('PRISMA by MADFAM - AI Portfolio Builder');
  const summary = encodeURIComponent(content.text);

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;

  return openShareWindow(linkedinUrl);
}

function shareToFacebook(content: ShareContent): Promise<boolean> {
  const url = encodeURIComponent(content.url);
  const quote = encodeURIComponent(content.text);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;

  return openShareWindow(facebookUrl);
}

function shareToWhatsApp(content: ShareContent): Promise<boolean> {
  const text = encodeURIComponent(`${content.text} ${content.url}`);
  const whatsappUrl = `https://wa.me/?text=${text}`;

  return openShareWindow(whatsappUrl);
}

function shareToEmail(content: ShareContent): boolean {
  const subject = encodeURIComponent('Check out PRISMA by MADFAM');
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
