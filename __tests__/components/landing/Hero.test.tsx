/**
 * Hero Component test suite - final version
 */

import React from 'react';
import { screen } from '@testing-library/react';
import Hero from '@/components/landing/Hero';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

describe('Hero Component', () => {
  describe('Content Rendering', () => {
    test('renders hero title in Spanish by default', async () => {
      renderWithLanguage(<Hero />);

      const title = await screen.findByText(/Tu portafolio, elevado por IA/i);
      expect(title).toBeInTheDocument();
    });

    test('renders hero title in English', async () => {
      renderWithLanguage(<Hero />, { initialLanguage: 'en' });

      const title = await screen.findByText(/Your portfolio, elevated by AI/i);
      expect(title).toBeInTheDocument();
    });

    test('renders CTA buttons', async () => {
      renderWithLanguage(<Hero />);

      // Check for CTA buttons (Spanish)
      const ctaButton = await screen.findByRole('link', {
        name: /comenzar gratis/i,
      });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', '#pricing');

      const demoButton = await screen.findByRole('link', { name: /ver demo/i });
      expect(demoButton).toBeInTheDocument();
      expect(demoButton).toHaveAttribute('href', '/demo');
    });

    test('renders feature highlights', async () => {
      renderWithLanguage(<Hero />);

      // Check for key features
      const aiFeature = await screen.findByText(/mejorado con ia/i);
      expect(aiFeature).toBeInTheDocument();

      const quickSetup = await screen.findByText(/configuración rápida/i);
      expect(quickSetup).toBeInTheDocument();

      const templates = await screen.findByText(/plantillas profesionales/i);
      expect(templates).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        renderWithLanguage(<Hero />);
      }).not.toThrow();
    });

    test('has section element', () => {
      renderWithLanguage(<Hero />);

      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', async () => {
      renderWithLanguage(<Hero />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    test('has accessible links', () => {
      renderWithLanguage(<Hero />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
