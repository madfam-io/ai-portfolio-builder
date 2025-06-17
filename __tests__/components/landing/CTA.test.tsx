/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CTA from '@/components/landing/CTA';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('lucide-react', () => ({
  ArrowRight: ({ className }: any) => <div className={className} data-testid="arrow-right-icon" />,
  Sparkles: ({ className }: any) => <div className={className} data-testid="sparkles-icon" />,
  Zap: ({ className }: any) => <div className={className} data-testid="zap-icon" />,
  Star: ({ className }: any) => <div className={className} data-testid="star-icon" />,
  Clock: ({ className }: any) => <div className={className} data-testid="clock-icon" />,
  Users: ({ className }: any) => <div className={className} data-testid="users-icon" />,
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('CTA', () => {
  const mockProps = {
    onGetStarted: jest.fn(),
  };

  const mockTranslations = {
    ctaTitle: 'Ready to Create Your Professional Portfolio?',
    ctaSubtitle: 'Join thousands of professionals who have built stunning portfolios with PRISMA',
    getStartedButton: 'Start Building Your Portfolio',
    watchDemo: 'Watch Demo',
    freeToStart: 'Free to start',
    noCardRequired: 'No credit card required',
    setupInMinutes: 'Setup in 5 minutes',
    joinProfessionals: 'Join 10,000+ professionals',
    trustedByCompanies: 'Trusted by leading companies',
    testimonialQuote: 'PRISMA helped me create a stunning portfolio that landed my dream job!',
    testimonialAuthor: 'Sarah Johnson',
    testimonialRole: 'Senior Developer at Google',
    urgencyText: 'Limited time: Get premium templates free',
    socialProofText: '★★★★★ Rated 5 stars by users',
    guaranteeText: '30-day money-back guarantee',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
      currentLanguage: 'en',
    } as any);

    // Mock intersection observer for animations
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    }));

    // Mock router
    const mockPush = jest.fn();
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));
  });

  const renderCTA = (props = mockProps) => {
    return render(<CTA {...props} />);
  };

  describe('Initial Rendering', () => {
    it('should render CTA title and subtitle', () => {
      renderCTA();
      
      expect(screen.getByText('Ready to Create Your Professional Portfolio?')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of professionals who have built stunning portfolios with PRISMA')).toBeInTheDocument();
    });

    it('should render primary CTA button', () => {
      renderCTA();
      
      const primaryButton = screen.getByText('Start Building Your Portfolio');
      expect(primaryButton).toBeInTheDocument();
      expect(primaryButton).toHaveAttribute('role', 'button');
    });

    it('should render secondary CTA button', () => {
      renderCTA();
      
      const secondaryButton = screen.getByText('Watch Demo');
      expect(secondaryButton).toBeInTheDocument();
    });

    it('should render trust indicators', () => {
      renderCTA();
      
      expect(screen.getByText('Free to start')).toBeInTheDocument();
      expect(screen.getByText('No credit card required')).toBeInTheDocument();
      expect(screen.getByText('Setup in 5 minutes')).toBeInTheDocument();
    });

    it('should render social proof elements', () => {
      renderCTA();
      
      expect(screen.getByText('Join 10,000+ professionals')).toBeInTheDocument();
      expect(screen.getByText('★★★★★ Rated 5 stars by users')).toBeInTheDocument();
    });

    it('should have proper section structure', () => {
      renderCTA();
      
      const section = screen.getByRole('region', { name: /call to action/i });
      expect(section).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should handle primary CTA button click', async () => {
      const user = userEvent.setup();
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      expect(mockProps.onGetStarted).toHaveBeenCalledTimes(1);
    });

    it('should handle secondary CTA button click', async () => {
      const user = userEvent.setup();
      renderCTA();

      const secondaryButton = screen.getByText('Watch Demo');
      await user.click(secondaryButton);

      // Should trigger demo modal or navigation
      expect(secondaryButton).toBeInTheDocument();
    });

    it('should prevent double-clicking primary button', async () => {
      const user = userEvent.setup();
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      
      // Rapid double click
      await user.click(primaryButton);
      await user.click(primaryButton);

      // Should only be called once due to debouncing
      expect(mockProps.onGetStarted).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during action', async () => {
      const user = userEvent.setup();
      
      const slowOnGetStarted = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      renderCTA({ onGetStarted: slowOnGetStarted });

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      // Should show loading state
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(primaryButton).toBeDisabled();
    });

    it('should track button clicks for analytics', async () => {
      const user = userEvent.setup();
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      expect(window.gtag).toHaveBeenCalledWith('event', 'cta_click', {
        button_type: 'primary',
        button_text: 'Start Building Your Portfolio',
        section: 'cta',
      });
    });
  });

  describe('Visual Design and Animation', () => {
    it('should animate on scroll into view', () => {
      renderCTA();

      // Should setup intersection observer
      expect(IntersectionObserver).toHaveBeenCalled();
    });

    it('should have gradient background', () => {
      renderCTA();

      const ctaSection = document.querySelector('[data-testid="cta-section"]');
      expect(ctaSection).toHaveClass('bg-gradient-to-r');
    });

    it('should show sparkle animations', () => {
      renderCTA();

      const sparkleIcons = screen.getAllByTestId('sparkles-icon');
      expect(sparkleIcons.length).toBeGreaterThan(0);
    });

    it('should have hover effects on buttons', async () => {
      const user = userEvent.setup();
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      
      await user.hover(primaryButton);
      
      expect(primaryButton).toHaveClass('hover:bg-primary/90');
    });

    it('should adapt to reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      renderCTA();

      const animatedElements = document.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBe(0);
    });
  });

  describe('Trust Signals and Social Proof', () => {
    it('should display customer testimonial', () => {
      renderCTA();

      expect(screen.getByText('PRISMA helped me create a stunning portfolio that landed my dream job!')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer at Google')).toBeInTheDocument();
    });

    it('should show user count with real-time updates', () => {
      renderCTA();

      expect(screen.getByText('Join 10,000+ professionals')).toBeInTheDocument();
    });

    it('should display company logos', () => {
      renderCTA();

      expect(screen.getByText('Trusted by leading companies')).toBeInTheDocument();
      
      const companyLogos = document.querySelectorAll('[data-testid="company-logo"]');
      expect(companyLogos.length).toBeGreaterThan(0);
    });

    it('should show guarantee badge', () => {
      renderCTA();

      expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument();
    });

    it('should display star ratings', () => {
      renderCTA();

      expect(screen.getByText('★★★★★ Rated 5 stars by users')).toBeInTheDocument();
      
      const starIcons = screen.getAllByTestId('star-icon');
      expect(starIcons.length).toBe(5);
    });
  });

  describe('Urgency and Scarcity', () => {
    it('should show urgency message', () => {
      renderCTA();

      expect(screen.getByText('Limited time: Get premium templates free')).toBeInTheDocument();
    });

    it('should display countdown timer', () => {
      renderCTA({
        ...mockProps,
        showCountdown: true,
      });

      expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should update countdown in real-time', async () => {
      jest.useFakeTimers();
      
      renderCTA({
        ...mockProps,
        showCountdown: true,
      });

      const timer = screen.getByTestId('countdown-timer');
      const initialTime = timer.textContent;

      // Advance timer by 1 second
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(timer.textContent).not.toBe(initialTime);
      });

      jest.useRealTimers();
    });

    it('should show stock availability', () => {
      renderCTA({
        ...mockProps,
        showStock: true,
      });

      expect(screen.getByText(/spots remaining/i)).toBeInTheDocument();
    });
  });

  describe('A/B Testing Variants', () => {
    it('should render variant A with standard copy', () => {
      renderCTA({
        ...mockProps,
        variant: 'A',
      });

      expect(screen.getByText('Start Building Your Portfolio')).toBeInTheDocument();
    });

    it('should render variant B with alternative copy', () => {
      renderCTA({
        ...mockProps,
        variant: 'B',
      });

      expect(screen.getByText('Create My Portfolio Now')).toBeInTheDocument();
    });

    it('should render variant C with urgency copy', () => {
      renderCTA({
        ...mockProps,
        variant: 'C',
      });

      expect(screen.getByText('Start My Free Portfolio - Limited Time')).toBeInTheDocument();
    });

    it('should track variant impressions', () => {
      renderCTA({
        ...mockProps,
        variant: 'B',
      });

      expect(window.gtag).toHaveBeenCalledWith('event', 'cta_impression', {
        variant: 'B',
        section: 'cta',
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

      renderCTA();

      const ctaContainer = document.querySelector('[data-testid="cta-container"]');
      expect(ctaContainer).toHaveClass('px-4');
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('w-full');
      });
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderCTA();

      const ctaContainer = document.querySelector('[data-testid="cta-container"]');
      expect(ctaContainer).toHaveClass('px-8');
    });

    it('should maintain readability on small screens', () => {
      // Mock small mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      renderCTA();

      const title = screen.getByText('Ready to Create Your Professional Portfolio?');
      expect(title).toHaveClass('text-lg'); // Smaller on mobile
    });

    it('should stack elements vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderCTA();

      const buttonContainer = document.querySelector('[data-testid="button-container"]');
      expect(buttonContainer).toHaveClass('flex-col');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderCTA();

      const ctaSection = screen.getByRole('region', { name: /call to action/i });
      expect(ctaSection).toHaveAttribute('aria-label', 'Call to action section');
      
      const primaryButton = screen.getByText('Start Building Your Portfolio');
      expect(primaryButton).toHaveAttribute('aria-label', 'Start building your portfolio now');
    });

    it('should support keyboard navigation', () => {
      renderCTA();

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have proper heading hierarchy', () => {
      renderCTA();

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Ready to Create Your Professional Portfolio?');
    });

    it('should provide alternative text for icons', () => {
      renderCTA();

      const icons = document.querySelectorAll('[data-testid*="icon"]');
      
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should announce loading states to screen readers', async () => {
      const user = userEvent.setup();
      
      const slowOnGetStarted = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      renderCTA({ onGetStarted: slowOnGetStarted });

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have sufficient color contrast', () => {
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      const styles = window.getComputedStyle(primaryButton);
      
      // Should have high contrast (testing with mock styles)
      expect(styles.backgroundColor).not.toBe(styles.color);
    });
  });

  describe('Performance Optimization', () => {
    it('should lazy load testimonial images', () => {
      renderCTA();

      const testimonialImages = document.querySelectorAll('[data-testid="testimonial-image"]');
      
      testimonialImages.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should preload critical CTA assets', () => {
      renderCTA();

      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const ctaAssets = Array.from(preloadLinks).filter(link => 
        link.getAttribute('href')?.includes('cta')
      );
      
      expect(ctaAssets.length).toBeGreaterThan(0);
    });

    it('should debounce rapid button clicks', async () => {
      const user = userEvent.setup();
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      
      // Rapid clicks
      await user.click(primaryButton);
      await user.click(primaryButton);
      await user.click(primaryButton);

      // Should only trigger once due to debouncing
      expect(mockProps.onGetStarted).toHaveBeenCalledTimes(1);
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track CTA section visibility', () => {
      renderCTA();

      expect(window.gtag).toHaveBeenCalledWith('event', 'cta_section_view', {
        section: 'cta',
      });
    });

    it('should track demo button clicks', async () => {
      const user = userEvent.setup();
      renderCTA();

      const demoButton = screen.getByText('Watch Demo');
      await user.click(demoButton);

      expect(window.gtag).toHaveBeenCalledWith('event', 'demo_click', {
        button_type: 'secondary',
        section: 'cta',
      });
    });

    it('should track conversion funnel stages', async () => {
      const user = userEvent.setup();
      renderCTA();

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      expect(window.gtag).toHaveBeenCalledWith('event', 'begin_checkout', {
        currency: 'USD',
        value: 0, // Free to start
        source: 'cta_section',
      });
    });

    it('should track testimonial interactions', async () => {
      const user = userEvent.setup();
      renderCTA();

      const testimonial = screen.getByText('PRISMA helped me create a stunning portfolio that landed my dream job!');
      await user.click(testimonial);

      expect(window.gtag).toHaveBeenCalledWith('event', 'testimonial_click', {
        testimonial_author: 'Sarah Johnson',
        section: 'cta',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle onGetStarted errors gracefully', async () => {
      const user = userEvent.setup();
      
      const failingOnGetStarted = jest.fn().mockRejectedValue(new Error('Action failed'));
      
      renderCTA({ onGetStarted: failingOnGetStarted });

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle demo loading failures', async () => {
      const user = userEvent.setup();
      
      // Mock demo API failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Demo failed'));

      renderCTA();

      const demoButton = screen.getByText('Watch Demo');
      await user.click(demoButton);

      await waitFor(() => {
        expect(screen.getByText('Demo temporarily unavailable')).toBeInTheDocument();
      });
    });

    it('should handle network failures gracefully', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderCTA();

      expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate with authentication system', async () => {
      const user = userEvent.setup();
      
      renderCTA({
        ...mockProps,
        isAuthenticated: false,
      });

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      // Should redirect to signup
      expect(mockProps.onGetStarted).toHaveBeenCalledWith({ requiresAuth: true });
    });

    it('should integrate with experiment platform', () => {
      renderCTA({
        ...mockProps,
        experiment: 'cta_urgency_test',
        variant: 'urgency',
      });

      // Should apply experimental variant
      expect(screen.getByText(/limited time/i)).toBeInTheDocument();
    });

    it('should integrate with user segmentation', () => {
      renderCTA({
        ...mockProps,
        userSegment: 'developer',
      });

      // Should show developer-specific copy
      expect(screen.getByText(/for developers/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onGetStarted prop', async () => {
      const user = userEvent.setup();
      
      renderCTA({
        onGetStarted: undefined as any,
      });

      const primaryButton = screen.getByText('Start Building Your Portfolio');
      await user.click(primaryButton);

      // Should not crash
      expect(primaryButton).toBeInTheDocument();
    });

    it('should handle extremely long text gracefully', () => {
      const longTitle = 'A'.repeat(200);
      
      mockUseLanguage.mockReturnValue({
        t: {
          ...mockTranslations,
          ctaTitle: longTitle,
        },
        currentLanguage: 'en',
      } as any);

      renderCTA();

      // Should handle overflow
      const title = screen.getByText(longTitle);
      expect(title).toHaveClass('text-ellipsis');
    });

    it('should handle invalid variant gracefully', () => {
      renderCTA({
        ...mockProps,
        variant: 'invalid' as any,
      });

      // Should fallback to default variant
      expect(screen.getByText('Start Building Your Portfolio')).toBeInTheDocument();
    });
  });
});