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
 * Hook for managing referral campaigns
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReferralCampaign } from '../types';

export interface UseReferralCampaignsState {
  campaigns: ReferralCampaign[];
  activeCampaigns: ReferralCampaign[];
  loading: boolean;
  error: Error | null;
}

export interface UseReferralCampaignsConfig {
  userId?: string;
  apiEndpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useReferralCampaigns(
  config: UseReferralCampaignsConfig = {}
): UseReferralCampaignsState & {
  refresh: () => Promise<void>;
  getCampaignById: (id: string) => ReferralCampaign | undefined;
} {
  const {
    userId,
    apiEndpoint = '/api/referral/campaigns',
    autoRefresh = true,
    refreshInterval = 300000,
  } = config;

  const [state, setState] = useState<UseReferralCampaignsState>({
    campaigns: [],
    activeCampaigns: [],
    loading: true,
    error: null,
  });

  const fetchCampaigns = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const url = userId ? `${apiEndpoint}?userId=${userId}` : apiEndpoint;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch campaigns');

      const campaigns: ReferralCampaign[] = await response.json();

      const activeCampaigns = campaigns.filter(c => c.status === 'active');

      setState({
        campaigns,
        activeCampaigns,
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

  const getCampaignById = useCallback(
    (id: string) => {
      return state.campaigns.find(c => c.id === id);
    },
    [state.campaigns]
  );

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCampaigns();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCampaigns]);

  return {
    ...state,
    refresh: fetchCampaigns,
    getCampaignById,
  };
}
