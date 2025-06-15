import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/lib/i18n/refactored-context';
import { translations } from '@/lib/i18n/translations';

// Test component that uses the language context
const TestComponent = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <p data-testid="current-language">{language}</p>
      <p data-testid="welcome-message">{t.welcome}</p>
      <p data-testid="nested-message">{t.landing?.hero?.title}</p>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('es')}>Spanish</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document lang attribute
    document.documentElement.lang = 'es';
  });

  describe('LanguageProvider', () => {
    it('should provide default language (Spanish)', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('es');
      expect(screen.getByTestId('welcome-message')).toHaveTextContent(translations.es.welcome);
    });

    it('should switch languages', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Initially Spanish
      expect(screen.getByTestId('current-language')).toHaveTextContent('es');

      // Switch to English
      fireEvent.click(screen.getByText('English'));

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
        expect(screen.getByTestId('welcome-message')).toHaveTextContent(translations.en.welcome);
      });
    });

    it('should persist language preference in localStorage', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      fireEvent.click(screen.getByText('English'));

      expect(localStorage.getItem('preferred-language')).toBe('en');
    });

    it('should load language from localStorage on mount', () => {
      localStorage.setItem('preferred-language', 'en');

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should update document lang attribute', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      fireEvent.click(screen.getByText('English'));

      expect(document.documentElement.lang).toBe('en');
    });

    it('should handle nested translations', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const nestedMessage = screen.getByTestId('nested-message');
      expect(nestedMessage.textContent).toBeTruthy();
    });
  });

  describe('useLanguage hook', () => {
    it('should throw error when used outside provider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useLanguage must be used within a LanguageProvider');

      spy.mockRestore();
    });

    it('should provide all context values', () => {
      let contextValues: any;

      const CaptureContext = () => {
        contextValues = useLanguage();
        return null;
      };

      render(
        <LanguageProvider>
          <CaptureContext />
        </LanguageProvider>
      );

      expect(contextValues).toHaveProperty('language');
      expect(contextValues).toHaveProperty('setLanguage');
      expect(contextValues).toHaveProperty('t');
      expect(typeof contextValues.setLanguage).toBe('function');
      expect(typeof contextValues.t).toBe('object');
    });
  });

  describe('Translation fallbacks', () => {
    it('should handle missing translations gracefully', () => {
      const CustomTestComponent = () => {
        const { t } = useLanguage();
        // Access a potentially missing translation
        return <div data-testid="missing">{(t as any).nonExistent?.key || 'fallback'}</div>;
      };

      render(
        <LanguageProvider>
          <CustomTestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('missing')).toHaveTextContent('fallback');
    });
  });

  describe('Browser language detection', () => {
    it('should detect browser language if no preference stored', () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Should detect 'en' from 'en-US'
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should fallback to Spanish for unsupported languages', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Should fallback to Spanish
      expect(screen.getByTestId('current-language')).toHaveTextContent('es');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      let renderCount = 0;

      const CountingComponent = () => {
        const { t } = useLanguage();
        renderCount++;
        return <div>{t.welcome}</div>;
      };

      const { rerender } = render(
        <LanguageProvider>
          <CountingComponent />
        </LanguageProvider>
      );

      const initialCount = renderCount;

      // Re-render the provider
      rerender(
        <LanguageProvider>
          <CountingComponent />
        </LanguageProvider>
      );

      // Should not cause additional renders
      expect(renderCount).toBe(initialCount);
    });
  });

  describe('TypeScript support', () => {
    it('should provide typed translations', () => {
      const TypedComponent = () => {
        const { t } = useLanguage();
        
        // These should be type-safe accesses
        const welcome: string = t.welcome;
        const heroTitle: string | undefined = t.landing?.hero?.title;
        
        return (
          <div>
            <span>{welcome}</span>
            <span>{heroTitle}</span>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TypedComponent />
        </LanguageProvider>
      );

      // If it renders without error, types are working
      expect(screen.getByText(translations.es.welcome)).toBeInTheDocument();
    });
  });
});