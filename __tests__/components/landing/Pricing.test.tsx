import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

import Pricing from '@/components/landing/Pricing';

/**
 * Pricing Component test suite - working version
 */

describe('Pricing Component', () => {
  describe('Content Rendering', () => {
    test('renders section title in Spanish by default', async () => {
      renderWithLanguage(<Pricing />);

      const title = await screen.findByText(/accede hoy/i);
      expect(title).toBeInTheDocument();
    });

    test('renders section title in English', async () => {
      renderWithLanguage(<Pricing />, { initialLanguage: 'en' });

      const title = await screen.findByText(/get started today/i);
      expect(title).toBeInTheDocument();
    });

    test('renders pricing plans', async () => {
      renderWithLanguage(<Pricing />);

      // Check for plan headings
      const plans = await screen.findAllByRole('heading', { level: 3 });
      expect(plans.length).toBeGreaterThanOrEqual(3);
    });

    test('displays pricing information', async () => {
      renderWithLanguage(<Pricing />);

      // Check for price elements
      const prices = await screen.findAllByText(/\$\d+/);
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  describe('CTA Buttons', () => {
    test('renders CTA buttons', () => {
      renderWithLanguage(<Pricing />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(3);
    });

    test('CTA buttons have href attributes', () => {
      renderWithLanguage(<Pricing />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        renderWithLanguage(<Pricing />);
      }).not.toThrow();
    });

    test('has proper section structure', () => {
      renderWithLanguage(<Pricing />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'pricing');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithLanguage(<Pricing />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThanOrEqual(3);
    });

    test('has accessible links', () => {
      renderWithLanguage(<Pricing />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
