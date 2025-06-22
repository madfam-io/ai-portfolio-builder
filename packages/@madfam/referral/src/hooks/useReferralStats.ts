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
