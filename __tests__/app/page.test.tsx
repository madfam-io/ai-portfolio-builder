/**
 * Refactored HomePage test suite - optimized for performance
 */

import React from 'react';
import { screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { renderWithLanguage } from '../utils/i18n-test-utils';
import { withTimeout } from '../utils/test-optimization';

// Mock child components for faster tests
jest.mock('@/components/landing/Header', () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock('@/components/landing/Hero', () => ({
  __esModule: true,
  default: () => <section data-testid="hero">Hero</section>,
}));

jest.mock('@/components/landing/Features', () => ({
  __esModule: true,
  default: () => <section data-testid="features">Features</section>,
}));

jest.mock('@/components/landing/HowItWorks', () => ({
  __esModule: true,
  default: () => <section data-testid="how-it-works">HowItWorks</section>,
}));

jest.mock('@/components/landing/Templates', () => ({
  __esModule: true,
  default: () => <section data-testid="templates">Templates</section>,
}));

jest.mock('@/components/landing/Pricing', () => ({
  __esModule: true,
  default: () => <section data-testid="pricing">Pricing</section>,
}));

jest.mock('@/components/landing/CTA', () => ({
  __esModule: true,
  default: () => <section data-testid="cta">CTA</section>,
}));

jest.mock('@/components/landing/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock('@/components/BackToTopButton', () => ({
  __esModule: true,
  default: () => <button data-testid="back-to-top">Back to Top</button>,
}));

describe('HomePage - Optimized', () => {
  describe('Component Structure', () => {
    test('renders all landing page sections', async () => {
      await withTimeout(async () => {
        renderWithLanguage(<HomePage />);

        // Check all sections are rendered
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('hero')).toBeInTheDocument();
        expect(screen.getByTestId('features')).toBeInTheDocument();
        expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
        expect(screen.getByTestId('templates')).toBeInTheDocument();
        expect(screen.getByTestId('pricing')).toBeInTheDocument();
        expect(screen.getByTestId('cta')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
      });
    });
  });

  describe('Layout and Styling', () => {
    test('has proper page structure', () => {
      renderWithLanguage(<HomePage />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      // Main element should exist for proper page structure
    });

    test('renders without errors', () => {
      // Test that the page renders without throwing
      expect(() => {
        renderWithLanguage(<HomePage />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('has accessible page structure', () => {
      renderWithLanguage(<HomePage />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });
});

// Integration test with real components (skip in CI for speed)
if (process.env.CI !== 'true') {
  // Clear mocks for integration test
  jest.unmock('@/components/landing/Header');
  jest.unmock('@/components/landing/Hero');
  jest.unmock('@/components/landing/Features');

  describe('HomePage Integration', () => {
    test('renders with real components', async () => {
      const { default: RealHomePage } = await import('@/app/page');

      await withTimeout(async () => {
        renderWithLanguage(<RealHomePage />);

        // Test with real Hero component
        const heroTitle = await screen.findByText(
          /tu portafolio|your portfolio/i
        );
        expect(heroTitle).toBeInTheDocument();
      });
    });
  });
}
