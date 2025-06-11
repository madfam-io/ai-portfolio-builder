/**
 * Templates Component test suite
 */

import React from 'react';
import { screen } from '@testing-library/react';
import Templates from '@/components/landing/Templates';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

describe('Templates Component', () => {
  describe('Content Rendering', () => {
    test('renders section title in Spanish by default', async () => {
      renderWithLanguage(<Templates />);

      const title = await screen.findByText(/plantillas/i);
      expect(title).toBeInTheDocument();
    });

    test('renders section title in English', async () => {
      renderWithLanguage(<Templates />, { initialLanguage: 'en' });

      const title = await screen.findByText(/templates/i);
      expect(title).toBeInTheDocument();
    });

    test('renders template categories', async () => {
      renderWithLanguage(<Templates />);

      // Check for template types
      const headings = await screen.findAllByRole('heading', { level: 3 });
      expect(headings.length).toBeGreaterThanOrEqual(3);

      // Should have developer, designer, consultant templates
      const templateText = screen.getByText(/developer|desarrollador/i);
      expect(templateText).toBeInTheDocument();
    });

    test('renders template features', () => {
      renderWithLanguage(<Templates />);

      // Check for feature lists
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Template Cards', () => {
    test('renders multiple template cards', () => {
      renderWithLanguage(<Templates />);

      // Should have at least 3 template options
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    test('each template has a preview link', () => {
      renderWithLanguage(<Templates />);

      const links = screen.getAllByRole('link');
      const previewLinks = links.filter(
        link =>
          link.textContent?.toLowerCase().includes('preview') ||
          link.textContent?.toLowerCase().includes('ver')
      );
      expect(previewLinks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        renderWithLanguage(<Templates />);
      }).not.toThrow();
    });

    test('has proper section structure', () => {
      renderWithLanguage(<Templates />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'templates');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithLanguage(<Templates />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThanOrEqual(3);
    });

    test('template links are accessible', () => {
      renderWithLanguage(<Templates />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
        expect(link).toHaveAttribute('href');
      });
    });
  });
});
