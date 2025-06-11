import React from 'react';
import { render, screen } from '@testing-library/react';
import Pricing from '@/components/landing/Pricing';
import { LanguageProvider } from '@/lib/i18n/refactored-context';
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

      expect(screen.getByText('Accede hoy.')).toBeInTheDocument();
      expect(screen.getByText('Características Poderosas')).toBeInTheDocument();
    });

    it('should render section title in English', () => {
      localStorageMock.getItem.mockReturnValue('en');
      renderPricing('en');

      expect(screen.getByText('Access today.')).toBeInTheDocument();
      expect(screen.getByText('Powerful Features')).toBeInTheDocument();
    });

    it('should render section subtitle', () => {
      renderPricing();

      expect(screen.getByText('Impresiona mañana.')).toBeInTheDocument();
    });

    it('should render all four pricing plans', () => {
      renderPricing();

      expect(
        screen.getByRole('heading', { name: 'Gratis' })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'PRO' })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'PRISMA+' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Enterprise' })
      ).toBeInTheDocument();
    });

    it('should render pricing for each plan', () => {
      renderPricing();

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('$340')).toBeInTheDocument();
      expect(screen.getByText('$875')).toBeInTheDocument();
      expect(screen.getByText('$1750')).toBeInTheDocument();
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
      expect(screen.getByText('Subdominio PRISMA')).toBeInTheDocument();
      expect(screen.getByText('3 reescrituras IA/mes')).toBeInTheDocument();
    });

    it('should render features for Pro plan', () => {
      renderPricing();

      expect(screen.getByText('3 portafolios')).toBeInTheDocument();
      expect(screen.getByText('Todas las plantillas')).toBeInTheDocument();
      expect(screen.getByText('Dominio personalizado')).toBeInTheDocument();
      expect(
        screen.getByText('Reescrituras IA ilimitadas')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Analíticas y herramientas SEO')
      ).toBeInTheDocument();
    });

    it('should render features for Business plan', () => {
      renderPricing();

      expect(screen.getByText('Portafolios ilimitados')).toBeInTheDocument();
      expect(screen.getByText('Opción marca blanca')).toBeInTheDocument();
      expect(screen.getByText('Acceso API')).toBeInTheDocument();
      expect(screen.getByText('Colaboración en equipo')).toBeInTheDocument();
      expect(screen.getByText('Soporte prioritario')).toBeInTheDocument();
    });

    it('should render features for Enterprise plan', () => {
      renderPricing();

      expect(screen.getByText('Todo en Business +')).toBeInTheDocument();
      expect(
        screen.getByText('Soluciones de marca blanca')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Gerente de cuenta dedicado')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Integraciones personalizadas')
      ).toBeInTheDocument();
      expect(screen.getByText('Soporte prioritario 24/7')).toBeInTheDocument();
      expect(screen.getByText('Garantías SLA')).toBeInTheDocument();
    });

    it('should render check icons for all features', () => {
      renderPricing();

      const checkIcons = document.querySelectorAll('svg');
      expect(checkIcons.length).toBeGreaterThanOrEqual(20); // All feature items across 4 plans
    });
  });

  describe('CTA Links', () => {
    it('should render correct CTA links', () => {
      renderPricing();

      expect(
        screen.getByRole('link', { name: 'Comenzar Gratis' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Prueba Pro' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Iniciar Prueba Business' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Contactar Equipo de Ventas' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Iniciar Prueba Enterprise' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Solicitar Cotización Personalizada' })
      ).toBeInTheDocument();
    });

    it('should have correct href attributes for each plan', () => {
      renderPricing();

      const freeLink = screen.getByRole('link', { name: 'Comenzar Gratis' });
      expect(freeLink).toHaveAttribute('href', '/auth/signup?plan=free');

      const proLink = screen.getByRole('link', { name: 'Prueba Pro' });
      expect(proLink).toHaveAttribute('href', '/auth/signup?plan=pro');

      const businessLink = screen.getByRole('link', {
        name: 'Iniciar Prueba Business',
      });
      expect(businessLink).toHaveAttribute(
        'href',
        '/auth/signup?plan=business'
      );

      const businessContactLink = screen.getByRole('link', {
        name: 'Contactar Equipo de Ventas',
      });
      expect(businessContactLink).toHaveAttribute(
        'href',
        '/contact?plan=business'
      );

      const enterpriseLink = screen.getByRole('link', {
        name: 'Iniciar Prueba Enterprise',
      });
      expect(enterpriseLink).toHaveAttribute(
        'href',
        '/auth/signup?plan=enterprise'
      );

      const enterpriseContactLink = screen.getByRole('link', {
        name: 'Solicitar Cotización Personalizada',
      });
      expect(enterpriseContactLink).toHaveAttribute(
        'href',
        '/contact?plan=enterprise'
      );
    });

    it('should have different link styles for each plan', () => {
      renderPricing();

      const freeLink = screen.getByRole('link', { name: 'Comenzar Gratis' });
      expect(freeLink).toHaveClass(
        'border-2',
        'border-purple-600',
        'text-purple-600'
      );

      const proLink = screen.getByRole('link', { name: 'Prueba Pro' });
      expect(proLink).toHaveClass('bg-white', 'text-purple-600');

      const businessLink = screen.getByRole('link', {
        name: 'Iniciar Prueba Business',
      });
      expect(businessLink).toHaveClass('bg-purple-600', 'text-white');

      const enterpriseLink = screen.getByRole('link', {
        name: 'Iniciar Prueba Enterprise',
      });
      expect(enterpriseLink).toHaveClass('bg-yellow-400', 'text-gray-900');
    });

    it('should have hover effects on links', () => {
      renderPricing();

      const freeLink = screen.getByRole('link', { name: 'Comenzar Gratis' });
      expect(freeLink).toHaveClass('hover:bg-purple-50');

      const proLink = screen.getByRole('link', { name: 'Prueba Pro' });
      expect(proLink).toHaveClass('hover:bg-gray-100');

      const businessLink = screen.getByRole('link', {
        name: 'Iniciar Prueba Business',
      });
      expect(businessLink).toHaveClass('hover:bg-purple-700');

      const enterpriseLink = screen.getByRole('link', {
        name: 'Iniciar Prueba Enterprise',
      });
      expect(enterpriseLink).toHaveClass('hover:bg-yellow-300');
    });
  });

  describe('Styling and Layout', () => {
    it('should have gradient text for "Características Poderosas"', () => {
      renderPricing();

      const gradientText = screen.getByText('Características Poderosas');
      expect(gradientText).toHaveClass(
        'bg-gradient-to-r',
        'from-purple-600',
        'to-blue-600',
        'bg-clip-text',
        'text-transparent'
      );
    });

    it('should have grid layout for pricing cards', () => {
      renderPricing();

      const grid = screen
        .getByRole('heading', { name: 'Gratis' })
        .closest('.grid');
      expect(grid).toHaveClass(
        'grid',
        'sm:grid-cols-2',
        'lg:grid-cols-4',
        'gap-6',
        'md:gap-8'
      );
    });

    it('should have elevated Pro plan card', () => {
      renderPricing();

      const proCard = screen
        .getByText('MÁS POPULAR')
        .closest('div.bg-purple-600');
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

      const freeCard = screen
        .getByRole('heading', { name: 'Gratis' })
        .closest('div');
      expect(freeCard).toHaveClass('dark:bg-gray-700');

      const businessCard = screen
        .getByRole('heading', { name: 'PRISMA+' })
        .closest('div');
      expect(businessCard).toHaveClass('dark:bg-gray-700');
    });

    it('should have dark mode text colors', () => {
      renderPricing();

      const headings = [
        screen.getByRole('heading', { name: 'Gratis' }),
        screen.getByRole('heading', { name: 'PRISMA+' }),
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
      expect(planHeadings).toHaveLength(4);
    });

    it('should have section landmark with id', () => {
      renderPricing();

      const section = document.querySelector('#pricing');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'pricing');
    });

    it('should have accessible link labels', () => {
      renderPricing();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(6);

      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid', () => {
      renderPricing();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should have responsive spacing', () => {
      renderPricing();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('gap-6', 'md:gap-8');
    });

    it('should have max width constraint', () => {
      renderPricing();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('max-w-6xl', 'mx-auto');
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

    it('should have link transitions', () => {
      renderPricing();

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('transition');
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
      expect(monthLabels).toHaveLength(4); // All plans show /mes including Free plan
    });
  });
});
