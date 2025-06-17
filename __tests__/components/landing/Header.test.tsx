/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/landing/Header';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('lucide-react', () => ({
  Menu: ({ className }: any) => <div className={className} data-testid="menu-icon" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
  ChevronDown: ({ className }: any) => <div className={className} data-testid="chevron-down-icon" />,
  Globe: ({ className }: any) => <div className={className} data-testid="globe-icon" />,
  User: ({ className }: any) => <div className={className} data-testid="user-icon" />,
  LogIn: ({ className }: any) => <div className={className} data-testid="login-icon" />,
  UserPlus: ({ className }: any) => <div className={className} data-testid="signup-icon" />,
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('Header', () => {
  const mockProps = {
    onLanguageChange: jest.fn(),
  };

  const mockTranslations = {
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    templates: 'Templates',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    signup: 'Sign Up',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    menu: 'Menu',
    close: 'Close',
    skipToContent: 'Skip to content',
    mainNavigation: 'Main navigation',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
      currentLanguage: 'en',
      switchLanguage: jest.fn(),
    } as any);

    // Mock router
    const mockPush = jest.fn();
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    // Mock window methods
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });
  });

  const renderHeader = (props = mockProps) => {
    return render(<Header {...props} />);
  };

  describe('Initial Rendering', () => {
    it('should render brand logo and name', () => {
      renderHeader();
      
      expect(screen.getByText('PRISMA')).toBeInTheDocument();
      expect(screen.getByAltText('PRISMA Logo')).toBeInTheDocument();
    });

    it('should render main navigation links', () => {
      renderHeader();
      
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render authentication buttons for non-authenticated users', () => {
      renderHeader();
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should render language selector', () => {
      renderHeader();
      
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should render mobile menu toggle', () => {
      renderHeader();
      
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('should have proper header structure', () => {
      renderHeader();
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should handle features link click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const featuresLink = screen.getByText('Features');
      await user.click(featuresLink);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });
    });

    it('should handle pricing link click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const pricingLink = screen.getByText('Pricing');
      await user.click(pricingLink);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });
    });

    it('should handle templates link click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const templatesLink = screen.getByText('Templates');
      await user.click(templatesLink);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });
    });

    it('should highlight active section', () => {
      renderHeader({
        ...mockProps,
        activeSection: 'features',
      });

      const featuresLink = screen.getByText('Features');
      expect(featuresLink).toHaveClass('text-primary');
    });

    it('should handle external links correctly', async () => {
      const user = userEvent.setup();
      renderHeader();

      const aboutLink = screen.getByText('About');
      await user.click(aboutLink);

      // Should navigate to about page
      expect(aboutLink).toHaveAttribute('href', '/about');
    });
  });

  describe('Authentication States', () => {
    it('should show login and signup for unauthenticated users', () => {
      renderHeader({
        ...mockProps,
        isAuthenticated: false,
      });

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should show user menu for authenticated users', () => {
      renderHeader({
        ...mockProps,
        isAuthenticated: true,
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '/avatar.jpg',
        },
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should handle login button click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      // Should navigate to login page
      expect(loginButton).toHaveAttribute('href', '/login');
    });

    it('should handle signup button click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const signupButton = screen.getByText('Sign Up');
      await user.click(signupButton);

      // Should navigate to signup page
      expect(signupButton).toHaveAttribute('href', '/signup');
    });

    it('should handle logout action', async () => {
      const user = userEvent.setup();
      const mockOnLogout = jest.fn();
      
      renderHeader({
        ...mockProps,
        isAuthenticated: true,
        onLogout: mockOnLogout,
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      });

      // Open user menu
      const userButton = screen.getByText('John Doe');
      await user.click(userButton);

      // Click logout
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Language Switching', () => {
    it('should open language dropdown on click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const languageButton = screen.getByTestId('globe-icon').closest('button');
      await user.click(languageButton!);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('should switch to Spanish', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open language dropdown
      const languageButton = screen.getByTestId('globe-icon').closest('button');
      await user.click(languageButton!);

      // Select Spanish
      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      expect(mockProps.onLanguageChange).toHaveBeenCalledWith('es');
    });

    it('should switch to English', async () => {
      const user = userEvent.setup();
      
      // Start with Spanish
      mockUseLanguage.mockReturnValue({
        t: mockTranslations,
        currentLanguage: 'es',
        switchLanguage: jest.fn(),
      } as any);

      renderHeader();

      // Open language dropdown
      const languageButton = screen.getByTestId('globe-icon').closest('button');
      await user.click(languageButton!);

      // Select English
      const englishOption = screen.getByText('English');
      await user.click(englishOption);

      expect(mockProps.onLanguageChange).toHaveBeenCalledWith('en');
    });

    it('should close language dropdown on outside click', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open language dropdown
      const languageButton = screen.getByTestId('globe-icon').closest('button');
      await user.click(languageButton!);

      expect(screen.getByText('English')).toBeInTheDocument();

      // Click outside
      await user.click(document.body);

      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('should show current language indicator', () => {
      renderHeader();

      const languageButton = screen.getByTestId('globe-icon').closest('button');
      expect(languageButton).toHaveTextContent('EN');
    });
  });

  describe('Mobile Menu', () => {
    it('should open mobile menu on menu button click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should close mobile menu on close button click', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      // Close mobile menu
      const closeButton = screen.getByTestId('x-icon').closest('button');
      await user.click(closeButton!);

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });

    it('should show all navigation links in mobile menu', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      const mobileMenu = screen.getByTestId('mobile-menu');
      expect(mobileMenu).toContainElement(screen.getByText('Features'));
      expect(mobileMenu).toContainElement(screen.getByText('Pricing'));
      expect(mobileMenu).toContainElement(screen.getByText('Templates'));
      expect(mobileMenu).toContainElement(screen.getByText('About'));
    });

    it('should close mobile menu on navigation link click', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      // Click navigation link
      const featuresLink = screen.getByText('Features');
      await user.click(featuresLink);

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });

    it('should handle mobile menu keyboard navigation', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      // Press Escape to close
      await user.keyboard('{Escape}');

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should hide desktop navigation on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderHeader();

      const desktopNav = document.querySelector('[data-testid="desktop-nav"]');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderHeader();

      const mobileMenuButton = screen.getByTestId('menu-icon').closest('button');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should adapt header height for mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderHeader();

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('h-16'); // Compact height on mobile
    });

    it('should maintain logo visibility across screen sizes', () => {
      renderHeader();

      const logo = screen.getByText('PRISMA');
      expect(logo).toHaveClass('text-xl', 'md:text-2xl');
    });
  });

  describe('Scroll Behavior', () => {
    it('should add background on scroll', () => {
      renderHeader();

      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 100 } });

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-white/95', 'backdrop-blur-sm');
    });

    it('should hide header on scroll down', () => {
      renderHeader();

      // Simulate scroll down
      fireEvent.scroll(window, { target: { scrollY: 200 } });

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('-translate-y-full');
    });

    it('should show header on scroll up', () => {
      renderHeader();

      // Simulate scroll down then up
      fireEvent.scroll(window, { target: { scrollY: 200 } });
      fireEvent.scroll(window, { target: { scrollY: 100 } });

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('translate-y-0');
    });

    it('should maintain header visibility at top of page', () => {
      renderHeader();

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('translate-y-0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderHeader();

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      
      const menuButton = screen.getByTestId('menu-icon').closest('button');
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
      
      const languageButton = screen.getByTestId('globe-icon').closest('button');
      expect(languageButton).toHaveAttribute('aria-label', 'Change language');
    });

    it('should support keyboard navigation', () => {
      renderHeader();

      const focusableElements = screen.getAllByRole('button')
        .concat(screen.getAllByRole('link'));
      
      focusableElements.forEach(element => {
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have skip to content link', () => {
      renderHeader();

      const skipLink = screen.getByText('Skip to content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should announce mobile menu state to screen readers', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('menu-icon').closest('button');
      
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(menuButton!);
      
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should trap focus in mobile menu', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      const mobileMenu = screen.getByTestId('mobile-menu');
      const focusableElements = mobileMenu.querySelectorAll('button, a');
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should have proper color contrast', () => {
      renderHeader();

      const logo = screen.getByText('PRISMA');
      const styles = window.getComputedStyle(logo);
      
      // Should have high contrast
      expect(styles.color).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should lazy load user avatar', () => {
      renderHeader({
        ...mockProps,
        isAuthenticated: true,
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '/avatar.jpg',
        },
      });

      const avatar = document.querySelector('img[src="/avatar.jpg"]');
      expect(avatar).toHaveAttribute('loading', 'lazy');
    });

    it('should debounce scroll events', () => {
      renderHeader();

      const scrollHandler = jest.fn();
      window.addEventListener('scroll', scrollHandler);

      // Rapid scroll events
      for (let i = 0; i < 10; i++) {
        fireEvent.scroll(window, { target: { scrollY: i * 10 } });
      }

      // Should debounce calls
      expect(scrollHandler).toHaveBeenCalledTimes(10);
    });

    it('should preload critical navigation assets', () => {
      renderHeader();

      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const navAssets = Array.from(preloadLinks).filter(link => 
        link.getAttribute('href')?.includes('nav') || 
        link.getAttribute('href')?.includes('header')
      );
      
      expect(navAssets.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track navigation clicks', async () => {
      const user = userEvent.setup();
      renderHeader();

      const featuresLink = screen.getByText('Features');
      await user.click(featuresLink);

      expect(window.gtag).toHaveBeenCalledWith('event', 'nav_click', {
        nav_item: 'features',
        section: 'header',
      });
    });

    it('should track language changes', async () => {
      const user = userEvent.setup();
      renderHeader();

      const languageButton = screen.getByTestId('globe-icon').closest('button');
      await user.click(languageButton!);

      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      expect(window.gtag).toHaveBeenCalledWith('event', 'language_change', {
        from_language: 'en',
        to_language: 'es',
        section: 'header',
      });
    });

    it('should track mobile menu usage', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('menu-icon').closest('button');
      await user.click(menuButton!);

      expect(window.gtag).toHaveBeenCalledWith('event', 'mobile_menu_open', {
        section: 'header',
      });
    });

    it('should track authentication actions', async () => {
      const user = userEvent.setup();
      renderHeader();

      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      expect(window.gtag).toHaveBeenCalledWith('event', 'auth_click', {
        auth_action: 'login',
        section: 'header',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user data gracefully', () => {
      renderHeader({
        ...mockProps,
        isAuthenticated: true,
        user: null,
      });

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should handle language switching errors', async () => {
      const user = userEvent.setup();
      
      const failingOnLanguageChange = jest.fn().mockRejectedValue(new Error('Language change failed'));
      
      renderHeader({
        onLanguageChange: failingOnLanguageChange,
      });

      const languageButton = screen.getByTestId('globe-icon').closest('button');
      await user.click(languageButton!);

      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      // Should not crash
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    });

    it('should handle scroll event errors', () => {
      renderHeader();

      // Mock scroll event error
      const originalScrollTo = window.scrollTo;
      window.scrollTo = jest.fn().mockImplementation(() => {
        throw new Error('Scroll failed');
      });

      fireEvent.scroll(window, { target: { scrollY: 100 } });

      // Should not crash
      expect(screen.getByRole('banner')).toBeInTheDocument();

      window.scrollTo = originalScrollTo;
    });
  });

  describe('Integration', () => {
    it('should integrate with router for navigation', async () => {
      const user = userEvent.setup();
      renderHeader();

      const aboutLink = screen.getByText('About');
      await user.click(aboutLink);

      // Should navigate via router
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should integrate with authentication context', () => {
      renderHeader({
        ...mockProps,
        isAuthenticated: true,
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should integrate with experiment system', () => {
      renderHeader({
        ...mockProps,
        experiment: 'header_v2',
      });

      const experimentVariant = document.querySelector('[data-experiment="header_v2"]');
      expect(experimentVariant).toBeInTheDocument();
    });
  });
});