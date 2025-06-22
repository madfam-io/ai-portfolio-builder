import { useState, useCallback, useEffect } from 'react';

function useReferralStats(config) {
  const { userId, apiEndpoint = "/api/referral", autoRefresh = true, refreshInterval = 6e4 } = config;
  const [state, setState] = useState({
    stats: null,
    loading: true,
    error: null
  });
  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch(`${apiEndpoint}/user/${userId}/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const stats = await response.json();
      setState({
        stats,
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
    refresh: fetchStats
  };
}

export { useReferralStats };
