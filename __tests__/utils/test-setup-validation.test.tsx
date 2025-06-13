import React from 'react';

import { render, screen } from './comprehensive-test-setup';

/**
 * Test to validate our comprehensive test setup works correctly
 */

describe('Test Setup Validation', () => {
  test('language provider provides Spanish translations by default', () => {
    const TestComponent = (): void => {
      const { useLanguage } = require('@/lib/i18n/refactored-context');
      const { t } = useLanguage();
      return <div>{t.heroTitle}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('Convierte tu CV en un')).toBeInTheDocument();
  });

  test('language provider can switch to English', () => {
    const TestComponent = (): void => {
      const { useLanguage } = require('@/lib/i18n/refactored-context');
      const { t } = useLanguage();
      return <div>{t.heroTitle}</div>;
    };

    render(<TestComponent />, { initialLanguage: 'en' });
    expect(screen.getByText('Turn Your CV Into a')).toBeInTheDocument();
  });

  test('app context is properly mocked', () => {
    const TestComponent = (): void => {
      const { useApp } = require('@/lib/contexts/AppContext');
      const { isDarkMode, currency } = useApp();
      return (
        <div>
          <span>Dark: {isDarkMode ? 'yes' : 'no'}</span>
          <span>Currency: {currency}</span>
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByText('Dark: no')).toBeInTheDocument();
    expect(screen.getByText('Currency: MXN')).toBeInTheDocument();
  });
});
