/**
 * Features Component test suite - working version
 */

import React from 'react';
import { screen } from '@testing-library/react';
import Features from '@/components/landing/Features';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

describe('Features Component', () => {
  beforeEach(() => {
    // Clear localStorage to ensure consistent test environment
    localStorage.clear();
  });

  describe('Content Rendering', () => {
    test('renders section title in Spanish by default', async () => {
      renderWithLanguage(<Features />);

      const title = await screen.findByText(/Qué hace PRISMA/i);
      expect(title).toBeInTheDocument();
    });

    test('renders section title in English', async () => {
      renderWithLanguage(<Features />, { initialLanguage: 'en' });

      const title = await screen.findByText(/What PRISMA does/i);
      expect(title).toBeInTheDocument();
    });

    test('renders feature cards', async () => {
      renderWithLanguage(<Features />);

      // Check for feature content
      const features = await screen.findAllByRole('heading', { level: 3 });
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        renderWithLanguage(<Features />);
      }).not.toThrow();
    });

    test('has proper section structure', () => {
      renderWithLanguage(<Features />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'features');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithLanguage(<Features />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
    });

    test('has semantic HTML structure', () => {
      renderWithLanguage(<Features />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });
});
