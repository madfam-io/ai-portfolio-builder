/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pricing from '@/components/landing/Pricing';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('lucide-react', () => ({
  Check: ({ className }: any) => (
    <div className={className} data-testid="check-icon" />
  ),
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
  Star: ({ className }: any) => (
    <div className={className} data-testid="star-icon" />
  ),
  Crown: ({ className }: any) => (
    <div className={className} data-testid="crown-icon" />
  ),
  Zap: ({ className }: any) => (
    <div className={className} data-testid="zap-icon" />
  ),
  Shield: ({ className }: any) => (
    <div className={className} data-testid="shield-icon" />
  ),
  ArrowRight: ({ className }: any) => (
    <div className={className} data-testid="arrow-right-icon" />
  ),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('Pricing', () => {
  const mockProps = {
    onPlanSelect: jest.fn(),
  };

  const mockTranslations = {
    pricing: 'Pricing',
    pricingSubtitle: 'Choose the perfect plan for your professional needs',
    freePlan: 'Free',
    proPlan: 'Pro',
    businessPlan: 'Business',
    enterprisePlan: 'Enterprise',
    monthly: 'Monthly',
    yearly: 'Yearly',
    save20: 'Save 20%',
    mostPopular: 'Most Popular',
    bestValue: 'Best Value',
    getStartedFree: 'Get Started Free',
    upgradeNow: 'Upgrade Now',
    contactSales: 'Contact Sales',
    currentPlan: 'Current Plan',

    // Free plan features
    freePortfolios: '3 portfolios',
    freeTemplates: 'Basic templates',
    freeSupport: 'Community support',
    freeStorage: '100MB storage',

    // Pro plan features
    proPortfolios: '10 portfolios',
    proTemplates: 'Premium templates',
    proSupport: 'Priority support',
    proStorage: '1GB storage',
    proCustomDomain: 'Custom domain',
    proAnalytics: 'Portfolio analytics',
    proAICredits: '100 AI credits/month',

    // Business plan features
    businessPortfolios: '25 portfolios',
    businessTemplates: 'All templates',
    businessSupport: '24/7 support',
    businessStorage: '5GB storage',
    businessCustomDomain: 'Multiple custom domains',
    businessAnalytics: 'Advanced analytics',
    businessAICredits: '500 AI credits/month',
    businessTeam: 'Team collaboration',
    businessWhiteLabel: 'White-label options',

    // Enterprise features
    enterpriseUnlimited: 'Unlimited everything',
    enterpriseSSO: 'SSO integration',
    enterpriseAPI: 'API access',
    enterpriseSLA: 'SLA guarantee',

    // Billing
    perMonth: '/month',
    perYear: '/year',
    billedMonthly: 'Billed monthly',
    billedYearly: 'Billed yearly',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    canIChangeMyPlan: 'Can I change my plan anytime?',
    changeplanAnswer:
      'Yes, you can upgrade or downgrade your plan at any time.',
    whatIfIExceedLimits: 'What happens if I exceed my limits?',
    exceedLimitsAnswer:
      "We'll notify you and help you upgrade to a suitable plan.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
      currentLanguage: 'en',
    } as any);

    // Mock router
    const mockPush = jest.fn();
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));
  });

  const renderPricing = (props = mockProps) => {
    return render(<Pricing {...props} />);
  };

  describe('Initial Rendering', () => {
    it('should render pricing section title', () => {
      renderPricing();

      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(
        screen.getByText('Choose the perfect plan for your professional needs')
      ).toBeInTheDocument();
    });

    it('should render all pricing plans', () => {
      renderPricing();

      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('should render plan pricing', () => {
      renderPricing();

      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('$19')).toBeInTheDocument();
      expect(screen.getByText('$49')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should render billing toggle', () => {
      renderPricing();

      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('should highlight popular plan', () => {
      renderPricing();

      const popularBadge = screen.getByText('Most Popular');
      expect(popularBadge).toBeInTheDocument();

      const proPlan = popularBadge.closest('[data-testid="pricing-card"]');
      expect(proPlan).toHaveClass('border-primary');
    });
  });

  describe('Billing Toggle', () => {
    it('should switch to yearly billing', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      // Prices should update to yearly
      expect(screen.getByText('$152')).toBeInTheDocument(); // $19 * 12 * 0.8
      expect(screen.getByText('$392')).toBeInTheDocument(); // $49 * 12 * 0.8
    });

    it('should show savings badge for yearly', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('should switch back to monthly billing', async () => {
      const user = userEvent.setup();
      renderPricing();

      // Switch to yearly first
      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      // Switch back to monthly
      const monthlyToggle = screen.getByText('Monthly');
      await user.click(monthlyToggle);

      expect(screen.getByText('$19')).toBeInTheDocument();
      expect(screen.getByText('$49')).toBeInTheDocument();
    });

    it('should persist billing preference', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      // Should store preference
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'billing_period',
        'yearly'
      );
    });
  });

  describe('Plan Features', () => {
    it('should display free plan features', () => {
      renderPricing();

      expect(screen.getByText('3 portfolios')).toBeInTheDocument();
      expect(screen.getByText('Basic templates')).toBeInTheDocument();
      expect(screen.getByText('Community support')).toBeInTheDocument();
      expect(screen.getByText('100MB storage')).toBeInTheDocument();
    });

    it('should display pro plan features', () => {
      renderPricing();

      expect(screen.getByText('10 portfolios')).toBeInTheDocument();
      expect(screen.getByText('Premium templates')).toBeInTheDocument();
      expect(screen.getByText('Priority support')).toBeInTheDocument();
      expect(screen.getByText('1GB storage')).toBeInTheDocument();
      expect(screen.getByText('Custom domain')).toBeInTheDocument();
      expect(screen.getByText('Portfolio analytics')).toBeInTheDocument();
      expect(screen.getByText('100 AI credits/month')).toBeInTheDocument();
    });

    it('should display business plan features', () => {
      renderPricing();

      expect(screen.getByText('25 portfolios')).toBeInTheDocument();
      expect(screen.getByText('All templates')).toBeInTheDocument();
      expect(screen.getByText('24/7 support')).toBeInTheDocument();
      expect(screen.getByText('5GB storage')).toBeInTheDocument();
      expect(screen.getByText('Multiple custom domains')).toBeInTheDocument();
      expect(screen.getByText('Advanced analytics')).toBeInTheDocument();
      expect(screen.getByText('500 AI credits/month')).toBeInTheDocument();
      expect(screen.getByText('Team collaboration')).toBeInTheDocument();
      expect(screen.getByText('White-label options')).toBeInTheDocument();
    });

    it('should display enterprise plan features', () => {
      renderPricing();

      expect(screen.getByText('Unlimited everything')).toBeInTheDocument();
      expect(screen.getByText('SSO integration')).toBeInTheDocument();
      expect(screen.getByText('API access')).toBeInTheDocument();
      expect(screen.getByText('SLA guarantee')).toBeInTheDocument();
    });

    it('should show check icons for included features', () => {
      renderPricing();

      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThan(10);
    });
  });

  describe('Plan Selection', () => {
    it('should handle free plan selection', async () => {
      const user = userEvent.setup();
      renderPricing();

      const freePlanButton = screen.getByText('Get Started Free');
      await user.click(freePlanButton);

      expect(mockProps.onPlanSelect).toHaveBeenCalledWith('free');
    });

    it('should handle pro plan selection', async () => {
      const user = userEvent.setup();
      renderPricing();

      const proPlanButton = screen.getByText('Upgrade Now');
      await user.click(proPlanButton);

      expect(mockProps.onPlanSelect).toHaveBeenCalledWith('pro');
    });

    it('should handle business plan selection', async () => {
      const user = userEvent.setup();
      renderPricing();

      const businessButtons = screen.getAllByText('Upgrade Now');
      const businessPlanButton = businessButtons[1]; // Second "Upgrade Now" is business
      await user.click(businessPlanButton);

      expect(mockProps.onPlanSelect).toHaveBeenCalledWith('business');
    });

    it('should handle enterprise plan contact', async () => {
      const user = userEvent.setup();
      renderPricing();

      const enterpriseButton = screen.getByText('Contact Sales');
      await user.click(enterpriseButton);

      expect(mockProps.onPlanSelect).toHaveBeenCalledWith('enterprise');
    });

    it('should include billing period in plan selection', async () => {
      const user = userEvent.setup();
      renderPricing();

      // Switch to yearly
      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      // Select pro plan
      const proPlanButton = screen.getByText('Upgrade Now');
      await user.click(proPlanButton);

      expect(mockProps.onPlanSelect).toHaveBeenCalledWith('pro', 'yearly');
    });
  });

  describe('Current Plan Indication', () => {
    it('should show current plan badge', () => {
      renderPricing({
        ...mockProps,
        currentPlan: 'pro',
      });

      const currentPlanBadge = screen.getByText('Current Plan');
      expect(currentPlanBadge).toBeInTheDocument();

      const proPlan = currentPlanBadge.closest('[data-testid="pricing-card"]');
      expect(proPlan).toHaveClass('bg-primary/5');
    });

    it('should disable current plan button', () => {
      renderPricing({
        ...mockProps,
        currentPlan: 'pro',
      });

      const proPlanButton = screen.getByText('Current Plan');
      expect(proPlanButton).toBeDisabled();
    });

    it('should show upgrade options for current plan', () => {
      renderPricing({
        ...mockProps,
        currentPlan: 'free',
      });

      const upgradeButtons = screen.getAllByText('Upgrade Now');
      expect(upgradeButtons.length).toBeGreaterThan(0);

      upgradeButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderPricing();

      const pricingGrid = document.querySelector('.pricing-grid');
      expect(pricingGrid).toHaveClass('grid-cols-1');
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderPricing();

      const pricingGrid = document.querySelector('.pricing-grid');
      expect(pricingGrid).toHaveClass('md:grid-cols-2');
    });

    it('should adapt to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderPricing();

      const pricingGrid = document.querySelector('.pricing-grid');
      expect(pricingGrid).toHaveClass('lg:grid-cols-4');
    });

    it('should stack plans vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderPricing();

      const plans = document.querySelectorAll('[data-testid="pricing-card"]');
      expect(plans[0]).toHaveClass('w-full');
    });
  });

  describe('Price Calculations', () => {
    it('should calculate yearly savings correctly', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      // Pro plan: $19 * 12 * 0.8 = $182.4 (rounded to $182)
      expect(screen.getByText('$182')).toBeInTheDocument();

      // Business plan: $49 * 12 * 0.8 = $470.4 (rounded to $470)
      expect(screen.getByText('$470')).toBeInTheDocument();
    });

    it('should show correct savings percentage', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      const savingsBadges = screen.getAllByText('Save 20%');
      expect(savingsBadges.length).toBeGreaterThan(0);
    });

    it('should handle price formatting for different currencies', () => {
      renderPricing({
        ...mockProps,
        currency: 'EUR',
      });

      // Should format with Euro symbol
      expect(screen.getByText('€19')).toBeInTheDocument();
    });

    it('should show regional pricing', () => {
      renderPricing({
        ...mockProps,
        region: 'EU',
      });

      // Should show EU-specific pricing
      expect(screen.getByText('€19')).toBeInTheDocument();
    });
  });

  describe('Feature Comparison', () => {
    it('should show feature comparison on toggle', async () => {
      const user = userEvent.setup();
      renderPricing();

      const compareButton = screen.getByText('Compare Features');
      await user.click(compareButton);

      expect(
        screen.getByTestId('feature-comparison-table')
      ).toBeInTheDocument();
    });

    it('should highlight differences between plans', async () => {
      const user = userEvent.setup();
      renderPricing();

      const compareButton = screen.getByText('Compare Features');
      await user.click(compareButton);

      const checkIcons = screen.getAllByTestId('check-icon');
      const xIcons = screen.getAllByTestId('x-icon');

      expect(checkIcons.length).toBeGreaterThan(0);
      expect(xIcons.length).toBeGreaterThan(0);
    });

    it('should show feature limits clearly', async () => {
      const user = userEvent.setup();
      renderPricing();

      const compareButton = screen.getByText('Compare Features');
      await user.click(compareButton);

      expect(screen.getByText('3 portfolios')).toBeInTheDocument();
      expect(screen.getByText('10 portfolios')).toBeInTheDocument();
      expect(screen.getByText('25 portfolios')).toBeInTheDocument();
      expect(screen.getByText('Unlimited portfolios')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderPricing();

      const pricingSection = screen.getByRole('region', { name: /pricing/i });
      expect(pricingSection).toBeInTheDocument();

      const planCards = screen.getAllByRole('article');
      expect(planCards.length).toBe(4);

      planCards.forEach(card => {
        expect(card).toHaveAttribute('aria-label');
      });
    });

    it('should support keyboard navigation', () => {
      renderPricing();

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have proper heading hierarchy', () => {
      renderPricing();

      const mainHeading = screen.getByRole('heading', {
        level: 2,
        name: 'Pricing',
      });
      expect(mainHeading).toBeInTheDocument();

      const planHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(planHeadings.length).toBe(4); // One for each plan
    });

    it('should announce price changes to screen readers', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');

      expect(yearlyToggle).toHaveAttribute('aria-live', 'polite');

      await user.click(yearlyToggle);

      // Price changes should be announced
      expect(yearlyToggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('should provide alternative text for plan badges', () => {
      renderPricing();

      const popularBadge = screen.getByText('Most Popular');
      expect(popularBadge).toHaveAttribute('aria-label', 'Most popular plan');
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track plan selection events', async () => {
      const user = userEvent.setup();
      renderPricing();

      const proPlanButton = screen.getByText('Upgrade Now');
      await user.click(proPlanButton);

      expect(window.gtag).toHaveBeenCalledWith('event', 'plan_selection', {
        plan: 'pro',
        billing_period: 'monthly',
        section: 'pricing',
      });
    });

    it('should track billing toggle interactions', async () => {
      const user = userEvent.setup();
      renderPricing();

      const yearlyToggle = screen.getByText('Yearly');
      await user.click(yearlyToggle);

      expect(window.gtag).toHaveBeenCalledWith('event', 'billing_toggle', {
        billing_period: 'yearly',
        section: 'pricing',
      });
    });

    it('should track feature comparison views', async () => {
      const user = userEvent.setup();
      renderPricing();

      const compareButton = screen.getByText('Compare Features');
      await user.click(compareButton);

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'feature_comparison_view',
        {
          section: 'pricing',
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle plan selection errors gracefully', async () => {
      const user = userEvent.setup();

      const failingOnPlanSelect = jest
        .fn()
        .mockRejectedValue(new Error('Selection failed'));

      renderPricing({
        onPlanSelect: failingOnPlanSelect,
      });

      const proPlanButton = screen.getByText('Upgrade Now');
      await user.click(proPlanButton);

      await waitFor(() => {
        expect(screen.getByText('Please try again')).toBeInTheDocument();
      });
    });

    it('should handle pricing API errors', async () => {
      // Mock pricing API failure
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Pricing API failed'));

      renderPricing();

      // Should show fallback pricing
      expect(screen.getByText('$19')).toBeInTheDocument();
    });

    it('should handle currency conversion errors', () => {
      renderPricing({
        ...mockProps,
        currency: 'INVALID',
      });

      // Should fallback to USD
      expect(screen.getByText('$19')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate with payment system', async () => {
      const user = userEvent.setup();
      renderPricing();

      const proPlanButton = screen.getByText('Upgrade Now');
      await user.click(proPlanButton);

      expect(mockProps.onPlanSelect).toHaveBeenCalledWith('pro', 'monthly');
    });

    it('should integrate with user authentication', () => {
      renderPricing({
        ...mockProps,
        isAuthenticated: true,
        currentPlan: 'free',
      });

      // Should show upgrade options for authenticated users
      const upgradeButtons = screen.getAllByText('Upgrade Now');
      expect(upgradeButtons.length).toBeGreaterThan(0);
    });

    it('should integrate with experiment system', () => {
      renderPricing({
        ...mockProps,
        experiment: 'pricing_v2',
      });

      // Should show experimental pricing layout
      const experimentVariant = document.querySelector(
        '[data-experiment="pricing_v2"]'
      );
      expect(experimentVariant).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onPlanSelect prop', async () => {
      const user = userEvent.setup();

      renderPricing({
        ...mockProps,
        onPlanSelect: undefined as any,
      });

      const proPlanButton = screen.getByText('Upgrade Now');
      await user.click(proPlanButton);

      // Should not crash
      expect(proPlanButton).toBeInTheDocument();
    });

    it('should handle invalid current plan', () => {
      renderPricing({
        ...mockProps,
        currentPlan: 'invalid' as any,
      });

      // Should treat as no current plan
      const upgradeButtons = screen.getAllByText('Upgrade Now');
      expect(upgradeButtons.length).toBeGreaterThan(0);
    });

    it('should handle extreme viewport sizes', () => {
      // Very small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200,
      });

      renderPricing();

      // Should still be usable
      expect(screen.getByText('Pricing')).toBeInTheDocument();
    });
  });
});
