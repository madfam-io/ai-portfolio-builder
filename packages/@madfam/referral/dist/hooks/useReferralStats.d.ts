import { UserReferralStats } from '../types/index.js';

/**
 * Hook for referral statistics
 */

interface UseReferralStatsState {
    stats: UserReferralStats | null;
    loading: boolean;
    error: Error | null;
}
interface UseReferralStatsConfig {
    userId: string;
    apiEndpoint?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
declare function useReferralStats(config: UseReferralStatsConfig): UseReferralStatsState & {
    refresh: () => Promise<void>;
};

export { useReferralStats };
export type { UseReferralStatsConfig, UseReferralStatsState };
