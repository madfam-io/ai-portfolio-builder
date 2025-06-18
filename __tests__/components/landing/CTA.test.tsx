/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CTA from '@/components/landing/CTA';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href, className, ...props }: any) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('CTA', () => {
  const mockTranslations = {
    ctaTitle: 'Ready to Create Your Professional Portfolio?',
    ctaSubtitle:
      'Join thousands of professionals who have built stunning portfolios with PRISMA',
    ctaButton: 'Start Building Your Portfolio',
    ctaFooter: 'No credit card required • Free forever plan available',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
      currentLanguage: 'en',
    } as any);
  });

  const renderCTA = () => {
    return render(<CTA />);
  };

  describe('Initial Rendering', () => {
    it('should render CTA title and subtitle', () => {
      renderCTA();

      expect(
        screen.getByText('Ready to Create Your Professional Portfolio?')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Join thousands of professionals who have built stunning portfolios with PRISMA'
        )
      ).toBeInTheDocument();
    });

    it('should render CTA button as link to dashboard', () => {
      renderCTA();

      const ctaLink = screen.getByRole('link');
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/dashboard');
      expect(ctaLink).toHaveTextContent('Start Building Your Portfolio');
    });

    it('should render footer text', () => {
      renderCTA();

      expect(
        screen.getByText('No credit card required • Free forever plan available')
      ).toBeInTheDocument();
    });

    it('should have proper section with gradient background', () => {
      renderCTA();

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-blue-600');
    });

    it('should have proper heading hierarchy', () => {
      renderCTA();

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(
        'Ready to Create Your Professional Portfolio?'
      );
    });
  });

  describe('Translation and Internationalization', () => {
    it('should use translations from i18n context', () => {
      renderCTA();

      // Verify all translated content is displayed
      expect(
        screen.getByText('Ready to Create Your Professional Portfolio?')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Join thousands of professionals who have built stunning portfolios with PRISMA'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Start Building Your Portfolio')).toBeInTheDocument();
      expect(
        screen.getByText('No credit card required • Free forever plan available')
      ).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      // Mock with missing translations
      mockUseLanguage.mockReturnValue({
        t: {
          ctaTitle: undefined,
          ctaSubtitle: undefined,
          ctaButton: undefined,
          ctaFooter: undefined,
        },
        currentLanguage: 'en',
      } as any);

      renderCTA();

      // Component should still render without crashing
      expect(document.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have the correct DOM structure', () => {
      renderCTA();

      // Check section element
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('py-20', 'px-6', 'text-white');

      // Check container
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto', 'text-center');

      // Check heading
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-4xl', 'font-bold', 'mb-4');

      // Check link
      const link = screen.getByRole('link');
      expect(link).toHaveClass(
        'inline-block',
        'bg-white',
        'text-purple-600',
        'px-8',
        'py-4',
        'rounded-lg'
      );
    });

    it('should have proper text styling classes', () => {
      renderCTA();

      const subtitle = screen.getByText(
        'Join thousands of professionals who have built stunning portfolios with PRISMA'
      );
      expect(subtitle).toHaveClass('text-xl', 'mb-8', 'opacity-90');

      const footer = screen.getByText(
        'No credit card required • Free forever plan available'
      );
      expect(footer).toHaveClass('mt-4', 'opacity-80');
    });
  });
});
