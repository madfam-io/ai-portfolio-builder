import { Referral, ReferralCampaign, ReferralReward, UserReferralStats, ReferralError, CreateReferralResponse, CreateReferralRequest, SharePlatform } from '../types/index.js';

/**
 * Main referral hook - provides comprehensive referral functionality
 */

interface UseReferralState {
    referrals: Referral[];
    activeReferral: Referral | null;
    availableCampaigns: ReferralCampaign[];
    currentCampaign: ReferralCampaign | null;
    rewards: ReferralReward[];
    totalEarnings: number;
    pendingRewards: number;
    stats: UserReferralStats | null;
    loading: boolean;
    creating: boolean;
    sharing: boolean;
    error: ReferralError | null;
    lastCreatedReferral: CreateReferralResponse | null;
    lastShareSuccess: boolean;
}
interface UseReferralActions {
    createReferral: (request?: CreateReferralRequest) => Promise<CreateReferralResponse | null>;
    refreshReferrals: () => Promise<void>;
    shareToSocial: (platform: SharePlatform, referral?: Referral) => Promise<boolean>;
    copyShareLink: (referral?: Referral) => Promise<boolean>;
    generateShareContent: (platform: SharePlatform, referral?: Referral) => ShareContent;
    selectCampaign: (campaign: ReferralCampaign) => void;
    refreshCampaigns: () => Promise<void>;
    clearError: () => void;
    refetch: () => Promise<void>;
}
interface ShareContent {
    text: string;
    url: string;
    hashtags?: string[];
    via?: string;
}
interface UseReferralConfig {
    userId: string;
    apiEndpoint?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
/**
 * Main referral hook - provides comprehensive referral functionality
 */
declare function useReferral(config: UseReferralConfig): UseReferralState & UseReferralActions;

export { useReferral };
export type { ShareContent, UseReferralActions, UseReferralConfig, UseReferralState };
