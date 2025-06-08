import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/landing/Hero';
import { LanguageProvider } from '@/lib/i18n';

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
      localStorageMock.getItem.mockReturnValue(language);
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

      expect(screen.getByText('Convierte tu CV en un')).toBeInTheDocument();
      expect(screen.getByText('Portafolio Impresionante')).toBeInTheDocument();
      expect(screen.getByText('en 30 Minutos')).toBeInTheDocument();
    });

    it('should render hero title in English when language is set', () => {
      localStorageMock.getItem.mockReturnValue('en');
      renderHero('en');

      expect(screen.getByText('Turn Your CV Into a')).toBeInTheDocument();
      expect(screen.getByText('Stunning Portfolio')).toBeInTheDocument();
      expect(screen.getByText('in 30 Minutes')).toBeInTheDocument();
    });

    it('should render hero description', () => {
      renderHero();

      expect(screen.getByText(/Importa desde LinkedIn, GitHub o sube tu currículum/)).toBeInTheDocument();
    });

    it('should render AI badge', () => {
      renderHero();

      expect(screen.getByText('Powered by GPT-4 & Claude AI')).toBeInTheDocument();
    });

    it('should render trust indicators', () => {
      renderHero();

      expect(screen.getByText('No se requiere tarjeta de crédito')).toBeInTheDocument();
      expect(screen.getByText('Únete a 10,000+ profesionales')).toBeInTheDocument();
      expect(screen.getByText('calificación 4.9/5')).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('should render primary CTA button with correct link', () => {
      renderHero();

      const watchDemoButton = screen.getByRole('link', { name: 'Conoce más sobre nosotros' });
      expect(watchDemoButton).toBeInTheDocument();
      expect(watchDemoButton).toHaveAttribute('href', '/about');
      expect(watchDemoButton).toHaveTextContent('Ver Demo');
    });

    it('should render secondary CTA button with correct link', () => {
      renderHero();

      const trialButton = screen.getByRole('link', { name: 'Prueba Gratuita' });
      expect(trialButton).toBeInTheDocument();
      expect(trialButton).toHaveAttribute('href', '/dashboard');
      expect(trialButton).toHaveTextContent('Prueba Gratuita');
    });

    it('should render CTA buttons in English', () => {
      localStorageMock.getItem.mockReturnValue('en');
      renderHero('en');

      const watchDemoButton = screen.getByRole('link', { name: 'Learn more about us' });
      expect(watchDemoButton).toHaveTextContent('Watch Demo');

      const trialButton = screen.getByRole('link', { name: 'Start Free Trial' });
      expect(trialButton).toHaveTextContent('Start Free Trial');
    });
  });

  describe('Styling and Classes', () => {
    it('should have gradient text for the main title', () => {
      renderHero();

      const gradientText = screen.getByText('Portafolio Impresionante');
      expect(gradientText).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'bg-clip-text', 'text-transparent');
    });

    it('should have proper button styling classes', () => {
      renderHero();

      const primaryButton = screen.getByRole('link', { name: 'Conoce más sobre nosotros' });
      expect(primaryButton).toHaveClass('btn-primary', 'group');

      const secondaryButton = screen.getByRole('link', { name: 'Prueba Gratuita' });
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

      // Check for icon containers
      const playIcon = document.querySelector('.fa-play');
      expect(playIcon).toBeInTheDocument();

      const checkIcon = document.querySelector('.fa-check-circle');
      expect(checkIcon).toBeInTheDocument();

      const usersIcon = document.querySelector('.fa-users');
      expect(usersIcon).toBeInTheDocument();

      const starIcons = document.querySelectorAll('.fa-star');
      expect(starIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      renderHero();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl');

      const description = screen.getByText(/Importa desde LinkedIn/);
      expect(description).toHaveClass('text-lg', 'sm:text-xl');
    });

    it('should have responsive button layout', () => {
      renderHero();

      const buttonContainer = screen.getByRole('link', { name: 'Learn more about us' }).parentElement;
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('should have responsive padding', () => {
      renderHero();

      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        expect(button).toHaveClass('px-8', 'sm:px-10', 'py-4', 'sm:py-5');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      renderHero();

      const badge = screen.getByText('Powered by GPT-4 & Claude AI').parentElement;
      expect(badge).toHaveClass('dark:bg-purple-900', 'dark:text-purple-300');

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('dark:text-white');

      const description = screen.getByText(/Importa desde LinkedIn/);
      expect(description).toHaveClass('dark:text-gray-300');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      renderHero();

      expect(screen.getByLabelText('Conoce más sobre nosotros')).toBeInTheDocument();
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
        const hasButtonClass = button.classList.contains('btn-primary') || button.classList.contains('btn-secondary');
        expect(hasButtonClass).toBe(true);
      });
    });
  });

  describe('Animation Classes', () => {
    it('should have hover animation classes', () => {
      renderHero();

      const primaryButton = screen.getByRole('link', { name: 'Conoce más sobre nosotros' });
      expect(primaryButton).toHaveClass('btn-primary', 'group');

      const secondaryButton = screen.getByRole('link', { name: 'Prueba Gratuita' });
      expect(secondaryButton).toHaveClass('btn-secondary', 'group');
    });

    it('should have animated overlay elements', () => {
      renderHero();

      // Check for animated background overlays
      const overlays = document.querySelectorAll('[class*="group-hover:translate-x-full"]');
      expect(overlays.length).toBeGreaterThan(0);

      const scaleOverlays = document.querySelectorAll('[class*="group-hover:scale-x-100"]');
      expect(scaleOverlays.length).toBeGreaterThan(0);
    });
  });
});