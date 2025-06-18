import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Next.js 15 Request/Response in Node environment
// Mock IntersectionObserver before any components use it
// Define the mock before importing anything that might use it
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    this.takeRecords = jest.fn(() => []);
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];
  }
}

// Apply to both window and global
if (typeof window !== 'undefined') {
  window.IntersectionObserver = MockIntersectionObserver;
}
global.IntersectionObserver = MockIntersectionObserver;

// Add ReadableStream polyfill
if (typeof globalThis.ReadableStream === 'undefined') {
  const {
    ReadableStream,
    WritableStream,
    TransformStream,
  } = require('stream/web');
  globalThis.ReadableStream = ReadableStream;
  globalThis.WritableStream = WritableStream;
  globalThis.TransformStream = TransformStream;
}

// Add MessagePort polyfill
if (typeof globalThis.MessagePort === 'undefined') {
  const { MessagePort, MessageChannel } = require('worker_threads');
  globalThis.MessagePort = MessagePort;
  globalThis.MessageChannel = MessageChannel;
}

// Add Request/Response polyfills
if (typeof globalThis.Request === 'undefined') {
  const { Request, Response, Headers, FormData } = require('undici');
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Headers = Headers;
  globalThis.FormData = FormData;
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js Image component - completely bypass Next.js implementation
jest.mock('next/image', () => {
  const React = require('react');

  // Return a simple img element that doesn't use IntersectionObserver
  const MockedImage = React.forwardRef(function Image(props, ref) {
    // Extract Next.js specific props and ignore them
    const {
      loader,
      quality,
      priority,
      loading,
      unoptimized,
      onLoadingComplete,
      placeholder,
      blurDataURL,
      onLoad,
      onError,
      sizes,
      fill,
      ...imgProps
    } = props;

    // Handle fill prop by adding style
    if (fill) {
      imgProps.style = {
        ...imgProps.style,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      };
    }

    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img ref={ref} {...imgProps} />;
  });

  MockedImage.displayName = 'Image';

  return {
    __esModule: true,
    default: MockedImage,
  };
});

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  redirect: jest.fn(),
}));

// Mock environment variables - use dynamic values instead of hardcoded
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.TEST_SUPABASE_URL || 'https://test-project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.TEST_SUPABASE_ANON_KEY ||
    'test-anon-key-' + Math.random().toString(36).substring(7),
  NEXT_PUBLIC_APP_URL: process.env.TEST_APP_URL || 'http://localhost:3000',
};

// Mock Supabase client with improved responses
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signInWithOAuth: jest
        .fn()
        .mockResolvedValue({ data: { url: 'mock-url' }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        error: null,
      }),
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      then: jest.fn(callback => callback({ data: [], error: null })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        download: jest.fn().mockResolvedValue({ data: {}, error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'mock-url' } }),
      })),
    },
  })),
}));

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        error: null,
      }),
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      then: jest.fn(callback => callback({ data: [], error: null })),
    })),
  }),
}));

// Mock OpenAI - Commented out as we use HuggingFace instead
// jest.mock('openai', () => ({
//   OpenAI: jest.fn().mockImplementation(() => ({
//     chat: {
//       completions: {
//         create: jest.fn(),
//       },
//     },
//   })),
// }));

// Mock Stripe - Commented out until Stripe is implemented
// jest.mock('stripe', () => ({
//   __esModule: true,
//   default: jest.fn().mockImplementation(() => ({
//     customers: {
//       create: jest.fn(),
//       retrieve: jest.fn(),
//     },
//     subscriptions: {
//       create: jest.fn(),
//       retrieve: jest.fn(),
//       update: jest.fn(),
//       cancel: jest.fn(),
//     },
//     products: {
//       list: jest.fn(),
//     },
//     prices: {
//       list: jest.fn(),
//     },
//   })),
// }));

// React Query is not used in this project - removed mock

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  }),
}));

// Remove crypto mock to use native crypto in tests
// The crypto module should work natively in Node.js test environment

// Framer Motion mock removed - library not installed

// Toast utility is mocked in lib/utils/toast.ts - no external dependency needed

// Mock common services that API routes use
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/lib/services/error/error-logger', () => ({
  errorLogger: {
    logError: jest.fn(),
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logDebug: jest.fn(),
  },
  ErrorLogger: jest.fn(() => ({
    logError: jest.fn(),
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logDebug: jest.fn(),
  })),
}));

jest.mock('@/lib/services/error/api-error-handler', () => ({
  handleAPIError: jest.fn(),
}));

