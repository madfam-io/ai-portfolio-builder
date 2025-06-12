/**
 * Hero Component test suite - final version
 */

import React from 'react';

import Hero from '@/components/landing/Hero';

import { screen, render } from '../../utils/comprehensive-test-setup';

describe('Hero Component', () => {
  describe('Content Rendering', () => {
    test('renders hero title in Spanish by default', async () => {
      render(<Hero />);

      const title = await screen.findByText(/Convierte tu CV en un/i);
      expect(title).toBeInTheDocument();
    });

    test('renders hero title in English', async () => {
      render(<Hero />, { initialLanguage: 'en' });

      const title = await screen.findByText(/Turn Your CV Into a/i);
      expect(title).toBeInTheDocument();
    });

    test('renders CTA buttons', async () => {
      render(<Hero />);

      // Check for CTA buttons (Spanish)
      const ctaButton = await screen.findByRole('link', {
        name: /comenzar gratis/i,
      });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', '/dashboard');

      const demoButton = await screen.findByRole('link', { name: /ver demo/i });
      expect(demoButton).toBeInTheDocument();
      expect(demoButton).toHaveAttribute('href', '/demo');
    });

    test('renders feature highlights', async () => {
      render(<Hero />);

      // Check for hero description
      const description = await screen.findByText(
        /PRISMA by MADFAM utiliza inteligencia artificial/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('renders without errors', () => {
      expect(() => {
        render(<Hero />);
      }).not.toThrow();
    });

    test('has section element', () => {
      const { container } = render(<Hero />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', async () => {
      render(<Hero />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    test('has accessible links', () => {
      render(<Hero />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
