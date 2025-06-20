import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { Mock, MockedClass } from 'jest-mock';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillingDashboard } from '@/components/dashboard/billing-dashboard';
import * as stripeEnhanced from '@/lib/services/stripe/stripe-enhanced';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/ui/toast';
import { useLanguage } from '@/lib/i18n/refactored-context';

jest.mock('@/lib/i18n/refactored-context');
jest.mock('next/navigation');
jest.mock('@/lib/services/stripe/stripe-enhanced');
jest.mock('@/lib/ui/toast');

/**
 * @jest-environment jsdom
 */

// Mock router
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn()
};

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock useRouter
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  
  // Mock useLanguage
  (useLanguage as jest.Mock).mockReturnValue({
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
    }
  });
  
  // Mock toast
  (toast as jest.Mock).mockReturnValue(undefined);
  
  // Mock Stripe enhanced functions
  (stripeEnhanced.createCheckoutSession as jest.Mock).mockResolvedValue({
    id: 'cs_test',
    url: 'https://checkout.stripe.com/test'
  });
  
  (stripeEnhanced.createPortalSession as jest.Mock).mockResolvedValue({
    id: 'bps_test',
    url: 'https://billing.stripe.com/test'
  });
  
  (stripeEnhanced.createAICreditCheckout as jest.Mock).mockResolvedValue({
    id: 'cs_credit_test',
    url: 'https://checkout.stripe.com/credits'
  });
});

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
      ai_credits: 25
    }
  };

  describe('Subscription Display', () => {
    it('should display current subscription details', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText(/Renews on/)).toBeInTheDocument();
    });

    it('should show AI credits balance', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('AI Credits')).toBeInTheDocument();
      expect(screen.getByText('25 credits remaining')).toBeInTheDocument();
    });

    it('should show expired status for past due subscriptions', async () => {
      const expiredProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_status: 'past_due' as const
        }
      };

      render(<BillingDashboard {...expiredProps} />);

      expect(screen.getByText('Past Due')).toBeInTheDocument();
    });

    it('should show free plan message when on free tier', async () => {
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const,
          subscription_status: null,
          subscription_period_end: null,
          stripe_customer_id: null
        }
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
      
      render(<BillingDashboard {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(stripeEnhanced.createPortalSession).toHaveBeenCalledWith({
          customerId: 'cus_123',
          returnUrl: expect.stringContaining('/dashboard/billing')
        });
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
        'https://billing.stripe.com/test'
      );
    });

    it('should handle portal session errors', async () => {
      const user = userEvent.setup();
      (stripeEnhanced.createPortalSession as jest.Mock).mockRejectedValue(
        new Error('Portal creation failed')
      );

      render(<BillingDashboard {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to open billing portal',
          variant: 'destructive'
        });
      });
    });

    it('should show loading state while creating portal session', async () => {
      const user = userEvent.setup();
      (stripeEnhanced.createPortalSession as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<BillingDashboard {...defaultProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i
      });
      await user.click(manageButton);

      expect(screen.getByRole('button', { name: /Loading/i })).toBeDisabled();
    });
  });

  describe('Plan Upgrade', () => {
    it('should show upgrade options for free users', async () => {
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const
        }
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

    it('should allow upgrading to higher tier plans', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Upgrade to Business/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Upgrade to Pro/i })
      ).not.toBeInTheDocument();
    });

    it('should create checkout session on upgrade', async () => {
      const user = userEvent.setup();
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const
        }
      };

      render(<BillingDashboard {...freeUserProps} />);

      const upgradeButton = screen.getByRole('button', {
        name: /Upgrade to Pro/i
      });
      await user.click(upgradeButton);

      await waitFor(() => {
        expect(stripeEnhanced.createCheckoutSession).toHaveBeenCalledWith({
          userId: 'user_123',
          email: 'test@example.com',
          planId: 'pro',
          successUrl: expect.stringContaining(
            '/dashboard/billing?success=true'
          ),
          cancelUrl: expect.stringContaining('/dashboard/billing'),
          usePromotionalPrice: true
        });
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
        'https://checkout.stripe.com/test'
      );
    });

    it('should show plan comparison features', async () => {
      const freeUserProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          subscription_plan: 'free' as const
        }
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
    it('should display current credit balance', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('25 credits remaining')).toBeInTheDocument();
    });

    it('should show buy credits section', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Buy AI Credits')).toBeInTheDocument();
      expect(screen.getByText('Small Pack')).toBeInTheDocument();
      expect(screen.getByText('Medium Pack')).toBeInTheDocument();
      expect(screen.getByText('Large Pack')).toBeInTheDocument();
    });

    it('should purchase AI credits on click', async () => {
      const user = userEvent.setup();
      
      render(<BillingDashboard {...defaultProps} />);

      const buyButton = screen.getByRole('button', { name: /Buy 25 credits/i });
      await user.click(buyButton);

      await waitFor(() => {
        expect(stripeEnhanced.createAICreditCheckout).toHaveBeenCalledWith({
          userId: 'user_123',
          email: 'test@example.com',
          packId: 'medium',
          successUrl: expect.stringContaining(
            '/dashboard/billing?credits=true'
          ),
          cancelUrl: expect.stringContaining('/dashboard/billing')
        });
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
        'https://checkout.stripe.com/credits'
      );
    });
  });

  describe('Invoice History', () => {
    it('should show invoice history section', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Invoice History')).toBeInTheDocument();
      expect(
        screen.getByText('View and download your past invoices')
      ).toBeInTheDocument();
    });

    it('should link to Stripe portal for invoice history', async () => {
      const user = userEvent.setup();
      
      render(<BillingDashboard {...defaultProps} />);

      const viewInvoicesButton = screen.getByRole('button', {
        name: /View Invoices/i
      });
      await user.click(viewInvoicesButton);

      await waitFor(() => {
        expect(stripeEnhanced.createPortalSession).toHaveBeenCalled();
      });
    });
  });

  describe('Success Messages', () => {
    it('should show success message after successful payment', async () => {
      // Mock window.location.search
      delete (window as any).location;
      window.location = { search: '?success=true' } as any;

      render(<BillingDashboard {...defaultProps} />);

      expect(
        screen.getByText('Payment successful! Your plan has been updated.')
      ).toBeInTheDocument();
    });

    it('should show credit purchase success message', async () => {
      delete (window as any).location;
      window.location = { search: '?credits=true' } as any;

      render(<BillingDashboard {...defaultProps} />);

      expect(
        screen.getByText('Credit purchase successful!')
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
          subscription_plan: 'free' as const
        }
      };

      (stripeEnhanced.createCheckoutSession as jest.Mock).mockRejectedValue(new Error('Checkout failed'));

      render(<BillingDashboard {...freeUserProps} />);

      const upgradeButton = screen.getByRole('button', {
        name: /Upgrade to Pro/i
      });
      await user.click(upgradeButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to start checkout',
          variant: 'destructive'
        });
      });
    });

    it('should disable actions when no customer ID', async () => {
      const noCustomerProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          stripe_customer_id: null
        }
      };

      render(<BillingDashboard {...noCustomerProps} />);

      const manageButton = screen.getByRole('button', {
        name: /Manage Subscription/i
      });
      expect(manageButton).toBeDisabled();
    });
  });

  describe('Plan Limits', () => {
    it('should show usage against plan limits', async () => {
      render(<BillingDashboard {...defaultProps} />);

      expect(screen.getByText('Plan Usage')).toBeInTheDocument();
      // Pro plan has 5 portfolios limit
      expect(screen.getByText(/of 5 portfolios/)).toBeInTheDocument();
      // Pro plan has 50 AI requests
      expect(screen.getByText(/of 50 AI requests/)).toBeInTheDocument();
    });

    it('should highlight when approaching limits', async () => {
      const nearLimitProps = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          ai_credits: 5, // Low credits
        }
      };

      render(<BillingDashboard {...nearLimitProps} />);

      expect(screen.getByText(/Running low on credits/i)).toBeInTheDocument();
    });
  });
});