jest.mock('@/lib/services/error/global-error-handler', () => ({
  GlobalErrorHandler: {
    getInstance: jest.fn(() => ({
      initialize: jest.fn(),
      cleanup: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/services/error/index', () => ({
  initializeErrorHandling: jest.fn(),
  globalErrorHandler: {
    initialize: jest.fn(),
    cleanup: jest.fn(),
  },
  withErrorHandler: jest.fn(handler => handler),
  ValidationError: jest.fn(message => ({ message, name: 'ValidationError' })),
  ConflictError: jest.fn(message => ({ message, name: 'ConflictError' })),
  ExternalServiceError: jest.fn((service, message) => ({
    message,
    name: 'ExternalServiceError',
    service,
  })),
  errorLogger: {
    logError: jest.fn(),
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logDebug: jest.fn(),
  },
}));

jest.mock('@/lib/ai/geo/geo-service', () => ({
  getGEOService: jest.fn(() => ({
    researchKeywords: jest.fn().mockResolvedValue([
      {
        keyword: 'test keyword',
        searchVolume: 1000,
        difficulty: 50,
        trends: 'stable',
        relatedKeywords: ['related1', 'related2'],
        questions: ['question1', 'question2'],
      },
    ]),
  })),
}));

jest.mock('@/lib/cache/redis-cache', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
  },
}));

// Mock API middleware and helpers
jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: jest.fn(handler => handler),
  AuthenticatedRequest: jest.fn(),
}));

jest.mock('@/lib/api/response-helpers', () => ({
  apiSuccess: jest.fn(data => ({ success: true, data })),
  apiError: jest.fn((message, code) => ({
    success: false,
    error: message,
    code,
  })),
  versionedApiHandler: jest.fn(handler => handler),
}));

jest.mock('@/lib/validation/portfolio', () => ({
  validateCreatePortfolio: jest.fn(data => ({ success: true, data })),
  validatePortfolioQuery: jest.fn(data => ({ success: true, data })),
  sanitizePortfolioData: jest.fn(data => data),
}));

jest.mock('@/lib/utils/portfolio-transformer', () => ({
  transformDbPortfolioToApi: jest.fn(portfolio => portfolio),
  transformApiPortfolioToDb: jest.fn(portfolio => portfolio),
}));

// Mock file reading for testing
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: () => Promise.resolve({ success: true, data: {} }),
  text: () => Promise.resolve(''),
});

// Setup window.matchMedia mock only in JSDOM environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// IntersectionObserver already mocked at the top of the file

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep native behaviour for other methods
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock window.alert, window.confirm, window.prompt only in browser environment
if (typeof window !== 'undefined') {
  global.alert = jest.fn();
  global.confirm = jest.fn(() => true);
  global.prompt = jest.fn(() => '');
}

// Mock AppContext before importing any components
jest.mock('@/lib/contexts/AppContext', () => ({
  useApp: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    isMobileMenuOpen: false,
    setMobileMenuOpen: jest.fn(),
    currency: 'MXN',
    setCurrency: jest.fn(),
  }),
  useAppContext: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    isMobileMenuOpen: false,
    setMobileMenuOpen: jest.fn(),
    currency: 'MXN',
    setCurrency: jest.fn(),
  }),
  AppProvider: ({ children }) => children,
}));

