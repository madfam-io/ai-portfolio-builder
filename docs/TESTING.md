# Testing Guide

This document provides comprehensive guidelines for testing the MADFAM AI Portfolio Builder application.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Testing Tools](#testing-tools)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Coverage](#test-coverage)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

## Overview

Our testing strategy ensures code quality, reliability, and maintainability through comprehensive unit tests, integration tests, and end-to-end tests.

### Testing Philosophy

- **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
- **Comprehensive Coverage**: Aim for 80%+ code coverage
- **Fast Feedback**: Tests should run quickly to encourage frequent execution
- **Clear Failure Messages**: Tests should clearly indicate what went wrong
- **Maintainable Tests**: Tests should be easy to understand and update

## Test Structure

```
__tests__/
├── app/                    # Page component tests
│   └── page.test.tsx      # Home page tests
├── components/            # Component unit tests
│   └── landing/          # Landing page component tests
│       ├── Header.test.tsx
│       ├── Hero.test.tsx
│       ├── Features.test.tsx
│       └── Pricing.test.tsx
├── lib/                   # Library tests
│   ├── auth/             # Authentication tests
│   │   └── auth.test.ts
│   └── i18n/             # Internationalization tests
│       └── simple-context.test.tsx
└── utils/                 # Test utilities
    └── test-utils.tsx    # Custom render functions and mocks

e2e/                      # End-to-end tests
├── landing-page.spec.ts  # Landing page E2E tests
├── setup/               # E2E test setup
└── utils/              # E2E test utilities
```

## Testing Tools

### Unit & Integration Testing

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **MSW (Mock Service Worker)**: API mocking (when implemented)

### End-to-End Testing

- **Playwright**: Cross-browser E2E testing
- **Multiple Browsers**: Chrome, Firefox, Safari (WebKit)
- **Mobile Testing**: Mobile viewport testing

### Configuration Files

- `jest.config.js`: Jest configuration
- `jest.setup.js`: Test environment setup
- `playwright.config.ts`: Playwright E2E configuration

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test Header.test.tsx

# Run tests matching pattern
pnpm test --testNamePattern="should render"
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run specific E2E test
pnpm test:e2e landing-page.spec.ts

# Debug E2E tests
pnpm test:e2e --debug
```

### Linting & Type Checking

```bash
# Run linter
pnpm lint

# Run type checking
pnpm type-check

# Format code
pnpm format
```

## Writing Tests

### Component Tests

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '@/components/ComponentName';
import { LanguageProvider } from '@/lib/i18n/simple-context';

describe('ComponentName', () => {
  const renderComponent = (props = {}) => {
    return render(
      <LanguageProvider>
        <ComponentName {...props} />
      </LanguageProvider>
    );
  };

  describe('Rendering', () => {
    it('should render correctly', () => {
      renderComponent();
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      renderComponent({ onClick: handleClick });
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderComponent();
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
```

### Testing Patterns

#### 1. Testing i18n Components

```typescript
describe('Internationalization', () => {
  it('should render in Spanish by default', () => {
    render(
      <LanguageProvider>
        <Component />
      </LanguageProvider>
    );
    
    expect(screen.getByText('Texto en español')).toBeInTheDocument();
  });

  it('should render in English when language is set', () => {
    localStorageMock.getItem.mockReturnValue('en');
    
    render(
      <LanguageProvider>
        <Component />
      </LanguageProvider>
    );
    
    expect(screen.getByText('English text')).toBeInTheDocument();
  });
});
```

#### 2. Testing Dark Mode

```typescript
describe('Dark Mode Support', () => {
  it('should have dark mode classes', () => {
    render(<Component />);
    
    const element = screen.getByRole('main');
    expect(element).toHaveClass('dark:bg-gray-900');
  });
});
```

#### 3. Testing Responsive Design

```typescript
describe('Responsive Design', () => {
  it('should have responsive classes', () => {
    render(<Component />);
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
  });
});
```

#### 4. Testing API Calls (Future)

```typescript
describe('API Integration', () => {
  it('should fetch data on mount', async () => {
    const mockData = { id: 1, name: 'Test' };
    server.use(
      rest.get('/api/data', (req, res, ctx) => {
        return res(ctx.json(mockData));
      })
    );
    
    render(<Component />);
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should switch language', async ({ page }) => {
    // Check initial Spanish content
    await expect(page.getByText('Características')).toBeVisible();
    
    // Click language toggle
    await page.getByText('ES').click();
    
    // Check English content
    await expect(page.getByText('Features')).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: 'Comenzar' }).click();
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Test Coverage

### Current Coverage Goals

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage by Module

| Module | Coverage | Priority |
|--------|----------|----------|
| Components | 85%+ | High |
| Pages | 80%+ | High |
| i18n | 95%+ | High |
| Auth | 90%+ | High |
| Utils | 80%+ | Medium |
| Hooks | 80%+ | Medium |

## Best Practices

### 1. Test Organization

- **Group related tests**: Use `describe` blocks
- **Clear test names**: Describe what is being tested
- **Setup and teardown**: Use `beforeEach` and `afterEach`
- **Avoid test interdependence**: Each test should be independent

### 2. Assertions

- **Use specific matchers**: `toBeInTheDocument()` over `toBeTruthy()`
- **Test user-facing behavior**: Focus on what users see/interact with
- **Avoid implementation details**: Don't test internal state or methods
- **Multiple assertions**: Keep related assertions in the same test

### 3. Mocking

- **Mock external dependencies**: localStorage, APIs, etc.
- **Reset mocks**: Clear mocks between tests
- **Avoid over-mocking**: Don't mock what you're testing
- **Use realistic data**: Mock data should resemble production data

### 4. Performance

- **Fast tests**: Keep individual tests under 100ms
- **Minimize setup**: Share expensive setup when possible
- **Parallel execution**: Tests should run in parallel
- **Avoid setTimeout**: Use `waitFor` for async operations

### 5. Maintenance

- **Update tests with code**: Keep tests in sync with implementation
- **Remove obsolete tests**: Delete tests for removed features
- **Refactor tests**: Apply same quality standards as production code
- **Document complex tests**: Add comments for non-obvious test logic

## CI/CD Integration

### GitHub Actions

Our tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

### Pre-commit Hooks

```bash
# Install pre-commit hooks
pnpm prepare

# Hooks run:
- Linting
- Type checking
- Unit tests for changed files
```

### Test Requirements for Merge

- All tests must pass
- Coverage thresholds must be met
- No linting errors
- No TypeScript errors

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**
   - Check Node.js version
   - Clear Jest cache: `pnpm test --clearCache`
   - Check environment variables

2. **Flaky tests**
   - Add proper `waitFor` statements
   - Increase timeout for slow operations
   - Mock time-dependent functions

3. **Coverage not updating**
   - Clear coverage data: `rm -rf coverage`
   - Run with `--no-cache` flag
   - Check jest.config.js settings

### Debug Commands

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test

# Verbose output
pnpm test --verbose

# Show test coverage for specific files
pnpm test:coverage --collectCoverageFrom='src/components/**/*.tsx'
```

## Future Improvements

1. **Visual Regression Testing**: Implement screenshot comparison
2. **Performance Testing**: Add metrics for component render times
3. **Accessibility Testing**: Automated a11y checks
4. **API Contract Testing**: Validate API responses
5. **Load Testing**: Test application under load
6. **Security Testing**: Automated security scans

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)