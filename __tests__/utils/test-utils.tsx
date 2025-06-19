import React, { ReactElement } from 'react';
import { ThemeProvider } from 'next-themes';
import { render, RenderOptions } from '@testing-library/react';

import { LanguageProvider } from '@/lib/i18n/refactored-context';
import { setupI18nTestEnvironment } from './i18n-test-helpers';

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { ...renderOptions } = options;

  // Setup i18n test environment with Spanish as default
  setupI18nTestEnvironment('es');

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider initialLanguage="es">{children}</LanguageProvider>
      </ThemeProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock portfolio data for testing
export const mockPortfolio = {
  id: 'test-portfolio-id',
  user_id: 'test-user-id',
  slug: 'test-portfolio',
  title: 'Test Portfolio',
  bio_raw: 'Original bio text',
  bio_processed: 'Enhanced bio text',
  tagline: 'Test tagline',
  template_id: 'minimal',
  theme: {},
  custom_domain: null,
  subdomain: 'testuser',
  published: false,
  published_at: null,
  analytics_enabled: true,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock project data for testing
export const mockProject = {
  id: 'test-project-id',
  portfolio_id: 'test-portfolio-id',
  title: 'Test Project',
  description_raw: 'Original project description',
  description_processed: 'Enhanced project description',
  technologies: ['React', 'TypeScript', 'Next.js'],
  image_urls: ['https://example.com/image1.jpg'],
  external_url: 'https://example.com',
  github_url: 'https://github.com/user/repo',
  demo_url: 'https://demo.example.com',
  start_date: '2023-01-01',
  end_date: '2023-06-01',
  display_order: 0,
  featured: true,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Test helpers for async operations
export const waitForLoadingToFinish = (): void => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock API responses
export const createMockApiResponse = <T,>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

// Helper to create mock fetch responses
export const mockFetch = (response: unknown, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

// Helper to reset all mocks
export const resetAllMocks = (): void => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

// Helper to mock console methods without noise
export const suppressConsole = (): void => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
