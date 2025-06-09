import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/landing/Header';
import { LanguageProvider } from '@/lib/i18n/minimal-context';
import { AppProvider } from '@/lib/contexts/AppContext';
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
      <AppProvider>
        <LanguageProvider>
          <Header />
        </LanguageProvider>
      </AppProvider>
    );
  };

  describe('Rendering', () => {
    it('should render the logo and brand name', () => {
      renderHeader();

      expect(screen.getByText('PRISMA')).toBeInTheDocument();
      expect(screen.getByText('by MADFAM')).toBeInTheDocument();
      expect(screen.getByAltText('PRISMA Logo')).toBeInTheDocument();
    });

    it('should render navigation links in Spanish by default', () => {
      renderHeader();

      expect(screen.getAllByText('Características')).toHaveLength(2); // Desktop and mobile
      expect(screen.getAllByText('Cómo Funciona')).toHaveLength(2);
      expect(screen.getAllByText('Plantillas')).toHaveLength(2);
      expect(screen.getAllByText('Precios')).toHaveLength(2);
      expect(screen.getAllByText('About')).toHaveLength(2);
    });

    it('should render CTA button in Spanish by default', () => {
      renderHeader();

      const ctaButtons = screen.getAllByRole('link', { name: 'Comenzar' });
      expect(ctaButtons.length).toBeGreaterThan(0);
      ctaButtons.forEach(button => {
        expect(button).toHaveAttribute('href', '/dashboard');
      });
    });

    it('should render utility buttons', () => {
      renderHeader();

      // Currency toggle - looking for MXN since that's the default
      expect(screen.getAllByText('MXN')).toHaveLength(1); // Only desktop visible in test
      
      // Language toggle
      expect(screen.getAllByText('ES')).toHaveLength(1);
      expect(screen.getAllByText('🇲🇽')).toHaveLength(1);
      
      // Dark mode toggle - look for moon/sun icons
      const darkModeToggles = document.querySelectorAll('svg');
      expect(darkModeToggles.length).toBeGreaterThan(0);
    });

    it('should render mobile menu button', () => {
      renderHeader();

      // Look for the mobile menu container with md:hidden class
      const mobileMenuContainer = document.querySelector('.md\\:hidden');
      expect(mobileMenuContainer).toBeInTheDocument();
      
      // Look for bars icon (mobile menu button)
      const barsIcon = document.querySelector('.fa-bars');
      expect(barsIcon).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('should switch to English when language toggle is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Initially in Spanish
      expect(screen.getAllByText('Características')).toHaveLength(2);
      expect(screen.getAllByText('ES')).toHaveLength(2);

      // Click language toggle - look for button with title containing "English"
      const langToggle = screen.getByTitle(/English/);
      await user.click(langToggle);

      // Should switch to English
      await waitFor(() => {
        expect(screen.getAllByText('Features')).toHaveLength(2);
        expect(screen.getAllByText('EN')).toHaveLength(2);
      });
    });

    it('should switch back to Spanish from English', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue('en');
      renderHeader();

      // Initially in English
      expect(screen.getAllByText('Features')).toHaveLength(2);
      expect(screen.getAllByText('EN')).toHaveLength(2);

      // Click language toggle - look for button with title containing "Español"
      const langToggle = screen.getByTitle(/Español/);
      await user.click(langToggle);

      // Should switch to Spanish
      await waitFor(() => {
        expect(screen.getAllByText('Características')).toHaveLength(2);
        expect(screen.getAllByText('ES')).toHaveLength(2);
      });
    });

    it('should switch language from mobile menu', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Click mobile menu toggle to open menu - look for bars icon
      const mobileMenuToggle = document.querySelector('.fa-bars')?.closest('button');
      if (!mobileMenuToggle) throw new Error('Mobile menu toggle not found');
      await user.click(mobileMenuToggle as HTMLElement);

      // Click mobile language toggle
      const langToggles = screen.getAllByTitle(/English/);
      const mobileToggle = langToggles[1];
      if (!mobileToggle) throw new Error('Mobile language toggle not found');
      await user.click(mobileToggle); // Mobile toggle

      // Should switch to English
      await waitFor(() => {
        expect(screen.getAllByText('Features')).toHaveLength(2);
      });
    });
  });

  describe('Navigation Behavior', () => {
    it('should show anchor links on landing page', () => {
      renderHeader('/');

      const featuresLinks = screen.getAllByRole('link', { name: 'Características' });
      featuresLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '#features');
      });

      const howItWorksLinks = screen.getAllByRole('link', { name: 'Cómo Funciona' });
      howItWorksLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '#how-it-works');
      });

      const templatesLinks = screen.getAllByRole('link', { name: 'Plantillas' });
      templatesLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '#templates');
      });

      const pricingLinks = screen.getAllByRole('link', { name: 'Precios' });
      pricingLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '#pricing');
      });
    });

    it('should show page links on non-landing pages', () => {
      renderHeader('/dashboard');

      const dashboardLinks = screen.getAllByRole('link', { name: 'Dashboard' });
      expect(dashboardLinks.length).toBeGreaterThan(0);
      dashboardLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/dashboard');
        // Check if any dashboard link has active state
        const hasActiveState = dashboardLinks.some(l => l.classList.contains('text-purple-600'));
        expect(hasActiveState).toBe(true);
      });

      const editorLinks = screen.getAllByRole('link', { name: 'Editor' });
      expect(editorLinks.length).toBeGreaterThan(0);
      editorLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/editor');
      });

      const aboutLinks = screen.getAllByRole('link', { name: 'About' });
      expect(aboutLinks.length).toBeGreaterThan(0);
      aboutLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/about');
      });
    });

    it('should highlight active page', () => {
      renderHeader('/editor');

      const editorLinks = screen.getAllByRole('link', { name: 'Editor' });
      expect(editorLinks.length).toBeGreaterThan(0);
      // Check if any editor link has active state
      const hasActiveState = editorLinks.some(l => l.classList.contains('text-purple-600'));
      expect(hasActiveState).toBe(true);

      const dashboardLinks = screen.getAllByRole('link', { name: 'Dashboard' });
      expect(dashboardLinks.length).toBeGreaterThan(0);
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

      // Find the desktop navigation container (not mobile)
      const navItems = screen.getAllByText('Características');
      const desktopNav = navItems[0]?.closest('.hidden');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      renderHeader();

      const mobileMenuContainer = document.querySelector('.md\\:hidden');
      expect(mobileMenuContainer).toBeInTheDocument();
    });

    it('should initially hide mobile menu content', () => {
      renderHeader();

      const mobileMenu = document.querySelector('.hidden');
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderHeader();

      // Logo link should have proper navigation
      const logoLink = screen.getByRole('link', { name: /PRISMA/i });
      expect(logoLink).toHaveAttribute('href', '/');

      // Language toggle should have title
      const langToggles = screen.getAllByTitle(/English/);
      expect(langToggles.length).toBeGreaterThan(0);
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
      
      expect(navLinks.length).toBeGreaterThan(0);
      // Check that at least some nav links have dark mode classes
      const hasDarkModeClasses = navLinks.some(link => 
        link.classList.contains('dark:text-gray-300')
      );
      expect(hasDarkModeClasses).toBe(true);
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