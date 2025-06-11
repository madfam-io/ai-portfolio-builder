import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/landing/Hero';
import { LanguageProvider } from '@/lib/i18n/refactored-context';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const renderHero = (language?: string) => {
    if (language) {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'language') return language;
        return null;
      });
    }
    return render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );
  };

  describe('Content Rendering', () => {
    it('should render hero title in Spanish by default', () => {
      renderHero();

      expect(
        screen.getByText('Tu portafolio, elevado por IA.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Conecta tus perfiles. Mejora tu historia.')
      ).toBeInTheDocument();
      expect(screen.getByText('Publica en minutos.')).toBeInTheDocument();
    });

    it('should render hero title in English when language is set', () => {
      renderHero('en');

      expect(
        screen.getByText('Your portfolio, elevated by AI.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Connect your profiles. Enhance your story.')
      ).toBeInTheDocument();
      expect(screen.getByText('Publish in minutes.')).toBeInTheDocument();
    });

    it('should render hero description', () => {
      renderHero();

      expect(
        screen.getByText(/Presenta tu talento con estilo profesional/)
      ).toBeInTheDocument();
    });

    it('should render AI badge', () => {
      renderHero();

      expect(
        screen.getByText('Impulsado por Llama 3.1 & Mistral AI')
      ).toBeInTheDocument();
    });

    it('should render trust indicators', () => {
      renderHero();

      expect(
        screen.getByText('Sin tarjeta de crédito')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Únete a 10,000+ profesionales')
      ).toBeInTheDocument();
      expect(screen.getByText('4.9/5 Calificación')).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('should render primary CTA button with correct link', () => {
      renderHero();

      const startTrialButton = screen.getByRole('link', {
        name: 'Prueba Gratuita',
      });
      expect(startTrialButton).toBeInTheDocument();
      expect(startTrialButton).toHaveAttribute('href', '/dashboard');
      expect(startTrialButton).toHaveTextContent('Prueba Gratuita');
    });

    it('should render secondary CTA button with correct link', () => {
      renderHero();

      const watchDemoButton = screen.getByRole('link', { name: 'Ver Demo' });
      expect(watchDemoButton).toBeInTheDocument();
      expect(watchDemoButton).toHaveAttribute('href', '/demo');
      expect(watchDemoButton).toHaveTextContent('Ver Demo');
    });

    it('should render CTA buttons in English', () => {
      renderHero('en');

      const trialButton = screen.getByRole('link', {
        name: 'Free Trial',
      });
      expect(trialButton).toHaveTextContent('Free Trial');

      const watchDemoButton = screen.getByRole('link', {
        name: 'Watch Demo',
      });
      expect(watchDemoButton).toHaveTextContent('Watch Demo');
    });
  });

  describe('Styling and Classes', () => {
    it('should have gradient text for the main title', () => {
      renderHero();

      const gradientText = screen.getByText(
        'Conecta tus perfiles. Mejora tu historia.'
      );
      expect(gradientText).toHaveClass('gradient-text');
    });

    it('should have proper button styling classes', () => {
      renderHero();

      const primaryButton = screen.getByRole('link', {
        name: 'Prueba Gratuita',
      });
      expect(primaryButton).toHaveClass('btn-primary', 'group');

      const secondaryButton = screen.getByRole('link', {
        name: 'Ver Demo',
      });
      expect(secondaryButton).toHaveClass('btn-secondary', 'group');
    });

    it('should have interactive enhancements', () => {
      renderHero();

      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        expect(button).toHaveClass('group'); // All buttons have group class for interactions
      });
    });
  });

  describe('Icons', () => {
    it('should render all icons', () => {
      renderHero();

      // Icons are now rendered as React components, not font awesome classes
      // Check for icon SVG elements instead
      const svgIcons = document.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);

      // Check for specific icon presence by their parent elements
      const badge = screen.getByText('Impulsado por Llama 3.1 & Mistral AI');
      expect(badge.parentElement?.querySelector('svg')).toBeInTheDocument();

      const noCreditCard = screen.getByText(
        'Sin tarjeta de crédito'
      );
      expect(
        noCreditCard.parentElement?.querySelector('svg')
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      renderHero();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-5xl', 'sm:text-6xl', 'md:text-7xl');

      const description = screen.getByText(
        /Presenta tu talento con estilo profesional/
      );
      expect(description).toHaveClass('text-xl', 'sm:text-2xl');
    });

    it('should have responsive button layout', () => {
      renderHero();

      const buttonContainer = screen.getByRole('link', {
        name: 'Ver Demo',
      }).parentElement;
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('should have responsive padding', () => {
      renderHero();

      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        expect(button).toHaveClass('px-12', 'py-5');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      renderHero();

      const badge = screen.getByText(
        'Impulsado por Llama 3.1 & Mistral AI'
      ).parentElement;
      expect(badge).toHaveClass(
        'dark:from-purple-900',
        'dark:to-blue-900',
        'dark:text-purple-300'
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('dark:text-white');

      const description = screen.getByText(
        /Presenta tu talento con estilo profesional/
      );
      expect(description).toHaveClass('dark:text-gray-300');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      renderHero();

      expect(screen.getByLabelText('Ver Demo')).toBeInTheDocument();
      expect(screen.getByLabelText('Prueba Gratuita')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      renderHero();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have focus states', () => {
      renderHero();

      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        // Check that buttons have btn-primary or btn-secondary classes which include focus states
        const hasButtonClass =
          button.classList.contains('btn-primary') ||
          button.classList.contains('btn-secondary');
        expect(hasButtonClass).toBe(true);
      });
    });
  });

  describe('Animation Classes', () => {
    it('should have hover animation classes', () => {
      renderHero();

      const primaryButton = screen.getByRole('link', {
        name: 'Prueba Gratuita',
      });
      expect(primaryButton).toHaveClass('btn-primary', 'group');

      const secondaryButton = screen.getByRole('link', {
        name: 'Ver Demo',
      });
      expect(secondaryButton).toHaveClass('btn-secondary', 'group');
    });

    it('should have animated overlay elements', () => {
      renderHero();

      // Check for animated background overlays
      const overlays = document.querySelectorAll(
        '[class*="group-hover:translate-x-full"]'
      );
      expect(overlays.length).toBeGreaterThan(0);

      const scaleOverlays = document.querySelectorAll(
        '[class*="group-hover:scale-x-100"]'
      );
      expect(scaleOverlays.length).toBeGreaterThan(0);
    });
  });
});
