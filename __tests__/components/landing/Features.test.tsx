import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from '@/components/landing/Features';
import { LanguageProvider } from '@/lib/i18n';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Features Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const renderFeatures = (language?: string) => {
    if (language) {
      localStorageMock.getItem.mockReturnValue(language);
    }
    return render(
      <LanguageProvider>
        <Features />
      </LanguageProvider>
    );
  };

  describe('Content Rendering', () => {
    it('should render section title in Spanish by default', () => {
      renderFeatures();

      expect(screen.getByText('Todo lo que Necesitas para')).toBeInTheDocument();
      expect(screen.getByText('Stand Out')).toBeInTheDocument();
    });

    it('should render section title in English', () => {
      renderFeatures('en');

      expect(screen.getByText('Everything You Need to')).toBeInTheDocument();
      expect(screen.getByText('Stand Out')).toBeInTheDocument();
    });

    it('should render section subtitle', () => {
      renderFeatures();

      expect(screen.getByText(/Nuestra plataforma impulsada por IA maneja todo/)).toBeInTheDocument();
    });

    it('should render all six feature cards', () => {
      renderFeatures();

      // Spanish feature titles
      expect(screen.getByText('Mejora de Contenido con IA')).toBeInTheDocument();
      expect(screen.getByText('Importación con Un Clic')).toBeInTheDocument();
      expect(screen.getByText('Plantillas Profesionales')).toBeInTheDocument();
      expect(screen.getByText('Dominio Personalizado')).toBeInTheDocument();
      expect(screen.getByText('Panel de Analíticas')).toBeInTheDocument();
      expect(screen.getByText('Optimizado para Móviles')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      renderFeatures();

      expect(screen.getByText(/Nuestra IA reescribe tu experiencia/)).toBeInTheDocument();
      expect(screen.getByText(/Conecta LinkedIn, GitHub o sube tu CV/)).toBeInTheDocument();
      expect(screen.getByText(/Diseños específicos por industria/)).toBeInTheDocument();
      expect(screen.getByText(/Obtén una URL profesional/)).toBeInTheDocument();
      expect(screen.getByText(/Rastrea visitantes/)).toBeInTheDocument();
      expect(screen.getByText(/Tu portafolio se ve perfecto/)).toBeInTheDocument();
    });

    it('should render features in English', () => {
      renderFeatures('en');

      expect(screen.getByText('AI Content Enhancement')).toBeInTheDocument();
      expect(screen.getByText('One-Click Import')).toBeInTheDocument();
      expect(screen.getByText('Professional Templates')).toBeInTheDocument();
      expect(screen.getByText('Custom Domain')).toBeInTheDocument();
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Mobile Optimized')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have gradient text for "Stand Out"', () => {
      renderFeatures();

      const gradientText = screen.getByText('Stand Out');
      expect(gradientText).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'bg-clip-text', 'text-transparent');
    });

    it('should have grid layout for features', () => {
      renderFeatures();

      const grid = screen.getByText('Mejora de Contenido con IA').closest('.grid');
      expect(grid).toHaveClass('grid', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'md:gap-8');
    });

    it('should have proper card styling', () => {
      renderFeatures();

      const featureCard = screen.getByText('Mejora de Contenido con IA').closest('div.bg-white');
      expect(featureCard).toHaveClass('bg-white', 'dark:bg-gray-800', 'p-8', 'rounded-xl', 'shadow-lg');
    });

    it('should have hover effects on cards', () => {
      renderFeatures();

      const cards = document.querySelectorAll('.hover\\:shadow-xl');
      expect(cards).toHaveLength(6);

      cards.forEach(card => {
        expect(card).toHaveClass('hover:shadow-xl', 'transition-all', 'duration-300', 'hover:-translate-y-1');
      });
    });
  });

  describe('Icons', () => {
    it('should render all feature icons', () => {
      renderFeatures();

      // Check for icon containers with different colors
      const purpleIcon = document.querySelector('.bg-purple-100');
      expect(purpleIcon).toBeInTheDocument();

      const blueIcon = document.querySelector('.bg-blue-100');
      expect(blueIcon).toBeInTheDocument();

      const greenIcon = document.querySelector('.bg-green-100');
      expect(greenIcon).toBeInTheDocument();

      const orangeIcon = document.querySelector('.bg-orange-100');
      expect(orangeIcon).toBeInTheDocument();

      const pinkIcon = document.querySelector('.bg-pink-100');
      expect(pinkIcon).toBeInTheDocument();

      const indigoIcon = document.querySelector('.bg-indigo-100');
      expect(indigoIcon).toBeInTheDocument();
    });

    it('should have consistent icon container styling', () => {
      renderFeatures();

      const iconContainers = document.querySelectorAll('.w-14.h-14');
      expect(iconContainers).toHaveLength(6);

      iconContainers.forEach(container => {
        expect(container).toHaveClass('rounded-lg', 'flex', 'items-center', 'justify-center', 'mb-6');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      renderFeatures();

      // Section title
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveClass('dark:text-white');

      // Subtitle
      const subtitle = screen.getByText(/Nuestra plataforma impulsada por IA/);
      expect(subtitle).toHaveClass('dark:text-gray-300');

      // Feature cards
      const cards = document.querySelectorAll('.dark\\:bg-gray-800');
      expect(cards.length).toBeGreaterThan(0);

      // Feature titles
      const featureTitles = screen.getAllByRole('heading', { level: 3 });
      featureTitles.forEach(title => {
        expect(title).toHaveClass('dark:text-white');
      });

      // Feature descriptions
      const descriptions = document.querySelectorAll('.dark\\:text-gray-300');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should have dark mode icon backgrounds', () => {
      renderFeatures();

      expect(document.querySelector('.dark\\:bg-blue-900')).toBeInTheDocument();
      expect(document.querySelector('.dark\\:bg-green-900')).toBeInTheDocument();
      expect(document.querySelector('.dark\\:bg-orange-900')).toBeInTheDocument();
      expect(document.querySelector('.dark\\:bg-pink-900')).toBeInTheDocument();
      expect(document.querySelector('.dark\\:bg-indigo-900')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderFeatures();

      // Main section heading
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();

      // Feature headings
      const featureHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(featureHeadings).toHaveLength(6);
    });

    it('should have section landmark with id', () => {
      renderFeatures();

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'features');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid', () => {
      renderFeatures();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive spacing', () => {
      renderFeatures();

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('gap-6', 'md:gap-8');
    });

    it('should have responsive section padding', () => {
      renderFeatures();

      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-20', 'px-6');
    });
  });

  describe('Content Structure', () => {
    it('should have consistent structure for all feature cards', () => {
      renderFeatures();

      const cards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800');
      expect(cards).toHaveLength(6);

      cards.forEach(card => {
        // Each card should have an icon container
        const iconContainer = card.querySelector('.w-14.h-14');
        expect(iconContainer).toBeInTheDocument();

        // Each card should have a title
        const title = card.querySelector('h3');
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('text-xl', 'font-semibold', 'mb-3');

        // Each card should have a description
        const description = card.querySelector('p');
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass('text-gray-600', 'dark:text-gray-300');
      });
    });
  });
});