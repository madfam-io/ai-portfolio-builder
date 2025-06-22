/**
 * Hook for referral statistics
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserReferralStats } from '../types';

export interface UseReferralStatsState {
  stats: UserReferralStats | null;
  loading: boolean;
  error: Error | null;
}

export interface UseReferralStatsConfig {
  userId: string;
  apiEndpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useReferralStats(
  config: UseReferralStatsConfig
): UseReferralStatsState & {
  refresh: () => Promise<void>;
} {
  const {
    userId,
    apiEndpoint = '/api/referral',
    autoRefresh = true,
    refreshInterval = 60000,
  } = config;

  const [state, setState] = useState<UseReferralStatsState>({
    stats: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`${apiEndpoint}/user/${userId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const stats: UserReferralStats = await response.json();

      setState({
        stats,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
    }
  }, [userId, apiEndpoint]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, fetchStats]);

  return {
    ...state,
    refresh: fetchStats,
  };
}
