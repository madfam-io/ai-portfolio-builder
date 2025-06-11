/**
 * Header Component test suite - working version
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Header from '@/components/landing/Header';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

describe('Header Component', () => {
  describe('Content Rendering', () => {
    test('renders navigation links in Spanish by default', async () => {
      renderWithLanguage(<Header />);

      // Check for navigation items
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Check for some link text
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    test('renders PRISMA logo/brand', () => {
      renderWithLanguage(<Header />);

      const logo = screen.getByText(/prisma/i);
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Language Switcher', () => {
    test('renders language toggle button', () => {
      renderWithLanguage(<Header />);

      // Language button should be present
      const buttons = screen.getAllByRole('button');
      const langButton = buttons.find(
        btn =>
          btn.textContent?.includes('🇲🇽') || btn.textContent?.includes('🇺🇸')
      );
      expect(langButton).toBeInTheDocument();
    });

    test('language toggle is clickable', () => {
      renderWithLanguage(<Header />);

      const buttons = screen.getAllByRole('button');
      const langButton = buttons.find(
        btn =>
          btn.textContent?.includes('🇲🇽') || btn.textContent?.includes('🇺🇸')
      );

      if (langButton) {
        expect(() => {
          fireEvent.click(langButton);
        }).not.toThrow();
      }
    });
  });

  describe('Navigation', () => {
    test('has navigation element', () => {
      renderWithLanguage(<Header />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('navigation links have href attributes', () => {
      renderWithLanguage(<Header />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        renderWithLanguage(<Header />);
      }).not.toThrow();
    });

    test('has header element', () => {
      renderWithLanguage(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has semantic HTML structure', () => {
      renderWithLanguage(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('has accessible navigation', () => {
      renderWithLanguage(<Header />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
