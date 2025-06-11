/**
 * HowItWorks Component test suite
 */

import React from 'react';
import { screen } from '@testing-library/react';
import HowItWorks from '@/components/landing/HowItWorks';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

describe('HowItWorks Component', () => {
  describe('Content Rendering', () => {
    test('renders section title in Spanish by default', async () => {
      renderWithLanguage(<HowItWorks />);

      const title = await screen.findByText(/cómo funciona/i);
      expect(title).toBeInTheDocument();
    });

    test('renders section title in English', async () => {
      renderWithLanguage(<HowItWorks />, { initialLanguage: 'en' });

      const title = await screen.findByText(/how it works/i);
      expect(title).toBeInTheDocument();
    });

    test('renders step numbers', () => {
      renderWithLanguage(<HowItWorks />);

      // Check for step numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('renders step descriptions', async () => {
      renderWithLanguage(<HowItWorks />);

      // Check for step content
      const headings = await screen.findAllByRole('heading', { level: 3 });
      expect(headings.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        renderWithLanguage(<HowItWorks />);
      }).not.toThrow();
    });

    test('has proper section structure', () => {
      renderWithLanguage(<HowItWorks />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'how-it-works');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithLanguage(<HowItWorks />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThanOrEqual(3);
    });

    test('has semantic HTML structure', () => {
      renderWithLanguage(<HowItWorks />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    test('renders step indicators', () => {
      renderWithLanguage(<HowItWorks />);

      // Check for visual step elements
      const stepNumbers = ['1', '2', '3'];
      stepNumbers.forEach(num => {
        expect(screen.getByText(num)).toBeInTheDocument();
      });
    });
  });
});
