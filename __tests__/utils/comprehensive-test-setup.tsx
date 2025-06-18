import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock the i18n context
const mockUseLanguage = {
  language: 'en' as const,
  setLanguage: jest.fn(),
  t: {
    // Landing page
    welcomeMessage: 'Welcome to PRISMA',
    heroTitle: 'Create Your Professional Portfolio in Minutes',
    heroSubtitle: 'AI-powered portfolio builder for professionals',
    getStarted: 'Get Started',
    viewDemo: 'View Demo',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Navigation
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    dashboard: 'Dashboard',
    editor: 'Editor',
    analytics: 'Analytics',
    features: 'Features',
    howItWorks: 'How It Works',
    pricing: 'Pricing',
    templates: 'Templates',

    // Auth
    signIn: 'Sign In',
    signOut: 'Sign Out',

    // Language & Settings
    switchTo: 'Switch to',
    switchCurrency: 'Switch currency',
    current: 'Current',
    hello: 'Hello',

    // Portfolio
    portfolio: 'Portfolio',
    portfolios: 'Portfolios',
    createPortfolio: 'Create Portfolio',

    // CTA Section
    ctaTitle: 'Ready to Create Your Professional Portfolio?',
    ctaSubtitle: 'Join thousands of professionals who have built stunning portfolios with PRISMA',
    ctaButton: 'Start Building Your Portfolio',
    ctaFooter: 'No credit card required • Free forever plan available',
    editPortfolio: 'Edit Portfolio',
    deletePortfolio: 'Delete Portfolio',
    publishPortfolio: 'Publish Portfolio',

    // AI
    enhanceWithAI: 'Enhance with AI',
    aiProcessing: 'AI Processing...',
    aiEnhancement: 'AI Enhancement',

    // Editor
    preview: 'Preview',
    publish: 'Publish',
    unpublish: 'Unpublish',
    saving: 'Saving...',
    saved: 'Saved',
    unsavedChanges: 'Unsaved changes',

    // Forms
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    title: 'Title',
    description: 'Description',

    // Status
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  },
  availableLanguages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ],
  isLoading: false,
};

jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => mockUseLanguage,
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    return <img src={src} alt={alt} {...rest} />;
  },
}));

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
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
    single: jest.fn().mockReturnThis(),
    then: jest.fn(),
  })),
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}));

// NextAuth is mocked via manual mocks in __mocks__ directory
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

// Mock Lucide React icons
jest.mock('lucide-react', () => {
  const icons = [
    'CheckCircle',
    'Eye',
    'Loader',
    'RotateCcw',
    'RotateCw',
    'Save',
    'Share2',
    'Settings',
    'User',
    'Home',
    'PlusCircle',
    'Edit',
    'Trash2',
    'Download',
    'Upload',
    'Search',
    'Filter',
    'SortAsc',
    'SortDesc',
    'ChevronDown',
    'ChevronUp',
    'ChevronLeft',
    'ChevronRight',
    'X',
    'Menu',
    'Bell',
    'Mail',
    'Phone',
    'MapPin',
    'ExternalLink',
    'Github',
    'Linkedin',
    'Twitter',
    'Instagram',
    'Youtube',
    'Globe',
    'Calendar',
    'Clock',
    'Star',
    'Heart',
    'ThumbsUp',
    'MessageSquare',
    'Bookmark',
    'Share',
    'Copy',
    'Check',
    'AlertCircle',
    'AlertTriangle',
    'Info',
    'HelpCircle',
    'Zap',
    'Rocket',
    'Target',
    'TrendingUp',
    'Award',
    'Shield',
    'Lock',
    'Unlock',
    'Key',
    'Database',
    'Server',
    'Cloud',
    'Monitor',
    'Smartphone',
    'Tablet',
    'Layout',
    'Grid',
    'List',
    'Image',
    'File',
    'FileText',
    'Folder',
    'Archive',
    'Package',
    'Tag',
    'Layers',
    'Code',
    'Terminal',
    'Play',
    'Pause',
    'Stop',
    'Repeat',
    'Shuffle',
    'Volume2',
    'VolumeX',
    'Mic',
    'Camera',
    'Video',
    'Headphones',
    'Radio',
    'Tv',
    'Cast',
    'Wifi',
    'Bluetooth',
    'Battery',
    'Power',
    'RefreshCw',
    'MoreHorizontal',
    'MoreVertical',
    'Maximize2',
    'Minimize2',
    'RotateCcw',
    'RotateCw',
  ];

  const mockIcon = ({ className, ...props }: any) => (
    <svg
      className={className}
      {...props}
      data-testid="mock-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="24" height="24" />
    </svg>
  );

  const exports: any = {};
  icons.forEach(icon => {
    exports[icon] = mockIcon;
  });

  return exports;
});

// Mock PostHog
jest.mock('posthog-js', () => ({
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  onFeatureFlags: jest.fn(),
  isFeatureEnabled: jest.fn().mockReturnValue(false),
  getFeatureFlag: jest.fn().mockReturnValue(false),
}));

// Mock stores
const mockPortfolioStore = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
  fetchPortfolios: jest.fn(),
  createPortfolio: jest.fn(),
  updatePortfolio: jest.fn(),
  deletePortfolio: jest.fn(),
  setCurrentPortfolio: jest.fn(),
  clearError: jest.fn(),
};