// Mock AuthContext
jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock language context with comprehensive test setup
jest.mock('@/lib/i18n/refactored-context', () => {
  const React = require('react');

  // Track current language state
  let currentLanguage = 'es';

  const translations = {
    es: {
      // Common translations
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      save: 'Guardar',
      cancel: 'Cancelar',
      hello: 'Hola',
      // Dashboard translations
      loadingDashboard: 'Cargando tu panel...',
      myPortfolios: 'Mis Portafolios',
      managePortfolios: 'Gestiona y crea tus portafolios profesionales',
      createNewPortfolio: 'Crear Nuevo Portafolio',
      createPortfolio: 'Crear Portafolio',
      totalPortfolios: 'Total de Portafolios',
      published: 'Publicados',
      totalViews: 'Vistas Totales',
      yourPortfolios: 'Tus Portafolios',
      statusPublished: 'Publicado',
      statusDraft: 'Borrador',
      lastModified: 'Modificado',
      daysAgo: 'hace',
      weekAgo: 'hace 1 semana',
      views: 'vistas',
      noPortfoliosYet: 'Aún no tienes portafolios',
      createFirstPortfolio: 'Crea tu primer portafolio para comenzar',
      // HowItWorks translations
      howItWorksTitle: 'Del CV al portafolio en 3 simples pasos',
      howItWorksSubtitle:
        'Transforma tu experiencia en una presentación profesional',
      step1Title: 'Sube tu CV',
      step1Desc:
        'Sube tu CV en formato PDF o completa tu información manualmente',
      step2Title: 'Elige tu plantilla',
      step2Desc:
        'Selecciona una plantilla profesional que se adapte a tu estilo',
      step3Title: 'Personaliza',
      step3Desc: 'Ajusta colores, fuentes y contenido a tu gusto',
      step4Title: 'Publica',
      step4Desc: 'Obtén tu portafolio en línea con un enlace único',
      // Add more translations as needed by tests
    },
    en: {
      // Common translations
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      hello: 'Hello',
      // Dashboard translations
      loadingDashboard: 'Loading your dashboard...',
      myPortfolios: 'My Portfolios',
      managePortfolios: 'Manage and create your professional portfolios',
      createNewPortfolio: 'Create New Portfolio',
      createPortfolio: 'Create Portfolio',
      totalPortfolios: 'Total Portfolios',
      published: 'Published',
      totalViews: 'Total Views',
      yourPortfolios: 'Your Portfolios',
      statusPublished: 'Published',
      statusDraft: 'Draft',
      lastModified: 'Modified',
      daysAgo: 'ago',
      weekAgo: '1 week ago',
      views: 'views',
      noPortfoliosYet: "You don't have any portfolios yet",
      createFirstPortfolio: 'Create your first portfolio to get started',
      // HowItWorks translations
      howItWorksTitle: 'From CV to portfolio in 3 simple steps',
      howItWorksSubtitle:
        'Transform your experience into a professional presentation',
      step1Title: 'Upload your CV',
      step1Desc:
        'Upload your CV in PDF format or fill in your information manually',
      step2Title: 'Choose your template',
      step2Desc: 'Select a professional template that suits your style',
      step3Title: 'Customize',
      step3Desc: 'Adjust colors, fonts and content to your liking',
      step4Title: 'Publish',
      step4Desc: 'Get your portfolio online with a unique link',
    },
  };

  return {
    useLanguage: () => ({
      language: currentLanguage,
      setLanguage: jest.fn(lang => {
        currentLanguage = lang;
      }),
      t: translations[currentLanguage] || translations.es,
      availableLanguages: [
        { code: 'es', name: 'Español', flag: '🇲🇽' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
      ],
      getNamespace: () => ({}),
      isLoaded: true,
    }),
    LanguageProvider: ({ children, initialLanguage }) => {
      if (initialLanguage) {
        currentLanguage = initialLanguage;
      }
      return children;
    },
  };
});

jest.mock('@/lib/i18n/minimal-context', () => {
  // Reuse the same mock as refactored-context
  return jest.requireMock('@/lib/i18n/refactored-context');
});

// IntersectionObserver already mocked at the top of the file

// Mock feature flags and experiments
jest.mock('@/lib/services/feature-flags/use-experiment', () => ({
  useExperiment: () => ({
    components: [],
    isLoading: false,
    error: null,
  }),
  useExperimentTheme: () => {},
  useExperimentTracking: () => ({
    trackClick: jest.fn(),
    trackView: jest.fn(),
    trackConversion: jest.fn(),
  }),
  sortComponentsByOrder: components => components,
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('button', props, children);
  },
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }) => {
    const React = require('react');
    return React.createElement('input', props);
  },
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('label', props, children);
  },
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }) => {
    const React = require('react');
    return React.createElement('textarea', props);
  },
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
  CardHeader: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
  CardContent: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
  CardFooter: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
}));

// Note: lucide-react mocking is handled by moduleNameMapper in jest.config.js
// pointing to __mocks__/lucide-react.js - removing duplicate mock here

// Mock dynamic imports globally
global.__dynamic_import_mock__ = {};

// Override dynamic import behavior
jest.mock('@/lib/config', () => {
  const actualConfig = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    services: {
      supabase: true,
    },
  };

  // Make it available for both static and dynamic imports
  global.__dynamic_import_mock__['@/lib/config'] = actualConfig;

  return actualConfig;
});

// Clear localStorage before each test suite to ensure consistent language detection
beforeEach(() => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();

    // Set navigator.language to Spanish by default for tests
    Object.defineProperty(navigator, 'language', {
      value: 'es-ES',
      writable: true,
      configurable: true,
    });
  }
});

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
