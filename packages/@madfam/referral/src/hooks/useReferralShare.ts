/**
 * Hook for sharing referrals
 */

import { useState, useCallback } from 'react';
import type { Referral, SharePlatform } from '../types';

export interface ShareContent {
  text: string;
  url: string;
  hashtags?: string[];
  via?: string;
}

export interface UseReferralShareState {
  sharing: boolean;
  lastSharePlatform: SharePlatform | null;
  lastShareSuccess: boolean;
  error: Error | null;
}

export interface UseReferralShareConfig {
  baseUrl?: string;
  defaultHashtags?: string[];
  defaultVia?: string;
}

export function useReferralShare(config: UseReferralShareConfig = {}) {
  const {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.madfam.io',
    defaultHashtags = [],
    defaultVia = '',
  } = config;

  const [state, setState] = useState<UseReferralShareState>({
    sharing: false,
    lastSharePlatform: null,
    lastShareSuccess: false,
    error: null,
  });

  const generateShareUrl = useCallback(
    (referral: Referral): string => {
      return `${baseUrl}/signup?ref=${referral.code}`;
    },
    [baseUrl]
  );

  const generateShareContent = useCallback(
    (platform: SharePlatform, referral: Referral): ShareContent => {
      const shareUrl = generateShareUrl(referral);

      const templates: Record<
        SharePlatform,
        { text: string; hashtags?: string[]; via?: string }
      > = {
        twitter: {
          text: `🚀 Join me on this amazing platform! Use my referral link:`,
          hashtags: defaultHashtags.length > 0 ? defaultHashtags : ['referral'],
          via: defaultVia,
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
    [generateShareUrl, defaultHashtags, defaultVia]
  );

  const share = useCallback(
    async (platform: SharePlatform, referral: Referral): Promise<boolean> => {
      setState(prev => ({
        ...prev,
        sharing: true,
        error: null,
        lastSharePlatform: platform,
      }));

      try {
        const shareContent = generateShareContent(platform, referral);
        let success = false;

        switch (platform) {
          case 'copy_link':
            success = await copyToClipboard(shareContent.url);
            break;
          case 'twitter':
            success = await shareToSocialPlatform(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                shareContent.text
              )}&url=${encodeURIComponent(shareContent.url)}&hashtags=${
                shareContent.hashtags?.join(',') || ''
              }&via=${shareContent.via || ''}`
            );
            break;
          case 'linkedin':
            success = await shareToSocialPlatform(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareContent.url
              )}`
            );
            break;
          case 'facebook':
            success = await shareToSocialPlatform(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareContent.url
              )}`
            );
            break;
          case 'whatsapp':
            success = await shareToSocialPlatform(
              `https://wa.me/?text=${encodeURIComponent(
                `${shareContent.text} ${shareContent.url}`
              )}`
            );
            break;
          case 'email':
            window.location.href = `mailto:?subject=${encodeURIComponent(
              'Check this out!'
            )}&body=${encodeURIComponent(
              `${shareContent.text}\n\n${shareContent.url}`
            )}`;
            success = true;
            break;
          default:
            success = false;
        }

        setState(prev => ({
          ...prev,
          sharing: false,
          lastShareSuccess: success,
        }));

        return success;
      } catch (error) {
        setState(prev => ({
          ...prev,
          sharing: false,
          lastShareSuccess: false,
          error: error instanceof Error ? error : new Error('Share failed'),
        }));
        return false;
      }
    },
    [generateShareContent]
  );

  const copyLink = useCallback(
    async (referral: Referral): Promise<boolean> => {
      return share('copy_link', referral);
    },
    [share]
  );

  return {
    ...state,
    share,
    copyLink,
    generateShareContent,
    generateShareUrl,
  };
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
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
  } catch {
    return false;
  }
}

async function shareToSocialPlatform(url: string): Promise<boolean> {
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  const popup = window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  return !!popup;
}