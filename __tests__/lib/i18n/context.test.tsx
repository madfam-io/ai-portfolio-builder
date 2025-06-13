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

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('es');
      expect(result.current.t).toBeDefined();
      expect(result.current.t.heroTitle).toBe('Tu portafolio, elevado por IA.');
    });

    it('should load saved language from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('en');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('en');
      expect(result.current.t.heroTitle).toBe(
        'Your portfolio, elevated by AI.'
      );
    });
  });

  describe('Language Switching', () => {
    it('should switch from Spanish to English', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('es');

      await act(async () => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
      expect(result.current.t.heroTitle).toBe(
        'Your portfolio, elevated by AI.'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en');
    });
  });

  describe('Available Languages', () => {
    it('should provide available languages list', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.availableLanguages).toEqual([
        { code: 'es', name: 'Español', flag: '🇲🇽' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
      ]);
    });
  });

  describe('Translation Keys', () => {
    it('should have core translation keys in both languages', async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Check core keys exist in Spanish
      const coreKeys = [
        'heroTitle',
        'heroSubtitle',
        'features',
        'pricing',
        'about',
        'dashboard',
        'signIn',
        'signUp',
        'getStartedFree',
        'viewDemo',
      ];

      // Verify Spanish translations
      coreKeys.forEach(key => {
        expect(result.current.t[key]).toBeDefined();
      });

      // Switch to English
      await act(async () => {
        result.current.setLanguage('en');
      });

      // Verify English translations
      coreKeys.forEach(key => {
        expect(result.current.t[key]).toBeDefined();
      });
    });
  });

  describe('Context Without Provider', () => {
    it('should provide graceful fallback when useLanguage is called outside provider', () => {
      const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const TestComponent = (): void => {
        const { language, t } = useLanguage();
        return (
          <div>
            <div data-testid="fallback-lang">{language}</div>
            <div data-testid="fallback-translation">{t.heroTitle}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('fallback-lang')).toHaveTextContent('es');
      expect(screen.getByTestId('fallback-translation')).toHaveTextContent(
        'Tu portafolio, elevado por IA.'
      );
      expect(mockWarn).toHaveBeenCalledWith(
        'useLanguage called outside LanguageProvider, using fallback'
      );

      mockWarn.mockRestore();
    });
  });

  describe('Component Integration', () => {
    it('should update component when language changes', async () => {
      const TestComponent = (): void => {
        const { t, language, setLanguage } = useLanguage();
        return (
          <div>
            <h1>{t.heroTitle}</h1>
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

      // Initially Spanish
      expect(screen.getByRole('heading')).toHaveTextContent(
        'Tu portafolio, elevado por IA.'
      );

      // Click to switch to English
      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent(
          'Your portfolio, elevated by AI.'
        );
      });
    });
  });
});
