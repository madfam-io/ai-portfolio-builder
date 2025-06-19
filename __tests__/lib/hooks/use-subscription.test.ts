import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';

import {   useSubscription,

jest.mock('@/lib/utils/logger', () => ({

/**
 * @jest-environment jsdom
 */

  useCanPerformAction,
 } from '@/lib/hooks/use-subscription';

// Mock fetch
global.fetch = jest.fn().mockReturnValue(void 0);

// Mock logger

  logger: {
    error: jest.fn().mockReturnValue(void 0),
    info: jest.fn().mockReturnValue(void 0),
    warn: jest.fn().mockReturnValue(void 0),
  },
}));

const mockLimitsResponse = {
  subscription_tier: 'free',
  subscription_status: 'active',
  current_usage: {
    portfolios: 1,
    ai_requests: 2,
  },
  limits: {
    max_portfolios: 1,
    max_ai_requests: 3,
  },
  can_create_portfolio: false,
  can_use_ai: true,
};

describe('useSubscription Hook', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch limits on mount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLimitsResponse),
    });

    const { result } = renderHook(() => useSubscription());

    expect(result.current.loading).toBe(true);
    expect(result.current.limits).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.limits).toEqual(mockLimitsResponse);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.limits).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle API error response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.limits).toBe(null);
    expect(result.current.error).toBe('Unauthorized');
  });

  it('should calculate usage percentages correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLimitsResponse),
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.portfolioUsagePercentage).toBe(100); // 1/1 * 100
    expect(result.current.aiUsagePercentage).toBe(67); // 2/3 * 100, rounded
  });

  it('should handle unlimited plans', async () => {
    const unlimitedResponse = {
      ...mockLimitsResponse,
      subscription_tier: 'enterprise',
      limits: {
        max_portfolios: -1,
        max_ai_requests: -1,
      },
      can_create_portfolio: true,
      can_use_ai: true,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(unlimitedResponse),
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.portfolioUsagePercentage).toBe(0); // Unlimited = 0%
    expect(result.current.aiUsagePercentage).toBe(0); // Unlimited = 0%
    expect(result.current.canCreatePortfolio).toBe(true);
    expect(result.current.canUseAI).toBe(true);
  });

  it('should determine upgrade requirements correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLimitsResponse),
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isUpgradeRequired('portfolio')).toBe(true); // At limit
    expect(result.current.isUpgradeRequired('ai')).toBe(false); // Still has quota
  });

  it('should identify plan tiers correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLimitsResponse),
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.planName).toBe('Free');
    expect(result.current.isFreeTier).toBe(true);
    expect(result.current.isPaidTier).toBe(false);
  });

  it('should handle Pro plan correctly', async () => {
    const proResponse = {
      ...mockLimitsResponse,
      subscription_tier: 'pro',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(proResponse),
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.planName).toBe('Pro');
    expect(result.current.isFreeTier).toBe(false);
    expect(result.current.isPaidTier).toBe(true);
  });

  it('should refresh limits when requested', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLimitsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockLimitsResponse,
            current_usage: { portfolios: 0, ai_requests: 1 },
          }),
      });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.limits?.current_usage.portfolios).toBe(1);

    // Refresh limits
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.limits?.current_usage.portfolios).toBe(0);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('useCanPerformAction Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should return loading state initially', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useCanPerformAction('portfolio'));

    expect(result.current.loading).toBe(true);
    expect(result.current.canPerform).toBe(false);
  });

  it('should return correct permissions for portfolio action', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLimitsResponse),
    });

    const { result } = renderHook(() => useCanPerformAction('portfolio'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canPerform).toBe(false); // At limit
  });

  it('should return correct permissions for AI action', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLimitsResponse),
    });

    const { result } = renderHook(() => useCanPerformAction('ai'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canPerform).toBe(true); // Still has quota
  });
});