/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillingDashboard } from '@/components/dashboard/billing-dashboard';
import * as stripeEnhanced from '@/lib/services/stripe/stripe-enhanced';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/ui/toast';


// Mock dependencies

// Mock useLanguage hook
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: {
      welcomeMessage: 'Welcome',
      heroTitle: 'Create Your Portfolio',
      getStarted: 'Get Started',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      enhanceWithAI: 'Enhance with AI',
      publish: 'Publish',
      preview: 'Preview',
      // Add more translations as needed
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation');
jest.mock('@/lib/services/stripe/stripe-enhanced');
jest.mock('@/lib/ui/toast');
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => ({
    t: {
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
    },
  }),
}));

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

const mockUseRouter = jest.mocked(useRouter);
const mockCreateCheckoutSession = jest.mocked(
  stripeEnhanced.createCheckoutSession

const mockCreatePortalSession = jest.mocked(stripeEnhanced.createPortalSession);
const mockCreateAICreditCheckout = jest.mocked(
  stripeEnhanced.createAICreditCheckout

const mockToast = jest.mocked(toast);

describe('BillingDashboard', () => {
  const defaultProps = {
    user: {
      id: 'user_123',
      email: 'test@example.com',
      subscription_plan: 'pro' as const,
      subscription_status: 'active' as const,
      subscription_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      stripe_customer_id: 'cus_123',
      ai_credits: 25,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe('Subscription Display', () => {
    it('should display current subscription details', () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Billing & Subscription')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText(/\$24\.00\/month/)).toBeInTheDocument();
    });

    it('should show promotional pricing when active', () => {
      render(<BillingDashboard {...defaultProps} />);

      // Should show both original and promotional prices
      expect(screen.getByText(/\$24\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$12\.00/)).toBeInTheDocument();
      expect(screen.getByText(/50% off/i)).toBeInTheDocument();
    });

    it('should display next billing date', () => {
      render(<BillingDashboard {...defaultProps} />);

      const nextBillingDate = new Date(
        defaultProps.user.subscription_period_end

      const formattedDate = nextBillingDate.toLocaleDateString();

      expect(screen.getByText(/Next billing/i)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
    });

    it('should show free plan message when on free tier', () => {
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const,
          subscription_status: null,
          subscription_period_end: null,
          stripe_customer_id: null,
        },
      };

      render(<BillingDashboard {...freeUserProps} />);

      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(
        screen.getByText('Upgrade to unlock more features')
      ).toBeInTheDocument();
    });
  });

  describe('Manage Subscription', () => {
    it('should open Stripe portal when clicking manage button', async () => {
      const user = userEvent.setup();
      mockCreatePortalSession.mockResolvedValue({
        id: 'bps_123',
        url: 'https://billing.stripe.com/session',
      });

      render(<BillingDashboard {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i,
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(mockCreatePortalSession).toHaveBeenCalledWith({
          customerId: 'cus_123',
          returnUrl: expect.stringContaining('/dashboard/billing'),
        });
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
      'https://billing.stripe.com/session'
    );
  });

    it('should handle portal session errors', async () => {
      const user = userEvent.setup();
      mockCreatePortalSession.mockRejectedValue(
        new Error('Portal creation failed')

      render(<BillingDashboard {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i,
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
      {
          title: 'Error',
          description: 'Failed to open billing portal',
          variant: 'destructive',
    );
  });
      });
    });

    it('should show loading state while creating portal session', async () => {
      const user = userEvent.setup();
      mockCreatePortalSession.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))

      render(<BillingDashboard {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i,
      });
      await user.click(manageButton);

      expect(screen.getByRole('button', { name: /Loading/i })).toBeDisabled();
    });
  });

  describe('Plan Upgrade', () => {
    it('should show upgrade options for free users', () => {
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const,
        },
      };

      render(<BillingDashboard {...freeUserProps} />);

      expect(screen.getByText('Available Plans')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Upgrade to Pro/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Upgrade to Business/i })
      ).toBeInTheDocument();
    });

    it('should create checkout session on upgrade', async () => {
      const user = userEvent.setup();
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const,
        },
      };

      mockCreateCheckoutSession.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      });

      render(<BillingDashboard {...freeUserProps} />);

      const upgradeButton = screen.getByRole('button', {
        name: /Upgrade to Pro/i,
      });
      await user.click(upgradeButton);

      await waitFor(() => {
        expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
          userId: 'user_123',
          email: 'test@example.com',
          planId: 'pro',
          successUrl: expect.stringContaining(
            '/dashboard/billing?success=true'
          ),
          cancelUrl: expect.stringContaining('/dashboard/billing'),
          usePromotionalPrice: true,
        });
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
      'https://checkout.stripe.com/session'
    );
  });

    it('should show plan comparison features', () => {
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const,
        },
      };

      render(<BillingDashboard {...freeUserProps} />);

      // Pro plan features
      expect(screen.getByText('5 portfolios')).toBeInTheDocument();
      expect(screen.getByText('50 AI enhancements/month')).toBeInTheDocument();

      // Business plan features
      expect(screen.getByText('25 portfolios')).toBeInTheDocument();
      expect(screen.getByText('200 AI enhancements/month')).toBeInTheDocument();
    });
  });

  describe('AI Credits', () => {
    it('should display current AI credit balance', () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('AI Credits')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Available credits')).toBeInTheDocument();
    });

    it('should show AI credit packs', () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Buy More Credits')).toBeInTheDocument();
      expect(screen.getByText('Small Pack')).toBeInTheDocument();
      expect(screen.getByText('Medium Pack')).toBeInTheDocument();
      expect(screen.getByText('Large Pack')).toBeInTheDocument();
    });

    it('should purchase AI credits on click', async () => {
      const user = userEvent.setup();
      mockCreateAICreditCheckout.mockResolvedValue({
        id: 'cs_credits',
        url: 'https://checkout.stripe.com/credits',
      });

      render(<BillingDashboard {...defaultProps} />);

      const buyButton = screen.getByRole('button', { name: /Buy 25 credits/i });
      await user.click(buyButton);

      await waitFor(() => {
        expect(mockCreateAICreditCheckout).toHaveBeenCalledWith({
          userId: 'user_123',
          email: 'test@example.com',
          packId: 'medium',
          successUrl: expect.stringContaining(
            '/dashboard/billing?credits=true'
          ),
          cancelUrl: expect.stringContaining('/dashboard/billing'),
        });
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
      'https://checkout.stripe.com/credits'
    );
  });
  });

  describe('Invoice History', () => {
    it('should display invoice history section', () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Invoice History')).toBeInTheDocument();
      expect(
        screen.getByText('View and download your past invoices')
      ).toBeInTheDocument();
    });

    it('should link to Stripe portal for invoice history', async () => {
      const user = userEvent.setup();
      mockCreatePortalSession.mockResolvedValue({
        id: 'bps_123',
        url: 'https://billing.stripe.com/session',
      });

      render(<BillingDashboard {...defaultProps} />);

      const viewInvoicesButton = screen.getByRole('button', {
        name: /View Invoices/i,
      });
      await user.click(viewInvoicesButton);

      await waitFor(() => {
        expect(mockCreatePortalSession).toHaveBeenCalled();
      });
    });
  });

  describe('Success Messages', () => {
    it('should show success message after subscription', () => {
      // Mock URL params
      delete (window as any).location;
      (window as any).location = { search: '?success=true' };

      render(<BillingDashboard {...defaultProps} />);

      expect(
        screen.getByText(/Subscription updated successfully/i)
      ).toBeInTheDocument();
    });

    it('should show success message after credit purchase', () => {
      delete (window as any).location;
      (window as any).location = { search: '?credits=true' };

      render(<BillingDashboard {...defaultProps} />);

      expect(
        screen.getByText(/Credits added to your account/i)
      ).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should handle checkout session creation errors', async () => {
      const user = userEvent.setup();
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const,
        },
      };

      mockCreateCheckoutSession.mockRejectedValue(new Error('Checkout failed'));

      render(<BillingDashboard {...freeUserProps} />);

      const upgradeButton = screen.getByRole('button', {
        name: /Upgrade to Pro/i,
      });
      await user.click(upgradeButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
      {
          title: 'Error',
          description: 'Failed to start checkout',
          variant: 'destructive',
    );
  });
      });
    });

    it('should disable actions when no customer ID', () => {
      const noCustomerProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          stripe_customer_id: null,
        },
      };

      render(<BillingDashboard {...noCustomerProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i,
      });
      expect(manageButton).toBeDisabled();
    });
  });

  describe('Plan Limits', () => {
    it('should show usage against plan limits', () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText(/5 portfolios included/i)).toBeInTheDocument();
      expect(screen.getByText(/50 AI requests\/month/i)).toBeInTheDocument();
    });

    it('should highlight when approaching limits', () => {
      const nearLimitProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          ai_credits: 5, // Low credits
        },
      };

      render(<BillingDashboard {...nearLimitProps} />);

      expect(screen.getByText(/Running low on credits/i)).toBeInTheDocument();
    });
  });
});
