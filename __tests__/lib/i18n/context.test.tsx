import React from 'react';
import {
  render,
  screen,
  act,
  renderHook,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '@/lib/i18n/refactored-context';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  value: 'es-ES',
  writable: true,
  configurable: true,
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
});

describe('LanguageProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.lang = '';
  });

  describe('Initialization', () => {
    it('should initialize with Spanish as default language', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      // Wait for useEffect to run
      await waitFor(() => {
        expect(result.current.language).toBe('es');
        expect(result.current.t.features).toBe('Características');
      });
    });

    it('should load saved language from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('en');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('language');
        expect(result.current.language).toBe('en');
        expect(result.current.t.features).toBe('Features');
      });
    });

    it('should use default language when no saved language', async () => {
      // PRISMA defaults to Spanish for Mexican market focus
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.language).toBe('es');
        // Should use Spanish by default for PRISMA's target market
      });
    });

    it('should default to Spanish for non-English browser languages', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.language).toBe('es');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'es');
      });
    });

    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.language).toBe('es');
        // Note: The context gracefully handles localStorage errors and falls back to default language
      });
    });
  });

  describe('Language Switching', () => {
    it('should switch from Spanish to English', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.language).toBe('es');
      });

      await act(async () => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
      expect(result.current.t.features).toBe('Features');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en');
    });

    it('should switch from English to Spanish', async () => {
      localStorageMock.getItem.mockReturnValue('en');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });

      await act(async () => {
        result.current.setLanguage('es');
      });

      expect(result.current.language).toBe('es');
      expect(result.current.t.features).toBe('Características');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'es');
    });
  });

  describe('Available Languages', () => {
    it('should provide available languages list', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.availableLanguages).toEqual([
          { code: 'es', name: 'Español', flag: '🇲🇽' },
          { code: 'en', name: 'English', flag: '🇺🇸' },
        ]);
      });
    });
  });

  describe('Translation Keys', () => {
    it('should have all translation keys in both languages', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.t).toBeDefined();
      });

      // Get Spanish translations
      const spanishKeys = Object.keys(result.current.t);

      // Switch to English
      await act(async () => {
        result.current.setLanguage('en');
      });

      // Get English translations
      const englishKeys = Object.keys(result.current.t);

      // Verify both languages have the same keys
      expect(spanishKeys.sort()).toEqual(englishKeys.sort());
    });
  });

  describe('Context Without Provider', () => {
    it('should provide graceful fallback when useLanguage is called outside provider', () => {
      // Mock console.warn to suppress warning output in test
      const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const TestComponent = () => {
        const { language } = useLanguage();
        return <div data-testid="fallback-lang">{language}</div>;
      };

      render(<TestComponent />);

      // Should provide fallback values instead of throwing
      expect(screen.getByTestId('fallback-lang')).toHaveTextContent('es');

      mockWarn.mockRestore();
    });
  });

  describe('Component Integration', () => {
    it('should update component when language changes', async () => {
      const TestComponent = () => {
        const { t, language, setLanguage } = useLanguage();
        return (
          <div>
            <h1>{t.heroTitle}</h1>
            <p data-testid="current-lang">{language}</p>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            >
              Toggle Language
            </button>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent(
          'Tu portafolio, elevado por IA.'
        );
        expect(screen.getByTestId('current-lang')).toHaveTextContent('es');
      });

      const toggleButton = screen.getByRole('button');
      await userEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent(
          'Your portfolio, elevated by AI.'
        );
        expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
      });
    });
  });
});
