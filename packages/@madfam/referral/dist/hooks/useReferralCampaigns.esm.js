import { useState, useCallback, useEffect } from 'react';

function useReferralCampaigns(config = {}) {
  const { userId, apiEndpoint = "/api/referral/campaigns", autoRefresh = true, refreshInterval = 3e5 } = config;
  const [state, setState] = useState({
    campaigns: [],
    activeCampaigns: [],
    loading: true,
    error: null
  });
  const fetchCampaigns = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const url = userId ? `${apiEndpoint}?userId=${userId}` : apiEndpoint;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      const campaigns = await response.json();
      const activeCampaigns = campaigns.filter((c) => c.status === "active");
      setState({
        campaigns,
        activeCampaigns,
        loading: false,
        error: null
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error")
      }));
    }
  }, [userId, apiEndpoint]);
  const getCampaignById = useCallback(
    (id) => {
      return state.campaigns.find((c) => c.id === id);
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
    getCampaignById
  };
}

export { useReferralCampaigns };
