import { SharePlatform, Referral } from '../types/index.js';

/**
 * Hook for sharing referrals
 */

interface ShareContent {
    text: string;
    url: string;
    hashtags?: string[];
    via?: string;
}
interface UseReferralShareConfig {
    baseUrl?: string;
    defaultHashtags?: string[];
    defaultVia?: string;
}
declare function useReferralShare(config?: UseReferralShareConfig): {
    share: (platform: SharePlatform, referral: Referral) => Promise<boolean>;
    copyLink: (referral: Referral) => Promise<boolean>;
    generateShareContent: (platform: SharePlatform, referral: Referral) => ShareContent;
    generateShareUrl: (referral: Referral) => string;
    sharing: boolean;
    lastSharePlatform: SharePlatform | null;
    lastShareSuccess: boolean;
    error: Error | null;
};

export { useReferralShare };
export type { ShareContent, UseReferralShareConfig };
