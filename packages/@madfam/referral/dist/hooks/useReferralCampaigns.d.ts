import { ReferralCampaign } from '../types/index.js';

/**
 * Hook for managing referral campaigns
 */

interface UseReferralCampaignsState {
    campaigns: ReferralCampaign[];
    activeCampaigns: ReferralCampaign[];
    loading: boolean;
    error: Error | null;
}
interface UseReferralCampaignsConfig {
    userId?: string;
    apiEndpoint?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
declare function useReferralCampaigns(config?: UseReferralCampaignsConfig): UseReferralCampaignsState & {
    refresh: () => Promise<void>;
    getCampaignById: (id: string) => ReferralCampaign | undefined;
};

export { useReferralCampaigns };
export type { UseReferralCampaignsConfig, UseReferralCampaignsState };
