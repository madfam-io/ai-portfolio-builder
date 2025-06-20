import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n'; '@/__tests__/utils/mock-i18n';
import React from 'react';
(<Header />);
  };

  describe('Initial Rendering', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

    it('should render brand logo and name', async () => {
      renderHeader();

      expect(screen.getByText('PRISMA')).toBeInTheDocument();
      expect(screen.getByAltText('PRISMA Logo')).toBeInTheDocument();
    });

    it('should render main navigation links', async () => {
      renderHeader();

      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render authentication buttons for non-authenticated users', async () => {
      renderHeader();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should render language selector', async () => {
      renderHeader();

      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });
  });

  describe('Authentication States', () => {
    it('should show login and signup for unauthenticated users', async () => {
      renderHeader();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should show user menu for authenticated users', async () => {
      const user = userEvent.setup();

      // Mock authenticated user
      mockUseAuth.mockReturnValue({
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        loading: false,
        signOut: mockSignOut,
      });

      renderHeader();

      // User name should be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Click user menu to open dropdown
      const userButton = screen.getByText('John Doe');
      await user.click(userButton);

      // Check dropdown options
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getByText('Quick Start')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should handle dark mode toggle', async () => {
      const user = userEvent.setup();
      renderHeader();

      const darkModeButton = screen
        .getByTestId('lucide-moon')
        .closest('button');
      await user.click(darkModeButton!);

      expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should show sun icon when in dark mode', async () => {
      // Mock dark mode enabled
      mockUseApp.mockReturnValue({
        isDarkMode: true,
        currency: 'USD',
        toggleDarkMode: mockToggleDarkMode,
        setCurrency: mockSetCurrency,
        isMobileMenuOpen: false,
        setMobileMenuOpen: mockSetMobileMenuOpen,
      });

      renderHeader();

      // Should show sun icon when in dark mode
      expect(screen.getByTestId('lucide-sun')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should open mobile menu on menu button click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByTestId('lucide-menu').closest('button');
      await user.click(menuButton!);

      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(true);
    });

    it('should show close icon when mobile menu is open', async () => {
      // Mock mobile menu open state
      mockUseApp.mockReturnValue({
        isDarkMode: false,
        currency: 'USD',
        toggleDarkMode: mockToggleDarkMode,
        setCurrency: mockSetCurrency,
        isMobileMenuOpen: true,
        setMobileMenuOpen: mockSetMobileMenuOpen,
      });

      renderHeader();

      expect(screen.getByTestId('lucide-x')).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('should show language toggle with current language', async () => {
      renderHeader();

      // Should show current language code
      expect(screen.getByText('EN')).toBeInTheDocument();

      // Should show flag icon
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('should show correct language toggle title', async () => {
      renderHeader();

      const languageButton = screen.getByText('EN').closest('button');
      expect(languageButton).toHaveAttribute('title', 'Switch to Español');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user data gracefully', async () => {
      // Mock authenticated state but null user (edge case)
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signOut: mockSignOut,
      });

      renderHeader();

      // Should show unauthenticated state
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should handle loading state gracefully', async () => {
      // Mock loading state
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        signOut: mockSignOut,
      });

      renderHeader();

      // Should show loading state in auth section
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });
  });
});
