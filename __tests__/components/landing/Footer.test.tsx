import React from 'react';
import { render, screen } from '@testing-library/react';

import Footer from '@/components/landing/Footer';
import { LanguageProvider } from '@/lib/i18n/refactored-context';
import { getCurrentYear } from '@/lib/utils/date';

// Mock the date utils
jest.mock('@/lib/utils/date', () => ({
  getCurrentYear: jest.fn(),
}));

// Mock localStorage to ensure Spanish is the default language
const localStorageMock = {
  getItem: jest.fn(() => 'es'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock navigator.language to return Spanish
Object.defineProperty(window.navigator, 'language', {
  value: 'es-ES',
  configurable: true,
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider initialLanguage="es">{component}</LanguageProvider>
  );
};

describe('Footer', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should render with dynamic current year', () => {
    // Mock the current year to be 2025
    (getCurrentYear as jest.Mock).mockReturnValue(2025);

    renderWithProvider(<Footer />);

    // Check that copyright contains the mocked year
    const copyright = screen.getByText(/© 2025 PRISMA by MADFAM/i);
    expect(copyright).toBeInTheDocument();
  });

  it('should update year dynamically', () => {
    // Mock the current year to be 2026
    (getCurrentYear as jest.Mock).mockReturnValue(2026);

    renderWithProvider(<Footer />);

    // Check that copyright contains the new year
    const copyright = screen.getByText(/© 2026 PRISMA by MADFAM/i);
    expect(copyright).toBeInTheDocument();
  });

  it('should render all footer sections', () => {
    (getCurrentYear as jest.Mock).mockReturnValue(2025);

    renderWithProvider(<Footer />);

    // Check main sections are present
    expect(screen.getByText('PRISMA')).toBeInTheDocument();
    expect(screen.getByText('by MADFAM')).toBeInTheDocument();

    // Check footer links are present (in Spanish by default)
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Empresa')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('should have proper social media links', () => {
    (getCurrentYear as jest.Mock).mockReturnValue(2025);

    renderWithProvider(<Footer />);

    // Check social media links
    const twitterLink = screen.getByLabelText('Follow PRISMA on Twitter');
    expect(twitterLink).toHaveAttribute(
      'href',
      'https://twitter.com/prisma_ai'
    );

    const linkedinLink = screen.getByLabelText('Follow PRISMA on LinkedIn');
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://linkedin.com/company/prisma-by-madfam'
    );

    const githubLink = screen.getByLabelText('View PRISMA on GitHub');
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/aldoruizluna/ai-portfolio-builder'
    );
  });
});
