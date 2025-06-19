import React from 'react';

// Mock UI store with showToast
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
  })),
}));

import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    redirectToCheckout: jest.fn().mockResolvedValue({ error: null }),
  }),
}));

// Create mock for createCheckoutSession
const mockCreateCheckoutSession = jest.fn();

/**
 * @jest-environment jsdom
 */

// Mock i18n
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

jest.mock('@/lib/stripe/client', () => ({
  createCheckoutSession: mockCreateCheckoutSession,
  PLAN_CONFIG: {
    pro: {
      name: 'Pro',
      price: 1500,
      features: {
        portfolios: 5,
        aiRequests: 50,
        customDomain: true,
        analytics: true,
        prioritySupport: false,
      },
    },
    business: {
      name: 'Business',
      price: 3900,
      features: {
        portfolios: 25,
        aiRequests: 200,
        customDomain: true,
        analytics: true,
        prioritySupport: true,
      },
    },
    enterprise: {
      name: 'Enterprise',
      price: 7900,
      features: {
        portfolios: -1,
        aiRequests: -1,
        customDomain: true,
        analytics: true,
        prioritySupport: true,
      },
    },
  },
  formatPrice: (amount: number) => `$${(amount / 100).toFixed(2)}`,
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variant} ${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className}`}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={`card-content ${className}`}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={`card-header ${className}`}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={`card-title ${className}`}>{children}</h3>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({ 
  X: () => <span>X</span>,
  Check: () => <span>✓</span>,
  Crown: () => <span>👑</span>,
  Zap: () => <span>⚡</span>,
  Users: () => <span>👥</span>,
 }));

// Mock ui-store
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: () => ({
    showToast: jest.fn(),
  }),
}));

// Mock toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('UpgradeModal', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    reason: 'ai_limit' as const,
    currentPlan: 'free',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', async () => {
    render(<UpgradeModal {...defaultProps} />);

    expect(screen.getByText('AI Usage Limit Reached')).toBeInTheDocument();
    expect(
      screen.getByText(/You've reached your monthly AI enhancement limit/)
    ).toBeInTheDocument();
  });

  it('should not render when closed', async () => {
    render(<UpgradeModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText('AI Usage Limit Reached')
    ).not.toBeInTheDocument();
  });

  it('should show different content for portfolio limit', async () => {
    render(<UpgradeModal {...defaultProps} reason="portfolio_limit" />);

    expect(screen.getByText('Portfolio Limit Reached')).toBeInTheDocument();
    expect(
      screen.getByText(/You've reached your portfolio creation limit/)
    ).toBeInTheDocument();
  });

  it('should display all plan options', async () => {
    render(<UpgradeModal {...defaultProps} />);

    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();

    expect(screen.getByText('$15.00/month')).toBeInTheDocument();
    expect(screen.getByText('$39.00/month')).toBeInTheDocument();
    expect(screen.getByText('$79.00/month')).toBeInTheDocument();
  });

  it('should show recommended badge for Pro plan', async () => {
    render(<UpgradeModal {...defaultProps} />);

    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    render(<UpgradeModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const onClose = jest.fn();
    render(<UpgradeModal {...defaultProps} onClose={onClose} />);

    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when "Maybe later" is clicked', async () => {
    const onClose = jest.fn();
    render(<UpgradeModal {...defaultProps} onClose={onClose} />);

    const maybeLaterButton = screen.getByText('Maybe later');
    fireEvent.click(maybeLaterButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should initiate checkout when upgrade button is clicked', async () => {
    mockCreateCheckoutSession.mockResolvedValue({ success: true });

    render(<UpgradeModal {...defaultProps} />);

    const upgradeButton = screen.getByText('Upgrade to Pro');
    fireEvent.click(upgradeButton);

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
      planId: 'pro'
    });
  });

  it('should show loading state during upgrade', async () => {
    mockCreateCheckoutSession.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<UpgradeModal {...defaultProps} />);

    const upgradeButton = screen.getByText('Upgrade to Pro');
    fireEvent.click(upgradeButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  });

  it('should show error toast on checkout failure', async () => {
    mockCreateCheckoutSession.mockResolvedValue({
      success: false,
      error: 'Payment failed',
    });

    render(<UpgradeModal {...defaultProps} />);

    const upgradeButton = screen.getByText('Upgrade to Pro');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Upgrade Failed',
        description: 'Payment failed',
        variant: 'destructive',
      });
    });
  });

  it('should handle checkout session errors', async () => {
    mockCreateCheckoutSession.mockRejectedValue(
      new Error('Network error')
    );

    render(<UpgradeModal {...defaultProps} />);

    const upgradeButton = screen.getByText('Upgrade to Pro');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Upgrade Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    });
  });

  it('should display plan features correctly', async () => {
    render(<UpgradeModal {...defaultProps} />);

    // Check Pro plan features
    expect(screen.getByText('5 portfolios')).toBeInTheDocument();
    expect(screen.getByText('50 AI requests')).toBeInTheDocument();

    // Check Enterprise plan features
    expect(screen.getByText('Unlimited portfolios')).toBeInTheDocument();
    expect(screen.getByText('Unlimited AI requests')).toBeInTheDocument();
  });

  it('should show current plan information', async () => {
    render(<UpgradeModal {...defaultProps} currentPlan="free" />);

    expect(screen.getByText('Current Plan: Free')).toBeInTheDocument();
  });

  it('should display benefits section', async () => {
    render(<UpgradeModal {...defaultProps} />);

    expect(screen.getByText('Why upgrade?')).toBeInTheDocument();
    expect(
      screen.getByText('Immediate access to all features')
    ).toBeInTheDocument();
    expect(
      screen.getByText('7-day free trial on all plans')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Cancel anytime, no questions asked')
    ).toBeInTheDocument();
    expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument();
  });

  it('should disable other buttons while one is processing', async () => {
    mockCreateCheckoutSession.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<UpgradeModal {...defaultProps} />);

    const proButton = screen.getByText('Upgrade to Pro');
    const businessButton = screen.getByText('Upgrade to Business');

    fireEvent.click(proButton);

    expect(businessButton).not.toBeDisabled();
    expect(proButton).toBeDisabled();
  });

  it('should handle different plan selections', async () => {
    mockCreateCheckoutSession.mockResolvedValue({ success: true });

    render(<UpgradeModal {...defaultProps} />);

    // Test Business plan upgrade
    const businessButton = screen.getByText('Upgrade to Business');
    fireEvent.click(businessButton);

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith({ planId: 'business' });

    // Test Enterprise plan upgrade
    const enterpriseButton = screen.getByText('Upgrade to Enterprise');
    fireEvent.click(enterpriseButton);

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
      planId: 'enterprise'
    });
  });
});
