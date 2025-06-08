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
      expect(screen.getByText('Powerful Features')).toBeInTheDocument();
    });

    it('should render section title in English', () => {
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

      expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Business' })).toBeInTheDocument();
    });

    it('should render pricing for each plan', () => {
      renderPricing();

      const prices = document.querySelectorAll('[data-price]');
      expect(prices).toHaveLength(3);
      
      expect(prices[0]).toHaveAttribute('data-price', '0');
      expect(prices[0]).toHaveTextContent('0');
      
      expect(prices[1]).toHaveAttribute('data-price', '19');
      expect(prices[1]).toHaveTextContent('$340');
      
      expect(prices[2]).toHaveAttribute('data-price', '49');
      expect(prices[2]).toHaveTextContent('$875');
    });

    it('should render "Most Popular" badge on Pro plan', () => {
      renderPricing();

      expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
    });
  });

  describe('Feature Lists', () => {
    it('should render features for Free plan', () => {
      renderPricing();

      expect(screen.getByText('1 portfolio')).toBeInTheDocument();
      expect(screen.getByText('Basic templates')).toBeInTheDocument();
      expect(screen.getByText('MADFAM subdomain')).toBeInTheDocument();
      expect(screen.getByText('3 AI rewrites/month')).toBeInTheDocument();
    });

    it('should render features for Pro plan', () => {
      renderPricing();

      expect(screen.getByText('3 portfolios')).toBeInTheDocument();
      expect(screen.getByText('All templates')).toBeInTheDocument();
      expect(screen.getByText('Custom domain')).toBeInTheDocument();
      expect(screen.getByText('Unlimited AI rewrites')).toBeInTheDocument();
      expect(screen.getByText('Analytics & SEO tools')).toBeInTheDocument();
    });

    it('should render features for Business plan', () => {
      renderPricing();

      expect(screen.getByText('Unlimited portfolios')).toBeInTheDocument();
      expect(screen.getByText('White-label option')).toBeInTheDocument();
      expect(screen.getByText('API access')).toBeInTheDocument();
      expect(screen.getByText('Team collaboration')).toBeInTheDocument();
      expect(screen.getByText('Priority support')).toBeInTheDocument();
    });

    it('should render check icons for all features', () => {
      renderPricing();

      const checkIcons = document.querySelectorAll('.fa-check');
      expect(checkIcons.length).toBeGreaterThanOrEqual(14); // All feature items
    });
  });

  describe('CTA Buttons', () => {
    it('should render correct CTA buttons', () => {
      renderPricing();

      expect(screen.getByRole('button', { name: 'Start Free' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Pro Trial' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contact Sales' })).toBeInTheDocument();
    });

    it('should have different button styles for each plan', () => {
      renderPricing();

      const freeButton = screen.getByRole('button', { name: 'Start Free' });
      expect(freeButton).toHaveClass('border-2', 'border-purple-600', 'text-purple-600');

      const proButton = screen.getByRole('button', { name: 'Start Pro Trial' });
      expect(proButton).toHaveClass('bg-white', 'text-purple-600');

      const businessButton = screen.getByRole('button', { name: 'Contact Sales' });
      expect(businessButton).toHaveClass('border-2', 'border-purple-600', 'text-purple-600');
    });

    it('should have hover effects on buttons', () => {
      renderPricing();

      const freeButton = screen.getByRole('button', { name: 'Start Free' });
      expect(freeButton).toHaveClass('hover:bg-purple-50');

      const proButton = screen.getByRole('button', { name: 'Start Pro Trial' });
      expect(proButton).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Styling and Layout', () => {
    it('should have gradient text for "Powerful Features"', () => {
      renderPricing();

      const gradientText = screen.getByText('Powerful Features');
      expect(gradientText).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-blue-600', 'bg-clip-text', 'text-transparent');
    });

    it('should have grid layout for pricing cards', () => {
      renderPricing();

      const grid = screen.getByRole('heading', { name: 'Free' }).closest('.grid');
      expect(grid).toHaveClass('grid', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'md:gap-8');
    });

    it('should have elevated Pro plan card', () => {
      renderPricing();

      const proCard = screen.getByText('MOST POPULAR').closest('div.bg-purple-600');
      expect(proCard).toHaveClass('transform', 'scale-105');
    });

    it('should have different background for Pro plan', () => {
      renderPricing();

      const proCard = screen.getByText('MOST POPULAR').closest('div');
      expect(proCard).toHaveClass('bg-purple-600', 'text-white');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for section', () => {
      renderPricing();

      const section = screen.getByRole('region');
      expect(section).toHaveClass('dark:bg-gray-800');
    });

    it('should have dark mode classes for cards', () => {
      renderPricing();

      const freeCard = screen.getByRole('heading', { name: 'Free' }).closest('div');
      expect(freeCard).toHaveClass('dark:bg-gray-700');

      const businessCard = screen.getByRole('heading', { name: 'Business' }).closest('div');
      expect(businessCard).toHaveClass('dark:bg-gray-700');
    });

    it('should have dark mode text colors', () => {
      renderPricing();

      const headings = [
        screen.getByRole('heading', { name: 'Free' }),
        screen.getByRole('heading', { name: 'Business' })
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

      const section = screen.getByRole('region');
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

      const section = screen.getByRole('region');
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

      const monthLabels = screen.getAllByText('/month');
      expect(monthLabels).toHaveLength(3);
    });
  });
});