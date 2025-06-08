import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/landing/Header';
import { LanguageProvider } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock console to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
});

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  const renderHeader = (pathname = '/') => {
    (usePathname as jest.Mock).mockReturnValue(pathname);
    return render(
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    );
  };

  describe('Rendering', () => {
    it('should render the logo and brand name', () => {
      renderHeader();

      expect(screen.getByText(/MADFAM/)).toBeInTheDocument();
      expect(screen.getByText('.').closest('span')).toHaveClass('text-purple-600');
      expect(screen.getByText(/AI/)).toBeInTheDocument();
    });

    it('should render navigation links in Spanish by default', () => {
      renderHeader();

      expect(screen.getByText('Características')).toBeInTheDocument();
      expect(screen.getByText('Cómo Funciona')).toBeInTheDocument();
      expect(screen.getByText('Plantillas')).toBeInTheDocument();
      expect(screen.getByText('Precios')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render CTA button in Spanish by default', () => {
      renderHeader();

      const ctaButton = screen.getByRole('link', { name: 'Comenzar' });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', '/dashboard');
    });

    it('should render utility buttons', () => {
      renderHeader();

      // Currency toggle
      expect(screen.getByText('USD')).toBeInTheDocument();
      
      // Language toggle
      expect(screen.getByText('ES')).toBeInTheDocument();
      expect(screen.getByText('🇪🇸')).toBeInTheDocument();
      
      // Dark mode toggle
      const darkModeToggle = document.querySelector('[data-dark-mode-toggle]');
      expect(darkModeToggle).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      renderHeader();

      const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton?.closest('div')).toHaveClass('md:hidden');
    });
  });

  describe('Language Switching', () => {
    it('should switch to English when language toggle is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Initially in Spanish
      expect(screen.getByText('Características')).toBeInTheDocument();
      expect(screen.getByText('ES')).toBeInTheDocument();

      // Click language toggle
      const langToggle = screen.getByTitle('Switch to English');
      await user.click(langToggle);

      // Should switch to English
      await waitFor(() => {
        expect(screen.getByText('Features')).toBeInTheDocument();
        expect(screen.getByText('EN')).toBeInTheDocument();
      });
    });

    it('should switch back to Spanish from English', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue('en');
      renderHeader();

      // Initially in English
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();

      // Click language toggle
      const langToggle = screen.getByTitle('Switch to Español');
      await user.click(langToggle);

      // Should switch to Spanish
      await waitFor(() => {
        expect(screen.getByText('Características')).toBeInTheDocument();
        expect(screen.getByText('ES')).toBeInTheDocument();
      });
    });

    it('should switch language from mobile menu', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Click mobile menu toggle to open menu
      const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]') as HTMLElement;
      await user.click(mobileMenuToggle);

      // Click mobile language toggle
      const mobileLangToggle = screen.getByTitle('Switch to English');
      await user.click(mobileLangToggle);

      // Should switch to English
      await waitFor(() => {
        expect(screen.getByText('Features')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Behavior', () => {
    it('should show anchor links on landing page', () => {
      renderHeader('/');

      const featuresLink = screen.getByRole('link', { name: 'Características' });
      expect(featuresLink).toHaveAttribute('href', '#features');

      const howItWorksLink = screen.getByRole('link', { name: 'Cómo Funciona' });
      expect(howItWorksLink).toHaveAttribute('href', '#how-it-works');

      const templatesLink = screen.getByRole('link', { name: 'Plantillas' });
      expect(templatesLink).toHaveAttribute('href', '#templates');

      const pricingLink = screen.getByRole('link', { name: 'Precios' });
      expect(pricingLink).toHaveAttribute('href', '#pricing');
    });

    it('should show page links on non-landing pages', () => {
      renderHeader('/dashboard');

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(dashboardLink).toHaveClass('text-purple-600'); // Active state

      const editorLink = screen.getByRole('link', { name: 'Editor' });
      expect(editorLink).toHaveAttribute('href', '/editor');
      expect(editorLink).not.toHaveClass('text-purple-600');

      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should highlight active page', () => {
      renderHeader('/editor');

      const editorLink = screen.getByRole('link', { name: 'Editor' });
      expect(editorLink).toHaveClass('text-purple-600');

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).not.toHaveClass('text-purple-600');
    });

    it('should show Dashboard button instead of Get Started on non-landing pages', () => {
      renderHeader('/about');

      // Should not have "Get Started" button
      expect(screen.queryByRole('link', { name: 'Comenzar' })).not.toBeInTheDocument();

      // Should have "Dashboard" button
      const dashboardButtons = screen.getAllByRole('link', { name: 'Dashboard' });
      expect(dashboardButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide desktop navigation on mobile', () => {
      renderHeader();

      const desktopNav = screen.getByText('Características').closest('div');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      renderHeader();

      const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
      expect(mobileMenuButton?.closest('div')).toHaveClass('md:hidden');
    });

    it('should initially hide mobile menu content', () => {
      renderHeader();

      const mobileMenu = document.querySelector('[data-mobile-menu]');
      expect(mobileMenu).toHaveStyle({ display: 'none' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderHeader();

      // Logo link should have proper navigation
      const logoLink = screen.getByRole('link', { name: /MADFAM.*AI/i });
      expect(logoLink).toHaveAttribute('href', '/');

      // Language toggle should have title
      const langToggle = screen.getByTitle('Switch to English');
      expect(langToggle).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Tab through navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '/');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '#features');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '#how-it-works');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      renderHeader();

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('dark:bg-gray-800');

      const navLinks = screen.getAllByRole('link').filter(link => 
        link.textContent?.includes('Características') ||
        link.textContent?.includes('Cómo Funciona')
      );
      
      navLinks.forEach(link => {
        expect(link).toHaveClass('dark:text-gray-300');
      });
    });
  });

  describe('Fixed Positioning', () => {
    it('should have fixed positioning classes', () => {
      renderHeader();

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('fixed', 'w-full', 'top-0', 'z-50');
    });
  });
});