const mockAuthStore = {
  user: null,
  session: null,
  isLoading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  clearError: jest.fn(),
};

const mockUIStore = {
  theme: 'light' as const,
  language: 'en' as const,
  sidebarOpen: false,
  notifications: [],
  setTheme: jest.fn(),
  setLanguage: jest.fn(),
  toggleSidebar: jest.fn(),
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
};

const mockAIStore = {
  selectedModel: 'meta-llama/Llama-3.1-8B-Instruct',
  isProcessing: false,
  error: null,
  setSelectedModel: jest.fn(),
  enhanceBio: jest.fn(),
  enhanceProject: jest.fn(),
  recommendTemplate: jest.fn(),
  clearError: jest.fn(),
};

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => mockPortfolioStore),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => mockAuthStore),
}));

jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => mockUIStore),
}));

jest.mock('@/lib/store/ai-store', () => ({
  useAIStore: jest.fn(() => mockAIStore),
}));

// Mock hooks
jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    save: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('@/hooks/useEditorHistory', () => ({
  useEditorHistory: () => ({
    canUndo: false,
    canRedo: false,
    undo: jest.fn(),
    redo: jest.fn(),
    pushState: jest.fn(),
    clearHistory: jest.fn(),
  }),
}));

jest.mock('@/hooks/useRealTimePreview', () => ({
  useRealTimePreview: () => ({
    previewUrl: 'http://localhost:3000/preview/test',
    isGenerating: false,
    generatePreview: jest.fn(),
    refreshPreview: jest.fn(),
  }),
}));

// Mock AI services
jest.mock('@/lib/ai/client', () => ({
  enhanceBio: jest.fn().mockResolvedValue({
    enhancedBio: 'Enhanced bio content',
    confidence: 0.9,
    suggestions: ['Add more specific achievements', 'Include technical skills'],
  }),
  enhanceProject: jest.fn().mockResolvedValue({
    enhancedDescription: 'Enhanced project description',
    suggestedHighlights: [
      'Implemented scalable architecture',
      'Improved performance by 40%',
    ],
    extractedSkills: ['React', 'Node.js', 'PostgreSQL'],
  }),
  recommendTemplate: jest.fn().mockResolvedValue({
    recommendedTemplate: 'developer',
    confidence: 0.85,
    reasoning: 'Based on technical skills and project portfolio',
    alternatives: [
      { template: 'minimal', score: 0.7 },
      { template: 'modern', score: 0.6 },
    ],
  }),
}));

// Mock analytics
jest.mock('@/lib/analytics/posthog/client', () => ({
  track: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
}));

// Create a simple test provider
const TestProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div data-testid="test-provider">{children}</div>;
};

// Enhanced render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  });
};

// Test data factories
export const createMockPortfolio = (overrides: Partial<any> = {}) => ({
  id: 'test-portfolio-1',
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Software Developer',
  bio: 'Experienced software developer with expertise in React and Node.js',
  tagline: 'Building amazing web applications',
  location: 'San Francisco, CA',
  avatarUrl: 'https://example.com/avatar.jpg',
  contact: {
    email: 'test@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
  },
  social: {
    linkedin: 'https://linkedin.com/in/testuser',
    github: 'https://github.com/testuser',
    twitter: 'https://twitter.com/testuser',
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  template: 'developer' as const,
  customization: {},
  status: 'draft' as const,
  subdomain: 'testuser',
  views: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
});

export const createMockProject = (overrides: Partial<any> = {}) => ({
  id: 'project-1',
  title: 'E-commerce Platform',
  description: 'A full-stack e-commerce solution built with React and Node.js',
  imageUrl: 'https://example.com/project.jpg',
  liveUrl: 'https://example.com',
  githubUrl: 'https://github.com/user/project',
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  highlights: ['Scalable architecture', 'Real-time features'],
  featured: true,
  order: 1,
  ...overrides,
});

export const createMockExperience = (overrides: Partial<any> = {}) => ({
  id: 'exp-1',
  company: 'Tech Corp',
  companyLogo: 'https://example.com/logo.jpg',
  position: 'Senior Developer',
  location: 'San Francisco, CA',
  employmentType: 'full-time' as const,
  startDate: '2020-01-01',
  endDate: '2023-12-31',
  current: false,
  description: 'Led development of web applications using React and Node.js',
  highlights: ['Improved performance by 40%', 'Mentored junior developers'],
  technologies: ['React', 'Node.js', 'AWS'],
  ...overrides,
});

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  ...overrides,
});

export const createMockSession = (overrides: Partial<any> = {}) => ({
  user: createMockUser(overrides.user),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

// Export everything
export * from '@testing-library/react';
export {
  customRender as render,
  TestProviders,
  mockSupabase,
  mockSession,
  mockPortfolioStore,
  mockAuthStore,
  mockUIStore,
  mockAIStore,
  mockUseLanguage,
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test setup
beforeAll(() => {
  // Mock window.matchMedia only in browser environment
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock fetch
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
  });

  // Suppress console warnings in tests
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('React.createElement') ||
        message.includes('componentWillReceiveProps') ||
        message.includes('componentWillUpdate') ||
        message.includes('findDOMNode'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
});
