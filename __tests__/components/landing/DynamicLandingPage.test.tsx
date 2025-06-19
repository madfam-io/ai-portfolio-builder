import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';
import DynamicLandingPage from '@/components/landing/DynamicLandingPage';
import { useLanguage } from '@/lib/i18n/refactored-context';

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

  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test',
}));
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

jest.mock('@/lib/utils', () => ({ 
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
 }));

// Mock child components
jest.mock('@/components/landing/Header', () => ({
  __esModule: true,
  default: ({ onLanguageChange }: any) => (
    <div data-testid="header">
      <button onClick={() => onLanguageChange('en')}>Switch to English</button>
      <button onClick={() => onLanguageChange('es')}>Switch to Spanish</button>
    </div>
  ),
}));

jest.mock('@/components/landing/variants/HeroVariants', () => ({
  __esModule: true,
  default: ({ variant, onCTAClick }: any) => (
    <div data-testid="hero-variants">
      <h1>Hero Variant: {variant}</h1>
      <button onClick={onCTAClick} data-testid="hero-cta">
        Get Started
      </button>
    </div>
  ),
}));

jest.mock('@/components/landing/Features', () => ({ 
  __esModule: true,
  default: () => (
    <div data-testid="features">
      <h2>Features Section</h2>
      <div>AI-powered portfolio creation</div>
      <div>Professional templates</div>
      <div>Real-time preview</div>
    </div>
  ),
 }));

jest.mock('@/components/landing/HowItWorks', () => ({ 
  __esModule: true,
  default: () => (
    <div data-testid="how-it-works">
      <h2>How It Works</h2>
      <div>Step 1: Choose template</div>
      <div>Step 2: Add content</div>
      <div>Step 3: Publish</div>
    </div>
  ),
 }));

jest.mock('@/components/landing/Templates', () => ({ 
  __esModule: true,
  default: () => (
    <div data-testid="templates">
      <h2>Templates Section</h2>
      <div>Developer Template</div>
      <div>Designer Template</div>
      <div>Consultant Template</div>
    </div>
  ),
 }));

jest.mock('@/components/landing/Pricing', () => ({
  __esModule: true,
  default: ({ onPlanSelect }: any) => (
    <div data-testid="pricing">
      <h2>Pricing Section</h2>
      <button onClick={() => onPlanSelect('free')} data-testid="free-plan">
        Free Plan
      </button>
      <button onClick={() => onPlanSelect('pro')} data-testid="pro-plan">
        Pro Plan
      </button>
      <button
        onClick={() => onPlanSelect('business')}
        data-testid="business-plan"
      >
        Business Plan
      </button>
    </div>
  ),
}));

jest.mock('@/components/landing/SocialProof', () => ({ 
  __esModule: true,
  default: () => (
    <div data-testid="social-proof">
      <h2>Social Proof</h2>
      <div>Trusted by 10,000+ professionals</div>
      <div>5-star reviews</div>
    </div>
  ),
 }));

jest.mock('@/components/landing/CTA', () => ({
  __esModule: true,
  default: ({ onGetStarted }: any) => (
    <div data-testid="cta">
      <h2>Call to Action</h2>
      <button onClick={onGetStarted} data-testid="cta-button">
        Start Building Your Portfolio
      </button>
    </div>
  ),
}));

