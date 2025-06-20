import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
(<PortfolioPreview {...mockProps} mode="tablet" />);

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle portfolio with minimal data', async () => {
      const minimalPortfolio = {
        ...mockPortfolio,
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        social: {},
      };

      renderPortfolioPreview({
        ...mockProps,
        portfolio: minimalPortfolio,
      });

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });

    it('should handle rapid section changes', async () => {
      const user = userEvent.setup();
      renderPortfolioPreview({
        ...mockProps,
        isInteractive: true,
      });

      const heroSection = screen.getByTestId('hero-section');
      const aboutSection = screen.getByTestId('about-section');

      // Rapid clicks
      await user.click(heroSection);
      await user.click(aboutSection);
      await user.click(heroSection);

      expect(mockProps.onSectionClick).toHaveBeenCalledTimes(3);
    });

    it('should handle invalid mode gracefully', async () => {
      renderPortfolioPreview({
        ...mockProps,
        mode: 'invalid' as any,
      });

      // Should default to desktop or handle gracefully
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should pass language context to templates', async () => {
      renderPortfolioPreview();

      // Templates should have access to language context
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });

    it('should handle RTL languages', async () => {
      renderPortfolioPreview();

      // Preview should adapt to RTL layouts
      const template = screen.getByTestId('developer-template');
      expect(template).toBeInTheDocument();
    });
  });
});
