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

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
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
  })),
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

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }) => children,
}));

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

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn(size => Buffer.alloc(size, 0)),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash-12345678'),
  }),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    section: 'section',
    article: 'article',
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
    custom: jest.fn(),
    promise: jest.fn(),
  },
  Toaster: ({ children }) => children,
}));

// Mock file reading for testing
global.fetch = jest.fn();

// Setup window.matchMedia mock
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

// Mock window.alert, window.confirm, window.prompt
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn(() => '');

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

  // Inline mock to avoid circular dependency issues
  return {
    useLanguage: () => ({
      language: 'es',
      setLanguage: jest.fn(),
      t: {
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
        // Add more translations as needed by tests
      },
      availableLanguages: [
        { code: 'es', name: 'Español', flag: '🇲🇽' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
      ],
      getNamespace: () => ({}),
      isLoaded: true,
    }),
    LanguageProvider: ({ children }) => children,
  };
});

jest.mock('@/lib/i18n/minimal-context', () => {
  return {
    useLanguage: () => ({
      language: 'es',
      setLanguage: jest.fn(),
      t: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        save: 'Guardar',
        cancel: 'Cancelar',
        // Add more translations as needed by tests
      },
      availableLanguages: [
        { code: 'es', name: 'Español', flag: '🇲🇽' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
      ],
      getNamespace: () => ({}),
      isLoaded: true,
    }),
    LanguageProvider: ({ children }) => children,
  };
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

// Clear localStorage before each test suite to ensure consistent language detection
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();

  // Set navigator.language to Spanish by default for tests
  Object.defineProperty(navigator, 'language', {
    value: 'es-ES',
    writable: true,
    configurable: true,
  });
});

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