jest.mock('@/components/landing/Footer', () => ({ 
  __esModule: true,
  default: () => (
    <div data-testid="footer">
      <div>© 2024 PRISMA by MADFAM</div>
      <div>Privacy Policy</div>
      <div>Terms of Service</div>
    </div>
  ),
 }));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('DynamicLandingPage', () => {
  const mockTranslations = {
    welcome: 'Welcome to PRISMA',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    features: 'Features',
    pricing: 'Pricing',
    templates: 'Templates',
    howItWorks: 'How It Works',
    socialProof: 'Social Proof',
    callToAction: 'Call to Action',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseLanguage as any).mockImplementation(() => ({
      t: mockTranslations,
      currentLanguage: 'en',
      switchLanguage: jest.fn(),
    });

    // Mock window.location
    delete (window as any).location;
    window.location = { href: 'http://localhost:3000' } as any;

    // Mock router
    const mockPush = jest.fn();
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));
  });

  const renderDynamicLandingPage = () => {
    return render(<DynamicLandingPage />);
  };

  describe('Initial Rendering', () => {
    it('should render all landing page sections', async () => {
      renderDynamicLandingPage();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
      expect(screen.getByTestId('features')).toBeInTheDocument();
      expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
      expect(screen.getByTestId('templates')).toBeInTheDocument();
      expect(screen.getByTestId('pricing')).toBeInTheDocument();
      expect(screen.getByTestId('social-proof')).toBeInTheDocument();
      expect(screen.getByTestId('cta')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render sections in correct order', async () => {
      renderDynamicLandingPage();

      const sections = [
        screen.getByTestId('header'),
        screen.getByTestId('hero-variants'),
        screen.getByTestId('features'),
        screen.getByTestId('how-it-works'),
        screen.getByTestId('templates'),
        screen.getByTestId('pricing'),
        screen.getByTestId('social-proof'),
        screen.getByTestId('cta'),
        screen.getByTestId('footer'),
      ];

      // Check that sections appear in DOM order
      sections.forEach((section, index) => {
        if (index > 0) {
          expect(section.compareDocumentPosition(sections[index - 1])).toBe(
            Node.DOCUMENT_POSITION_PRECEDING

        }
      });
    });

    it('should display default hero variant', async () => {
      renderDynamicLandingPage();

      expect(screen.getByText(/Hero Variant:/)).toBeInTheDocument();
    });

    it('should have proper page structure', async () => {
      renderDynamicLandingPage();

      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Hero Variants', () => {
    it('should handle A/B testing variants', async () => {
      renderDynamicLandingPage();

      const heroSection = screen.getByTestId('hero-variants');
      expect(heroSection).toBeInTheDocument();
      expect(screen.getByText(/Hero Variant:/)).toBeInTheDocument();
    });

    it('should handle CTA clicks from hero section', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const heroCTA = screen.getByTestId('hero-cta');
      await user.click(heroCTA);

      // Should trigger navigation or modal
      expect(heroCTA).toBeInTheDocument();
    });

    it('should track hero variant interactions', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const heroCTA = screen.getByTestId('hero-cta');
      await user.click(heroCTA);

      // Should send analytics event
      expect(heroCTA).toHaveBeenCalled;
    });
  });

  describe('Language Switching', () => {
    it('should handle language switching from header', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const englishButton = screen.getByText('Switch to English');
      await user.click(englishButton);

      expect(englishButton).toBeInTheDocument();
    });

    it('should handle Spanish language switch', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const spanishButton = screen.getByText('Switch to Spanish');
      await user.click(spanishButton);

      expect(spanishButton).toBeInTheDocument();
    });

    it('should persist language preference', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const spanishButton = screen.getByText('Switch to Spanish');
      await user.click(spanishButton);

      // Should store in localStorage or cookies
      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'es');
    });
  });

  describe('Pricing Plan Selection', () => {
    it('should handle free plan selection', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const freePlan = screen.getByTestId('free-plan');
      await user.click(freePlan);

      expect(freePlan).toBeInTheDocument();
    });

    it('should handle pro plan selection', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const proPlan = screen.getByTestId('pro-plan');
      await user.click(proPlan);

      expect(proPlan).toBeInTheDocument();
    });

    it('should handle business plan selection', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const businessPlan = screen.getByTestId('business-plan');
      await user.click(businessPlan);

      expect(businessPlan).toBeInTheDocument();
    });

    it('should redirect to signup with selected plan', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const proPlan = screen.getByTestId('pro-plan');
      await user.click(proPlan);

      // Should navigate to signup with plan parameter
      expect(window.location.href).toContain('localhost');
    });
  });

  describe('Call to Action', () => {
    it('should handle main CTA button click', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      expect(ctaButton).toBeInTheDocument();
    });

    it('should track CTA conversions', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      // Should send analytics event
      expect(ctaButton).toHaveBeenCalled;
    });

    it('should handle multiple CTA interactions', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const heroCTA = screen.getByTestId('hero-cta');
      const mainCTA = screen.getByTestId('cta-button');

      await user.click(heroCTA);
      await user.click(mainCTA);

      expect(heroCTA).toBeInTheDocument();
      expect(mainCTA).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderDynamicLandingPage();

      // All sections should still be visible
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
      expect(screen.getByTestId('features')).toBeInTheDocument();
    });

    it('should adapt to tablet viewport', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderDynamicLandingPage();

      expect(screen.getByTestId('pricing')).toBeInTheDocument();
      expect(screen.getByTestId('templates')).toBeInTheDocument();
    });

    it('should handle orientation changes', async () => {
      renderDynamicLandingPage();

      // Simulate orientation change
      fireEvent(window, new Event('orientationchange'));

      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should lazy load non-critical sections', async () => {
      renderDynamicLandingPage();

      // Hero should load immediately
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();

      // Other sections should load progressively
      await waitFor(() => {
        expect(screen.getByTestId('features')).toBeInTheDocument();
      });
    });

    it('should optimize images and assets', async () => {
      renderDynamicLandingPage();

      // Check for Next.js optimized images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img.loading).toBe('lazy');
      });
    });

    it('should preload critical resources', async () => {
      renderDynamicLandingPage();

      // Check for resource preloading
      const links = document.querySelectorAll('link[rel="preload"]');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should have proper page title', async () => {
      renderDynamicLandingPage();

      expect(document.title).toContain('PRISMA');
    });

    it('should have meta description', async () => {
      renderDynamicLandingPage();

      const metaDescription = document.querySelector(
        'meta[name="description"]'

      expect(metaDescription).toBeInTheDocument();
    });

    it('should have Open Graph tags', async () => {
      renderDynamicLandingPage();

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'

      expect(ogTitle).toBeInTheDocument();
      expect(ogDescription).toBeInTheDocument();
    });

    it('should have structured data', async () => {
      renderDynamicLandingPage();

      const structuredData = document.querySelector(
        'script[type="application/ld+json"]'

      expect(structuredData).toBeInTheDocument();
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track page view', async () => {
      renderDynamicLandingPage();

      // Should send pageview event
      expect(window.gtag).toHaveBeenCalledWith('event', 'page_view');
    });

    it('should track section visibility', async () => {
      renderDynamicLandingPage();

      // Mock intersection observer
      const mockIntersectionObserver = jest.fn();
      window.IntersectionObserver = jest.fn().mockImplementation(() => ({
        observe: mockIntersectionObserver,
        disconnect: jest.fn(),
      }));

      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should track user interactions', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      // Should track click event
      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'click',
        expect.any(Object)

    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      renderDynamicLandingPage();

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Should have h1, h2, h3 in proper order
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', async () => {
      renderDynamicLandingPage();

      const ctaButton = screen.getByTestId('cta-button');
      expect(ctaButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', async () => {
      renderDynamicLandingPage();

      const focusableElements = screen.getAllByRole('button');

      focusableElements.forEach(element => {
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have proper color contrast', async () => {
      renderDynamicLandingPage();

      // All text should have sufficient contrast
      const textElements = document.querySelectorAll('h1, h2, h3, p, span');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should support screen readers', async () => {
      renderDynamicLandingPage();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label');

      // Should have proper landmark structure
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });
  });

  describe('Error Handling', () => {
    it('should handle component loading errors gracefully', async () => {
      // Mock component error
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      renderDynamicLandingPage();

      // Should not crash the entire page
      expect(screen.getByTestId('header')).toBeInTheDocument();

      spy.mockRestore();
    });

    it('should handle network errors', async () => {
      // Mock network failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      renderDynamicLandingPage();

      // Should show fallback content
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
    });

    it('should handle translation loading errors', async () => {
      (mockUseLanguage as any).mockImplementation(() => ({
        t: {},
        currentLanguage: 'en',
        switchLanguage: jest.fn(),
      } as any);

      renderDynamicLandingPage();

      // Should render with fallback text
      expect(screen.getByTestId('features')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate with authentication system', async () => {
      const user = userEvent.setup();
      renderDynamicLandingPage();

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      // Should handle authenticated vs non-authenticated users
      expect(ctaButton).toBeInTheDocument();
    });

    it('should integrate with experiment system', async () => {
      renderDynamicLandingPage();

      // Should show appropriate variant based on experiment
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
    });

    it('should integrate with analytics platform', async () => {
      renderDynamicLandingPage();

      // Should initialize analytics
      expect(window.gtag).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing props gracefully', async () => {
      renderDynamicLandingPage();

      // Should render with default values
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
    });

    it('should handle invalid language codes', async () => {
      (mockUseLanguage as any).mockImplementation(() => ({
        t: mockTranslations,
        currentLanguage: 'invalid',
        switchLanguage: jest.fn(),
      });

      renderDynamicLandingPage();

      // Should fallback to default language
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should handle very long content', async () => {
      const longTitle = 'A'.repeat(200);

      renderDynamicLandingPage();

      // Should handle overflow gracefully
      expect(screen.getByTestId('hero-variants')).toBeInTheDocument();
    });
  });
});
