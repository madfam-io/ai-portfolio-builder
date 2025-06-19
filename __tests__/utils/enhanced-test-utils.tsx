import React, { ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { NextRouter } from 'next/router';
import { Session } from 'next-auth';
import type { Language } from '@/lib/i18n/refactored-types';

/**
 * Enhanced test utilities for comprehensive testing
 * Provides all necessary mocks, utilities, and helpers for the test suite
 */

// Mock next-auth for authentication testing
export const mockSession: Session = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock router for navigation testing
export const mockRouter: Partial<NextRouter> = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  locale: 'es',
  locales: ['es', 'en'],
  defaultLocale: 'es',
};

// Mock fetch for API testing
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  });
  return global.fetch as jest.Mock;
};

// Mock API response helpers
export const mockApiSuccess = (data: any) => ({
  success: true,
  data,
  error: null,
});

export const mockApiError = (message: string, code?: string) => ({
  success: false,
  data: null,
  error: {
    message,
    code: code || 'UNKNOWN_ERROR',
  },
});

// Mock store creators for Zustand
export const createMockStore = <T extends object>(initialState: T) => {
  let state = { ...initialState };
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => {
      const newState = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...newState };
      listeners.forEach(listener => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
  };
};

// Mock portfolio data for testing
export const mockPortfolioData = {
  id: 'portfolio-123',
  userId: 'user-123',
  title: 'Test Portfolio',
  bio: 'Test bio content',
  template: 'developer',
  status: 'draft' as const,
  subdomain: 'test-portfolio',
  customization: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      background: '#FFFFFF',
      text: '#111827',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  sections: {
    hero: {
      title: 'John Doe',
      subtitle: 'Full Stack Developer',
      description: 'Building amazing web experiences',
    },
    about: {
      content: 'Experienced developer with 5+ years',
    },
    projects: [
      {
        id: 'project-1',
        title: 'Project One',
        description: 'Amazing project',
        technologies: ['React', 'Node.js'],
        link: 'https://example.com',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    contact: {
      email: 'john@example.com',
      phone: '+1234567890',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock analytics data
export const mockAnalyticsData = {
  views: 150,
  visitors: 75,
  avgDuration: 120,
  bounceRate: 0.35,
  topSources: [
    { source: 'Direct', visits: 45 },
    { source: 'LinkedIn', visits: 30 },
  ],
  deviceBreakdown: {
    desktop: 60,
    mobile: 35,
    tablet: 5,
  },
};

// Enhanced translation mock with all necessary keys
export const createMockTranslations = (overrides?: any) => ({
  es: {
    // All translations from comprehensive-test-setup.tsx
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',

    // Additional keys for specific components
    publish: 'Publicar',
    unpublish: 'Despublicar',
    preview: 'Vista Previa',
    download: 'Descargar',
    share: 'Compartir',
    copy: 'Copiar',
    copied: 'Copiado',

    // Form validations
    required: 'Este campo es requerido',
    invalidEmail: 'Email inválido',
    minLength: 'Mínimo {min} caracteres',
    maxLength: 'Máximo {max} caracteres',

    // API responses
    savedSuccessfully: 'Guardado exitosamente',
    publishedSuccessfully: 'Publicado exitosamente',
    deletedSuccessfully: 'Eliminado exitosamente',
    somethingWentWrong: 'Algo salió mal',
    tryAgainLater: 'Intenta nuevamente más tarde',

    ...(overrides?.es || {}),
  },
  en: {
    // English translations
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',

    // Additional keys
    publish: 'Publish',
    unpublish: 'Unpublish',
    preview: 'Preview',
    download: 'Download',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied',

    // Form validations
    required: 'This field is required',
    invalidEmail: 'Invalid email',
    minLength: 'Minimum {min} characters',
    maxLength: 'Maximum {max} characters',

    // API responses
    savedSuccessfully: 'Saved successfully',
    publishedSuccessfully: 'Published successfully',
    deletedSuccessfully: 'Deleted successfully',
    somethingWentWrong: 'Something went wrong',
    tryAgainLater: 'Please try again later',

    ...(overrides?.en || {}),
  },
});

// Create test wrapper with all providers
export const createTestWrapper = ({
  initialLanguage = 'es',
  session = null,
  router = mockRouter,
}: {
  initialLanguage?: Language;
  session?: Session | null;
  router?: Partial<NextRouter>;
} = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

  return Wrapper;
};

// Custom render with options
export const renderWithOptions = (
  ui: React.ReactElement,
  {
    initialLanguage = 'es',
    session = null,
    router = mockRouter,
    ...renderOptions
  }: RenderOptions & {
    initialLanguage?: Language;
    session?: Session | null;
    router?: Partial<NextRouter>;
  } = {}
) => {
  const Wrapper = createTestWrapper({ initialLanguage, session, router });

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

// Wait for async operations
export const waitForAsync = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console };

  beforeAll(() => {
    global.console = {
      ...console,
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
    };
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  return {
    expectNoErrors: () => {
      expect(console.error).not.toHaveBeenCalled();
    },
    expectNoWarnings: () => {
      expect(console.warn).not.toHaveBeenCalled();
    },
  };
};

// Mock window methods
export const mockWindow = () => {
  const originalWindow = {
    alert: window.alert,
    confirm: window.confirm,
    prompt: window.prompt,
    location: window.location,
  };

  beforeAll(() => {
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
    window.prompt = jest.fn(() => '');
    delete (window as any).location;
    window.location = {
      ...originalWindow.location,
      href: 'http://localhost:3000',
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
    };
  });

  afterAll(() => {
    window.alert = originalWindow.alert;
    window.confirm = originalWindow.confirm;
    window.prompt = originalWindow.prompt;
    window.location = originalWindow.location;
  });
};

// Test data factories
export const factories = {
  user: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  portfolio: (overrides = {}) => ({
    ...mockPortfolioData,
    ...overrides,
  }),

  project: (overrides = {}) => ({
    id: 'project-123',
    title: 'Test Project',
    description: 'Test project description',
    technologies: ['React', 'TypeScript'],
    link: 'https://example.com',
    image: '/images/project.jpg',
    ...overrides,
  }),

  analytics: (overrides = {}) => ({
    ...mockAnalyticsData,
    ...overrides,
  }),
};

// API route test helpers
export const createMockRequest = (
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
) => {
  const url = new URL('http://localhost:3000/api/test');
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return new Request(url.toString(), {
    method: options.method || 'GET',
    headers: new Headers({
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
};

export const createMockResponse = () => {
  let statusCode = 200;
  let headers = new Headers();
  let body: any = null;

  const response = {
    status: (code: number) => {
      statusCode = code;
      return response;
    },
    headers,
    json: (data: any) => {
      body = data;
      headers.set('Content-Type', 'application/json');
      return new Response(JSON.stringify(data), {
        status: statusCode,
        headers,
      });
    },
    text: (data: string) => {
      body = data;
      return new Response(data, {
        status: statusCode,
        headers,
      });
    },
    getStatus: () => statusCode,
    getBody: () => body,
    getHeaders: () => headers,
  };

  return response;
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithOptions as render };
