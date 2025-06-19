import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';
import Pricing from '@/components/landing/Pricing';
import { useLanguage } from '@/lib/i18n/refactored-context';
/**
 * @jest-environment jsdom
 */

// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: mockUseLanguage,
}));

// Mock dependencies

// Mock useLanguage hook
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

  useLanguage: jest.fn(),
}));
// Mock useApp hook
jest.mock('@/hooks/useApp', () => ({
  useApp: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
    error: null,
  }),
}));

jest.mock('@/lib/contexts/AppContext', () => ({
  useApp: jest.fn().mockReturnValue({
    currency: 'USD',
  }),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>{children}</span>
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock('lucide-react', () => ({
  Check: ({ className }: any) => (
    <div className={className} data-testid="check-icon" />
  ),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('Pricing', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockTranslations = {
    pricingTitle: 'Pricing',
    powerfulFeatures: 'with Powerful Features',
    pricingSubtitle: 'Choose the perfect plan for your professional needs',
    planFree: 'Free',
    planPro: 'Pro', 
    planBusiness: 'Business',
    planEnterprise: 'Enterprise',
    perMonth: '/month',
    startFree: 'Start Free',
    upgradeNow: 'Upgrade Now',
    contactSales: 'Contact Sales',
    mostPopular: 'Most Popular',
    pricingLimitedOffer: 'Limited Time Offer!',
    pricingOfferExpires: 'Offer expires soon',
    portfolio1: '1 portfolio',
    basicTemplates: 'Basic templates',
    madfamSubdomain: 'MADFAM subdomain',
    aiRewrites3: '3 AI rewrites',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseLanguage as any).mockImplementation(() => ({
      t: mockTranslations,
      currentLanguage: 'en',
    });
  });

  describe('Initial Rendering', () => {
    it('should render pricing section title', async () => {
      render(<Pricing />);

      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('with Powerful Features')).toBeInTheDocument();
      expect(
        screen.getByText('Choose the perfect plan for your professional needs')
      ).toBeInTheDocument();
    });

    it('should render all pricing plans', async () => {
      render(<Pricing />);

      expect(screen.getByText(mockTranslations.planFree)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.planPro)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.planBusiness)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.planEnterprise)).toBeInTheDocument();
    });

    it('should render billing toggle', async () => {
      render(<Pricing />);

      const buttons = screen.getAllByRole('button');
      const monthlyButton = buttons.find(btn => btn.textContent === 'Monthly');
      const yearlyButton = buttons.find(btn => btn.textContent?.includes('Yearly'));

      expect(monthlyButton).toBeInTheDocument();
      expect(yearlyButton).toBeInTheDocument();
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    it('should highlight popular plan', async () => {
      render(<Pricing />);

      const popularBadge = screen.getByText('Most Popular');
      expect(popularBadge).toBeInTheDocument();
    });
  });

  describe('Billing Toggle', () => {
    it('should switch to yearly billing', async () => {
      const user = userEvent.setup();
      render(<Pricing />);

      const buttons = screen.getAllByRole('button');
      const yearlyButton = buttons.find(btn => btn.textContent?.includes('Yearly'));
      await user.click(yearlyButton!);

      // Component should show yearly prices (we don't test exact values)
      expect(yearlyButton).toHaveAttribute('variant', 'default');
    });
  });

  describe('Plan Features', () => {
    it('should display free plan features', async () => {
      render(<Pricing />);

      expect(screen.getByText('1 portfolio')).toBeInTheDocument();
      expect(screen.getByText('Basic templates')).toBeInTheDocument();
      expect(screen.getByText('MADFAM subdomain')).toBeInTheDocument();
      expect(screen.getByText('3 AI rewrites')).toBeInTheDocument();
    });
  });
});
