import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
(<CTA />);
  };

  describe('Initial Rendering', () => {
    it('should render CTA title and subtitle', async () => {
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

    it('should render CTA button as link to dashboard', async () => {
      renderCTA();

      const ctaLink = screen.getByRole('link');
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/dashboard');
      expect(ctaLink).toHaveTextContent('Start Building Your Portfolio');
    });

    it('should render footer text', async () => {
      renderCTA();

      expect(
        screen.getByText(
          'No credit card required • Free forever plan available'
        )
      ).toBeInTheDocument();
    });

    it('should have proper section with gradient background', async () => {
      renderCTA();

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass(
        'bg-gradient-to-r',
        'from-purple-600',
        'to-blue-600'

    });

    it('should have proper heading hierarchy', async () => {
      renderCTA();

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(
        'Ready to Create Your Professional Portfolio?'

    });
  });

  describe('Translation and Internationalization', () => {
    it('should use translations from i18n context', async () => {
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
      expect(
        screen.getByText('Start Building Your Portfolio')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'No credit card required • Free forever plan available'
        )
      ).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', async () => {
      // Mock with missing translations
      (mockUseLanguage as any).mockImplementation(() => ({
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
    it('should have the correct DOM structure', async () => {
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

    });

    it('should have proper text styling classes', async () => {
      renderCTA();

      const subtitle = screen.getByText(
        'Join thousands of professionals who have built stunning portfolios with PRISMA'

      expect(subtitle).toHaveClass('text-xl', 'mb-8', 'opacity-90');

      const footer = screen.getByText(
        'No credit card required • Free forever plan available'

      expect(footer).toHaveClass('mt-4', 'opacity-80');
    });
  });
});
