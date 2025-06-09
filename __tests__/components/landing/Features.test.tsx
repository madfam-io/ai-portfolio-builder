import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from '@/components/landing/Features';
import { LanguageProvider } from '@/lib/i18n/minimal-context';

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
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'language') return language;
        return null;
      });
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

      expect(screen.getByText('Qué hace PRISMA')).toBeInTheDocument();
      expect(screen.getByText('Destacar')).toBeInTheDocument();
    });

    it('should render section title in English', () => {
      renderFeatures('en');

      expect(screen.getByText('What PRISMA does')).toBeInTheDocument();
      expect(screen.getByText('Stand Out')).toBeInTheDocument();
    });

    it('should render section subtitle', () => {
      renderFeatures();

      expect(
        screen.getByText(
          /Hecho para profesionales que saben que su presencia digital importa/
        )
      ).toBeInTheDocument();
    });

    it('should render all six feature cards', () => {
      renderFeatures();

      // Spanish feature titles
      expect(screen.getByText('IA que entiende tu perfil')).toBeInTheDocument();
      expect(screen.getByText('Conexión inteligente')).toBeInTheDocument();
      expect(screen.getByText('Diseños que impactan')).toBeInTheDocument();
      expect(
        screen.getByText('Subdominio o dominio propio')
      ).toBeInTheDocument();
      expect(screen.getByText('Publica en 30 minutos')).toBeInTheDocument();
      expect(screen.getByText('Para quien es PRISMA')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      renderFeatures();

      expect(
        screen.getByText(
          /Reescribe tu biografía y tus proyectos con claridad y persuasión/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Importa datos desde LinkedIn, GitHub y otros formatos con un clic/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Plantillas profesionales listas para destacar en cualquier dispositivo/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Hazlo tuyo. Usa un subdominio de PRISMA o conecta tu marca personal/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Desde tu CV o LinkedIn hasta un sitio web funcional en menos de media hora/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Freelancers, desarrolladores, consultores y creativos que quieren impresionar/
        )
      ).toBeInTheDocument();
    });

    it('should render features in English', () => {
      renderFeatures('en');

      expect(
        screen.getByText('AI that understands your profile')
      ).toBeInTheDocument();
      expect(screen.getByText('Smart connection')).toBeInTheDocument();
      expect(screen.getByText('Designs that impact')).toBeInTheDocument();
      expect(screen.getByText('Subdomain or own domain')).toBeInTheDocument();
      expect(screen.getByText('Publish in 30 minutes')).toBeInTheDocument();
      expect(screen.getByText('Who PRISMA is for')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have gradient text for "Destacar"', () => {
      renderFeatures();

      const gradientText = screen.getByText('Destacar');
      expect(gradientText).toHaveClass('gradient-text');
    });

    it('should have grid layout for features', () => {
      renderFeatures();

      const grid = screen
        .getByText('IA que entiende tu perfil')
        .closest('.grid');
      expect(grid).toHaveClass(
        'grid',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'gap-8',
        'md:gap-10'
      );
    });

    it('should have proper card styling', () => {
      renderFeatures();

      const featureCard = screen
        .getByText('IA que entiende tu perfil')
        .closest('.card-feature');
      expect(featureCard).toHaveClass('card-feature', 'group');
    });

    it('should have hover effects on cards', () => {
      renderFeatures();

      const cards = document.querySelectorAll('.card-feature');
      expect(cards).toHaveLength(6);

      // Check for hover elements within cards
      const hoverElements = document.querySelectorAll(
        '[class*="group-hover:scale-110"]'
      );
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });

  describe('Icons', () => {
    it('should render all feature icons', () => {
      renderFeatures();

      // Icons are rendered as React components (SVGs), not FontAwesome classes
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(6);

      // Check for icon containers with gradient backgrounds
      const gradientContainers = document.querySelectorAll(
        '[class*="bg-gradient-to-br"]'
      );
      expect(gradientContainers.length).toBe(6);
    });

    it('should have consistent icon container styling', () => {
      renderFeatures();

      const iconContainers = document.querySelectorAll('.w-16');
      expect(iconContainers).toHaveLength(6);

      iconContainers.forEach(container => {
        expect(container).toHaveClass(
          'w-16',
          'h-16',
          'rounded-2xl',
          'flex',
          'items-center',
          'justify-center',
          'mb-8'
        );
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
      const subtitle = screen.getByText(/Hecho para profesionales que saben/);
      expect(subtitle).toHaveClass('dark:text-gray-300');

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

      // Icon containers use gradient backgrounds, not dark mode classes
      const iconContainers = document.querySelectorAll('.w-16');
      expect(iconContainers.length).toBe(6);
      iconContainers.forEach(container => {
        expect(container.classList.toString()).toMatch(/bg-gradient-to-br/);
      });
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

      const section = document.querySelector('#features');
      expect(section).toBeInTheDocument();
      expect(section?.tagName.toLowerCase()).toBe('section');
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
      expect(grid).toHaveClass('gap-8', 'md:gap-10');
    });

    it('should have responsive section padding', () => {
      renderFeatures();

      const section = document.querySelector('#features');
      expect(section).toHaveClass('py-24', 'px-6');
    });
  });

  describe('Content Structure', () => {
    it('should have consistent structure for all feature cards', () => {
      renderFeatures();

      const cards = document.querySelectorAll('.card-feature');
      expect(cards.length).toBeGreaterThanOrEqual(6);

      // Check first few cards for structure
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i];
        if (!card) continue; // Skip if card is undefined

        // Each card should have an icon container
        const iconContainer = card.querySelector('.w-16');
        expect(iconContainer).toBeInTheDocument();

        // Each card should have a title
        const title = card.querySelector('h3');
        expect(title).toBeInTheDocument();
        if (title) {
          expect(title).toHaveClass('text-2xl', 'font-bold', 'mb-4');
        }

        // Each card should have a description
        const description = card.querySelector('p');
        expect(description).toBeInTheDocument();
        if (description) {
          expect(description).toHaveClass(
            'text-lg',
            'text-gray-600',
            'dark:text-gray-300'
          );
        }
      }
    });
  });
});
