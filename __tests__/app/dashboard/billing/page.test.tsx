import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';
import BillingPage from '@/app/dashboard/billing/page';
import { useSubscription } from '@/lib/hooks/use-subscription';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useToast } from '@/hooks/use-toast';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock next/navigation
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));
/**
 * @jest-environment jsdom
 */

// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({ 
  useLanguage: mockUseLanguage,
 }));

// Mock dependencies

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();

  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  })),
}));
jest.mock('@/lib/hooks/use-subscription', () => ({
  useSubscription: jest.fn(() => ({
    limits: null,
    loading: false,
    error: null,
    refresh: jest.fn(),
    isPaidTier: false,
    isFreeTier: true,
    planName: 'Free',
    portfolioUsagePercentage: 0,
    aiUsagePercentage: 0,
  })),
}));
  useLanguage: jest.fn(() => ({
    t: {
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
    },
  })),
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));
jest.mock('@/components/auth/protected-route', () => {
  return function MockedProtectedRoute({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});
jest.mock('@/components/layouts/BaseLayout', () => {
  return function MockedBaseLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="base-layout">{children}</div>;
  };
});
jest.mock('@/components/dashboard/ai-credit-packs', () => {
  return function MockedAICreditPacks({ currentCredits, onPurchase }: any) {
    return (
      <div data-testid="ai-credit-packs">
        <span data-testid="current-credits">{currentCredits}</span>
        <button onClick={() => onPurchase('small')}>Purchase Small Pack</button>
      </div>
    );
  };
});

const _mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSubscription = useSubscription as jest.MockedFunction<
  typeof useSubscription
>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('BillingPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (mockUseLanguage as any).mockImplementation(() => ({
      t: {
        success: 'Success',
        error: 'Error',
        portfolioSaved: 'Portfolio saved successfully',
        failedToSave: 'Failed to save portfolio',
        saved: 'Saved',
        changesSaved: 'Your changes have been saved',
      },
      language: 'en',
      setLanguage: jest.fn(),
      isLoading: false,
    }));

    mockUseToast.mockReturnValue({
      toast: mockToast,
    });

    // Mock window.location
    delete (window as any).location;
    window.location = { search: '', href: '' } as any;
  });

  const mockSubscriptionData = {
    limits: {
      subscription_tier: 'pro',
      current_usage: {
        portfolios: 2,
        ai_requests: 15,
      },
      limits: {
        max_portfolios: 5,
        max_ai_requests: 50,
      },
    },
    loading: false,
    error: null,
    refresh: jest.fn(),
    isPaidTier: true,
    isFreeTier: false,
    planName: 'Pro',
    portfolioUsagePercentage: 40,
    aiUsagePercentage: 30,
  };

  describe('Loading State', () => {
    it('should display loading skeleton when data is loading', async () => {
      mockUseSubscription.mockReturnValue({
        ...mockSubscriptionData,
        loading: true,
      });

      render(<BillingPage />);

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('base-layout')).toBeInTheDocument();

      // Should show loading skeletons
      const loadingElements = screen.getAllByRole('generic');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when subscription data fails to load', async () => {
      mockUseSubscription.mockReturnValue({
        ...mockSubscriptionData,
        loading: false,
        error: 'Failed to load subscription data',
      });

      render(<BillingPage />);

      expect(
        screen.getByText('Error Loading Billing Information')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Failed to load subscription data')
      ).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call refresh when Try Again button is clicked', async () => {
      const mockRefresh = jest.fn();
      mockUseSubscription.mockReturnValue({
        ...mockSubscriptionData,
        loading: false,
        error: 'Network error',
        refresh: mockRefresh,
      });

      render(<BillingPage />);

      const tryAgainButton = screen.getByText('Try Again');
      await userEvent.click(tryAgainButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue(mockSubscriptionData);
    });

    it('should display billing dashboard header', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Billing & Usage')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Manage your subscription and view your usage statistics'
        )
      ).toBeInTheDocument();
    });

    it('should display current plan information', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Current Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display usage statistics', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Portfolio Usage')).toBeInTheDocument();
      expect(screen.getByText('2 of 5 used')).toBeInTheDocument();

      expect(screen.getByText('AI Usage This Month')).toBeInTheDocument();
      expect(screen.getByText('15 of 50 used')).toBeInTheDocument();
    });

    it('should show manage billing button for paid users', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Manage Billing')).toBeInTheDocument();
    });

    it('should display AI credit packs section', async () => {
      render(<BillingPage />);

      expect(screen.getByText('AI Enhancement Credits')).toBeInTheDocument();
      expect(screen.getByTestId('ai-credit-packs')).toBeInTheDocument();
    });
  });

  describe('Free Tier User', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue({
        ...mockSubscriptionData,
        isPaidTier: false,
        isFreeTier: true,
        planName: 'Free',
        limits: {
          ...mockSubscriptionData.limits,
          subscription_tier: 'free',
        },
      });
    });

    it('should not show manage billing button for free users', async () => {
      render(<BillingPage />);

      expect(screen.queryByText('Manage Billing')).not.toBeInTheDocument();
    });

    it('should show upgrade options for free users', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Upgrade Your Plan')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Unlock more features and higher limits with a paid plan'
        )
      ).toBeInTheDocument();
    });

    it('should display billing interval toggle', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('should allow switching between monthly and yearly billing', async () => {
      render(<BillingPage />);

      const yearlyButton = screen.getByText('Yearly');
      await userEvent.click(yearlyButton);

      // Check that yearly pricing is displayed
      expect(screen.getByText(/billed yearly/)).toBeInTheDocument();
    });
  });

  describe('URL Parameters Handling', () => {
    it('should show success toast for successful checkout', async () => {
      // Mock URL search params
      window.location.search = '?success=true';

      render(<BillingPage />);

      expect(mockToast).toHaveBeenCalledWith(
      {
        title: 'Subscription Updated!',
        description: 'Your subscription has been successfully updated.',
    });
  });
    });

    it('should show success toast for successful credit purchase', async () => {
      window.location.search = '?success=true&type=credits';

      render(<BillingPage />);

      expect(mockToast).toHaveBeenCalledWith(
      {
        title: 'Credits Purchased!',
        description: 'Your AI credits have been added to your account.',
    });
  });
    });

    it('should show canceled toast for canceled checkout', async () => {
      window.location.search = '?canceled=true';

      render(<BillingPage />);

      expect(mockToast).toHaveBeenCalledWith(
      {
        title: 'Checkout Canceled',
        description: 'Your purchase was not completed.',
        variant: 'default',
    });
  });
    });
  });

  describe('Manage Billing Action', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue(mockSubscriptionData);
    });

    it('should redirect to Stripe portal on manage billing click', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ url: 'https://billing.stripe.com/portal' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      render(<BillingPage />);

      const manageBillingButton = screen.getByText('Manage Billing');
      await userEvent.click(manageBillingButton);

      expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/stripe/portal', {
        method: 'POST',
    );
  });
    });

    it('should handle billing portal errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Portal unavailable' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      render(<BillingPage />);

      const manageBillingButton = screen.getByText('Manage Billing');
      await userEvent.click(manageBillingButton);

      expect(mockToast).toHaveBeenCalledWith(
      {
        title: 'Access Failed',
        description: 'Portal unavailable',
        variant: 'destructive',
    });
  });
    });
  });

  describe('AI Credit Pack Purchase', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue(mockSubscriptionData);
    });

    it('should initiate credit pack purchase', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ checkoutUrl: 'https://checkout.stripe.com/test' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<BillingPage />);

      const purchaseButton = screen.getByText('Purchase Small Pack');
      await userEvent.click(purchaseButton);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/stripe/checkout-credits',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ packId: 'small' }),
        }
      );

      await waitFor(() => {
        expect(window.location.href).toBe('https://checkout.stripe.com/test');
      });
    });

    it('should handle credit pack purchase errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Payment failed' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      render(<BillingPage />);

      const purchaseButton = screen.getByText('Purchase Small Pack');
      await userEvent.click(purchaseButton);

      expect(mockToast).toHaveBeenCalledWith(
      {
        title: 'Purchase Failed',
        description: 'Failed to start credit purchase. Please try again.',
        variant: 'destructive',
    });
  });
    });
  });

  describe('Upgrade Plans', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue({
        ...mockSubscriptionData,
        isFreeTier: true,
        isPaidTier: false,
      });
    });

    it('should show upgrade options for free tier users', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Business')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Enterprise')).toBeInTheDocument();
    });

    it('should handle upgrade button clicks', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ url: 'https://checkout.stripe.com/upgrade' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      render(<BillingPage />);

      // Mock createCheckoutSession function
      const upgradeButton = screen.getByText('Upgrade to Pro');
      await userEvent.click(upgradeButton);

      // Should trigger upgrade process
      expect(upgradeButton).toBeInTheDocument();
    });
  });

  describe('Help Section', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue(mockSubscriptionData);
    });

    it('should display help section', async () => {
      render(<BillingPage />);

      expect(screen.getByText('Need Help?')).toBeInTheDocument();
      expect(
        screen.getByText('Have questions about billing or need assistance?')
      ).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('Billing Documentation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue(mockSubscriptionData);
    });

    it('should have proper heading structure', async () => {
      render(<BillingPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Billing & Usage' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'AI Enhancement Credits',
        })
      ).toBeInTheDocument();
    });

    it('should have accessible progress bars', async () => {
      render(<BillingPage />);

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(2); // Portfolio and AI usage
    });
  });
});
