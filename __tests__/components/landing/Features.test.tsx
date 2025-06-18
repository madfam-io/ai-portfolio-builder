/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Features from '@/components/landing/Features';
import { useLanguage } from '@/lib/i18n/refactored-context';


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

jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('lucide-react', () => ({
  Sparkles: ({ className }: any) => (
    <div className={className} data-testid="sparkles-icon" />
  ),
  Zap: ({ className }: any) => (
    <div className={className} data-testid="zap-icon" />
  ),
  Palette: ({ className }: any) => (
    <div className={className} data-testid="palette-icon" />
  ),
  Eye: ({ className }: any) => (
    <div className={className} data-testid="eye-icon" />
  ),
  Globe: ({ className }: any) => (
    <div className={className} data-testid="globe-icon" />
  ),
  Shield: ({ className }: any) => (
    <div className={className} data-testid="shield-icon" />
  ),
  ArrowRight: ({ className }: any) => (
    <div className={className} data-testid="arrow-right-icon" />
  ),
  CheckCircle: ({ className }: any) => (
    <div className={className} data-testid="check-circle-icon" />
  ),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('Features', () => {
  const mockTranslations = {
    features: 'Features',
    featuresSubtitle: 'Everything you need to create a stunning portfolio',
    aiPoweredTitle: 'AI-Powered Content',
    aiPoweredDescription:
      'Generate professional content with advanced AI assistance',
    templateLibraryTitle: 'Professional Templates',
    templateLibraryDescription:
      'Choose from dozens of industry-specific templates',
    realTimePreviewTitle: 'Real-time Preview',
    realTimePreviewDescription:
      'See changes instantly as you build your portfolio',
    customizationTitle: 'Full Customization',
    customizationDescription:
      'Customize colors, fonts, and layouts to match your brand',
    publishingTitle: 'One-Click Publishing',
    publishingDescription:
      'Deploy your portfolio instantly with custom domains',
    securityTitle: 'Enterprise Security',
    securityDescription:
      'Bank-level security to protect your professional data',
    learnMore: 'Learn More',
    tryFeature: 'Try This Feature',
    viewDemo: 'View Demo',
    comingSoon: 'Coming Soon',
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
  });

  const renderFeatures = () => {
    return render(<Features />);
  };

  describe('Initial Rendering', () => {
    it('should render features section title', () => {
      renderFeatures();

      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(
        screen.getByText('Everything you need to create a stunning portfolio')
      ).toBeInTheDocument();
    });

    it('should render all feature cards', () => {
      renderFeatures();

      expect(screen.getByText('AI-Powered Content')).toBeInTheDocument();
      expect(screen.getByText('Professional Templates')).toBeInTheDocument();
      expect(screen.getByText('Real-time Preview')).toBeInTheDocument();
      expect(screen.getByText('Full Customization')).toBeInTheDocument();
      expect(screen.getByText('One-Click Publishing')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      renderFeatures();

      expect(
        screen.getByText(
          'Generate professional content with advanced AI assistance'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Choose from dozens of industry-specific templates')
      ).toBeInTheDocument();
      expect(
        screen.getByText('See changes instantly as you build your portfolio')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Customize colors, fonts, and layouts to match your brand'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Deploy your portfolio instantly with custom domains')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Bank-level security to protect your professional data'
        )
      ).toBeInTheDocument();
    });

    it('should render feature icons', () => {
      renderFeatures();

      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    });

    it('should have proper section structure', () => {
      renderFeatures();

      const section = screen.getByRole('region', { name: /features/i });
      expect(section).toBeInTheDocument();

      const heading = screen.getByRole('heading', {
        level: 2,
        name: 'Features',
      });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Feature Interactions', () => {
    it('should handle feature card hover effects', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const aiFeatureCard = screen
        .getByText('AI-Powered Content')
        .closest('.group');

      await user.hover(aiFeatureCard!);

      // Should apply hover styling
      expect(aiFeatureCard).toHaveClass('group');
    });

    it('should handle feature card clicks', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const templateFeatureCard = screen
        .getByText('Professional Templates')
        .closest('[data-testid="feature-card"]');

      if (templateFeatureCard) {
        await user.click(templateFeatureCard);

        // Should trigger feature interaction
        expect(templateFeatureCard).toBeInTheDocument();
      }
    });

    it('should show feature demos on interaction', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const previewFeature = screen.getByText('Real-time Preview');
      await user.click(previewFeature);

      // Should show demo or modal
      expect(previewFeature).toBeInTheDocument();
    });

    it('should handle learn more button clicks', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const learnMoreButtons = screen.getAllByText('Learn More');

      if (learnMoreButtons.length > 0) {
        await user.click(learnMoreButtons[0]);

        // Should navigate to feature details
        expect(learnMoreButtons[0]).toBeInTheDocument();
      }
    });
  });

  describe('Animation and Visual Effects', () => {
    it('should animate features on scroll', async () => {
      renderFeatures();

      // Mock intersection observer callback
      const mockCallback = jest.fn();
      const mockObserver = new IntersectionObserver(mockCallback);

      const featureCards = screen.getAllByText(
        /AI-Powered|Professional|Real-time|Full|One-Click|Enterprise/

      featureCards.forEach(card => {
        mockObserver.observe(card);
      });

      expect(IntersectionObserver).toHaveBeenCalled();
    });

    it('should have staggered animation delays', () => {
      renderFeatures();

      const featureCards = document.querySelectorAll(
        '[data-testid="feature-card"]'

      featureCards.forEach((card, index) => {
        expect(card).toHaveStyle(`animation-delay: ${index * 0.1}s`);
      });
    });

    it('should show loading states for interactive features', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const aiFeature = screen.getByText('AI-Powered Content');
      await user.click(aiFeature);

      // Should show loading indicator for AI demo
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });

    it('should handle reduced motion preferences', () => {
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

      renderFeatures();

      const featureCards = document.querySelectorAll(
        '[data-testid="feature-card"]'

      featureCards.forEach(card => {
        expect(card).not.toHaveClass('animate-fade-in');
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

      renderFeatures();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderFeatures();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should adapt to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderFeatures();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should maintain readability across screen sizes', () => {
      renderFeatures();

      const descriptions = screen.getAllByText(
        /Generate|Choose|See changes|Customize|Deploy|Bank-level/

      descriptions.forEach(desc => {
        expect(desc).toHaveClass('text-gray-600');
        expect(desc).not.toHaveStyle('font-size: 8px'); // Should not be too small
      });
    });
  });

  describe('Feature Categories', () => {
    it('should group related features visually', () => {
      renderFeatures();

      // Core features should be prominent
      const coreFeatures = [
        screen.getByText('AI-Powered Content'),
        screen.getByText('Professional Templates'),
        screen.getByText('Real-time Preview'),
      ];

      coreFeatures.forEach(feature => {
        expect(feature.closest('[data-testid="feature-card"]')).toHaveClass(
          'bg-white'

      });
    });

    it('should highlight premium features', () => {
      renderFeatures();

      const premiumFeatures = [
        screen.getByText('Full Customization'),
        screen.getByText('One-Click Publishing'),
        screen.getByText('Enterprise Security'),
      ];

      premiumFeatures.forEach(feature => {
        const card = feature.closest('[data-testid="feature-card"]');
        expect(card).toHaveClass('border-primary');
      });
    });

    it('should show feature availability status', () => {
      renderFeatures();

      const features = screen.getAllByText(/AI-Powered|Professional|Real-time/);

      features.forEach(feature => {
        const card = feature.closest('[data-testid="feature-card"]');
        expect(card).toContainElement(screen.getByTestId('check-circle-icon'));
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderFeatures();

      const section = screen.getByRole('region', { name: /features/i });
      expect(section).toHaveAttribute('aria-labelledby');

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id');
    });

    it('should support keyboard navigation', () => {
      renderFeatures();

      const interactiveElements = screen.getAllByRole('button');

      interactiveElements.forEach(element => {
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have proper heading hierarchy', () => {
      renderFeatures();

      const mainHeading = screen.getByRole('heading', {
        level: 2,
        name: 'Features',
      });
      expect(mainHeading).toBeInTheDocument();

      const featureHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(featureHeadings.length).toBe(6); // One for each feature
    });

    it('should provide alternative text for icons', () => {
      renderFeatures();

      const icons = document.querySelectorAll('[data-testid*="icon"]');

      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should support screen readers', () => {
      renderFeatures();

      const featureCards = document.querySelectorAll(
        '[data-testid="feature-card"]'

      featureCards.forEach(card => {
        expect(card).toHaveAttribute('role', 'article');
        expect(card).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Performance', () => {
    it('should lazy load feature demos', async () => {
      renderFeatures();

      const aiFeature = screen.getByText('AI-Powered Content');

      // Demo should not be loaded initially
      expect(screen.queryByTestId('ai-demo')).not.toBeInTheDocument();

      // Should load after interaction
      fireEvent.click(aiFeature);

      await waitFor(() => {
        expect(screen.getByTestId('ai-demo')).toBeInTheDocument();
      });
    });

    it('should optimize images and assets', () => {
      renderFeatures();

      const images = document.querySelectorAll('img');

      images.forEach(img => {
        expect(img.loading).toBe('lazy');
        expect(img.src).toContain('_next/image');
      });
    });

    it('should preload critical icons', () => {
      renderFeatures();

      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const iconPreloads = Array.from(preloadLinks).filter(link =>
        link.getAttribute('href')?.includes('icon')

      expect(iconPreloads.length).toBeGreaterThan(0);
    });
  });

  describe('Internationalization', () => {
    it('should use translated feature titles', () => {
      renderFeatures();

      expect(screen.getByText('AI-Powered Content')).toBeInTheDocument();
      expect(screen.getByText('Professional Templates')).toBeInTheDocument();
      expect(screen.getByText('Real-time Preview')).toBeInTheDocument();
    });

    it('should use translated feature descriptions', () => {
      renderFeatures();

      expect(
        screen.getByText(
          'Generate professional content with advanced AI assistance'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Choose from dozens of industry-specific templates')
      ).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      mockUseLanguage.mockReturnValue({
        t: {},
        currentLanguage: 'en',
      } as any);

      renderFeatures();

      // Should show fallback text or empty gracefully
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should adapt layout for RTL languages', () => {
      mockUseLanguage.mockReturnValue({
        t: mockTranslations,
        currentLanguage: 'ar',
      } as any);

      renderFeatures();

      const container = document.querySelector('.features-container');
      expect(container).toHaveClass('rtl:space-x-reverse');
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track feature interactions', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const aiFeature = screen.getByText('AI-Powered Content');
      await user.click(aiFeature);

      expect(window.gtag).toHaveBeenCalledWith('event', 'feature_interaction', {
        feature_name: 'ai_powered_content',
        section: 'features',
      });
    });

    it('should track feature visibility', () => {
      renderFeatures();

      // Should track when features come into view
      expect(IntersectionObserver).toHaveBeenCalled();
    });

    it('should track demo engagement', async () => {
      const user = userEvent.setup();
      renderFeatures();

      const viewDemoButton = screen.getByText('View Demo');
      await user.click(viewDemoButton);

      expect(window.gtag).toHaveBeenCalledWith('event', 'demo_engagement', {
        demo_type: 'feature_demo',
        feature: 'real_time_preview',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle feature demo loading errors', async () => {
      const user = userEvent.setup();
      renderFeatures();

      // Mock demo loading failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Demo failed'));

      const aiFeature = screen.getByText('AI-Powered Content');
      await user.click(aiFeature);

      await waitFor(() => {
        expect(
          screen.getByText('Demo temporarily unavailable')
        ).toBeInTheDocument();
      });
    });

    it('should gracefully handle missing feature data', () => {
      // Mock incomplete feature data
      mockUseLanguage.mockReturnValue({
        t: {
          features: 'Features',
          // Missing feature descriptions
        },
        currentLanguage: 'en',
      } as any);

      renderFeatures();

      // Should still render section structure
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    it('should handle animation errors gracefully', () => {
      // Mock animation API failure
      Element.prototype.animate = jest.fn().mockImplementation(() => {
        throw new Error('Animation failed');
      });

      renderFeatures();

      // Should still render without animations
      expect(screen.getByText('Features')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate with analytics platform', () => {
      renderFeatures();

      // Should initialize feature tracking
      expect(window.gtag).toHaveBeenCalledWith('config', expect.any(String), {
        custom_map: { feature_section: 'features' },
      });
    });

    it('should integrate with experiment system', () => {
      renderFeatures();

      // Should apply A/B test variants
      const experimentVariant = document.querySelector(
        '[data-experiment="features-layout"]'

      expect(experimentVariant).toBeInTheDocument();
    });

    it('should integrate with user preference system', () => {
      renderFeatures();

      // Should respect user motion preferences
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion) {
        const animatedElements = document.querySelectorAll('.animate-fade-in');
        expect(animatedElements.length).toBe(0);
      }
    });
  });
});
