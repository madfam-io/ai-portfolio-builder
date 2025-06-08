import React from 'react';
import { render, screen } from '@testing-library/react';
import Pricing from '@/components/landing/Pricing';
import { LanguageProvider } from '@/lib/i18n';
import { AppProvider } from '@/lib/contexts/AppContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Pricing Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const renderPricing = (language?: string) => {
    if (language) {
      localStorageMock.getItem.mockReturnValue(language);
    }
    return render(
      <AppProvider>
        <LanguageProvider>
          <Pricing />
        </LanguageProvider>
      </AppProvider>
    );
  };

  describe('Content Rendering', () => {
    it('should render section title in Spanish by default', () => {
      renderPricing();

      expect(screen.getByText('Precios Simples,')).toBeInTheDocument();
      expect(screen.getByText('Características Poderosas')).toBeInTheDocument();
    });

    it('should render section title in English', () => {
      localStorageMock.getItem.mockReturnValue('en');
      renderPricing('en');

      expect(screen.getByText('Simple Pricing,')).toBeInTheDocument();
      expect(screen.getByText('Powerful Features')).toBeInTheDocument();
    });

    it('should render section subtitle', () => {
      renderPricing();

      expect(screen.getByText('Comienza gratis, actualiza cuando necesites más')).toBeInTheDocument();
    });

    it('should render all three pricing plans', () => {
      renderPricing();

      expect(screen.getByRole('heading', { name: 'Gratis' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Empresarial' })).toBeInTheDocument();
    });

    it('should render pricing for each plan', () => {
      renderPricing();

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('$340')).toBeInTheDocument();
      expect(screen.getByText('$875')).toBeInTheDocument();
    });

    it('should render "Most Popular" badge on Pro plan', () => {
      renderPricing();

      expect(screen.getByText('MÁS POPULAR')).toBeInTheDocument();
    });
  });

  describe('Feature Lists', () => {
    it('should render features for Free plan', () => {
      renderPricing();

      expect(screen.getByText('1 portafolio')).toBeInTheDocument();
      expect(screen.getByText('Plantillas básicas')).toBeInTheDocument();
      expect(screen.getByText('Subdominio MADFAM')).toBeInTheDocument();
      expect(screen.getByText('3 reescrituras IA/mes')).toBeInTheDocument();
    });

    it('should render features for Pro plan', () => {
      renderPricing();

      expect(screen.getByText('3 portafolios')).toBeInTheDocument();
      expect(screen.getByText('Todas las plantillas')).toBeInTheDocument();
      expect(screen.getByText('Dominio personalizado')).toBeInTheDocument();
      expect(screen.getByText('Reescrituras IA ilimitadas')).toBeInTheDocument();
      expect(screen.getByText('Analíticas y herramientas SEO')).toBeInTheDocument();
    });

    it('should render features for Business plan', () => {
      renderPricing();

      expect(screen.getByText('Portafolios ilimitados')).toBeInTheDocument();
      expect(screen.getByText('Opción marca blanca')).toBeInTheDocument();
      expect(screen.getByText('Acceso API')).toBeInTheDocument();
      expect(screen.getByText('Colaboración en equipo')).toBeInTheDocument();
      expect(screen.getByText('Soporte prioritario')).toBeInTheDocument();
    });

    it('should render check icons for all features', () => {
      renderPricing();

      const checkIcons = document.querySelectorAll('svg');
      expect(checkIcons.length).toBeGreaterThanOrEqual(14); // All feature items
    });
  });

  describe('CTA Buttons', () => {
    it('should render correct CTA buttons', () => {
      renderPricing();

      expect(screen.getByRole('button', { name: 'Comenzar Gratis' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Prueba Pro' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contactar Ventas' })).toBeInTheDocument();
    });

    it('should have different button styles for each plan', () => {
      renderPricing();

      const freeButton = screen.getByRole('button', { name: 'Comenzar Gratis' });
      expect(freeButton).toHaveClass('border-2', 'border-purple-600', 'text-purple-600');

      const proButton = screen.getByRole('button', { name: 'Prueba Pro' });
      expect(proButton).toHaveClass('bg-white', 'text-purple-600');

      const businessButton = screen.getByRole('button', { name: 'Contactar Ventas' });
      expect(businessButton).toHaveClass('border-2', 'border-purple-600', 'text-purple-600');
    });

    it('should have hover effects on buttons', () => {
      renderPricing();

      const freeButton = screen.getByRole('button', { name: 'Comenzar Gratis' });
      expect(freeButton).toHaveClass('hover:bg-purple-50');

      const proButton = screen.getByRole('button', { name: 'Prueba Pro' });
      expect(proButton).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Styling and Layout', () => {
    it('should have gradient text for "Características Poderosas"', () => {
      renderPricing();

      const gradientText = screen.getByText('Características Poderosas');
      expect(gradientText).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'bg-clip-text', 'text-transparent');
    });

    it('should have grid layout for pricing cards', () => {
      renderPricing();

      const grid = screen.getByRole('heading', { name: 'Gratis' }).closest('.grid');
      expect(grid).toHaveClass('grid', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'md:gap-8');
    });

    it('should have elevated Pro plan card', () => {
      renderPricing();

      const proCard = screen.getByText('MÁS POPULAR').closest('div.bg-purple-600');
      expect(proCard).toHaveClass('transform', 'scale-105');
    });

    it('should have different background for Pro plan', () => {
      renderPricing();

      const proCard = screen.getByText('MÁS POPULAR').closest('.bg-purple-600');
      expect(proCard).toHaveClass('bg-purple-600', 'text-white');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for section', () => {
      renderPricing();

      const section = document.querySelector('section');
      expect(section).toHaveClass('dark:bg-gray-800');
    });

    it('should have dark mode classes for cards', () => {
      renderPricing();

      const freeCard = screen.getByRole('heading', { name: 'Gratis' }).closest('div');
      expect(freeCard).toHaveClass('dark:bg-gray-700');

      const businessCard = screen.getByRole('heading', { name: 'Empresarial' }).closest('div');
      expect(businessCard).toHaveClass('dark:bg-gray-700');
    });

    it('should have dark mode text colors', () => {
      renderPricing();

      const headings = [
        screen.getByRole('heading', { name: 'Gratis' }),
        screen.getByRole('heading', { name: 'Empresarial' })
      ];

      headings.forEach(heading => {
        expect(heading).toHaveClass('dark:text-white');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderPricing();

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();

      const planHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(planHeadings).toHaveLength(3);
    });

    it('should have section landmark with id', () => {
      renderPricing();

      const section = document.querySelector('#pricing');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'pricing');
    });

    it('should have accessible button labels', () => {
      renderPricing();

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid', () => {
      renderPricing();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive spacing', () => {
      renderPricing();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('gap-6', 'md:gap-8');
    });

    it('should have max width constraint', () => {
      renderPricing();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('max-w-5xl', 'mx-auto');
    });
  });

  describe('Transitions', () => {
    it('should have color transitions', () => {
      renderPricing();

      const section = document.querySelector('section');
      expect(section).toHaveClass('transition-colors', 'duration-300');

      const cards = document.querySelectorAll('.transition-colors');
      expect(cards.length).toBeGreaterThan(1);
    });

    it('should have button transitions', () => {
      renderPricing();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition');
      });
    });
  });

  describe('Currency Display', () => {
    it('should display MXN currency by default', () => {
      renderPricing();

      const prices = ['0', '$340', '$875'];
      prices.forEach(price => {
        expect(screen.getByText(price)).toBeInTheDocument();
      });
    });

    it('should display per month for all plans', () => {
      renderPricing();

      const monthLabels = screen.getAllByText('/mes');
      expect(monthLabels).toHaveLength(3); // All plans show /mes including Free plan
    });
  });
});