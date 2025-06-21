/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Common mocks used across all tests
 * This file consolidates all mock definitions to avoid duplicates
 */

// Navigation mocks
export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockRefresh = jest.fn();
export const mockBack = jest.fn();
export const mockPrefetch = jest.fn();
export const mockPathname = '/';
export const mockSearchParams = new URLSearchParams();

export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: mockBack,
  prefetch: mockPrefetch,
  pathname: mockPathname,
  searchParams: mockSearchParams,
};

export const mockUseRouter = jest.fn(() => mockRouter);
export const mockUsePathname = jest.fn(() => mockPathname);
export const mockUseSearchParams = jest.fn(() => mockSearchParams);
export const mockUseParams = jest.fn(() => ({}));
export const mockNotFound = jest.fn();
export const mockRedirect = jest.fn();

// i18n mocks
export const mockT = {
  test: 'test',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  submit: 'Submit',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  create: 'Create',
  update: 'Update',
  portfolios: 'Portfolios',
  totalPortfolios: 'Total Portfolios',
  published: 'Published',
  totalViews: 'Total Views',
  today: 'Today',
  yesterday: 'Yesterday',
  daysAgo: 'days ago',
  weeksAgo: 'weeks ago',
  createPortfolio: 'Create Portfolio',
  searchPortfolios: 'Search portfolios...',
  allStatuses: 'All Statuses',
  allTemplates: 'All Templates',
  createdAt: 'Created',
  lastModified: 'Last Modified',
  actions: 'Actions',
  publish: 'Publish',
  unpublish: 'Unpublish',
  preview: 'Preview',
  portfolioLimitReached: 'Portfolio limit reached',
  upgradeToPro: 'Upgrade to Pro',
  confirmDelete: 'Confirm Delete',
  areYouSure: 'Are you sure?',
  thisActionCannotBeUndone: 'This action cannot be undone',
  yes: 'Yes',
  no: 'No',
};

export const mockUseLanguage = jest.fn(() => ({
  t: mockT,
  lang: 'en',
  setLang: jest.fn(),
}));

// Supabase mocks
export const createSupabaseMock = () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockIn = jest.fn().mockReturnThis();
  const mockGte = jest.fn().mockReturnThis();
  const mockLte = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });

  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    in: mockIn,
    gte: mockGte,
    lte: mockLte,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
  }));

  return {
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: null, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: mockFrom,
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
      }),
    },
  };
};

// Toast mocks
export const mockToast = jest.fn();
export const mockUseToast = jest.fn(() => ({ toast: mockToast }));

// Store mocks
export const mockPortfolioStore = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
  loadPortfolios: jest.fn().mockResolvedValue([]),
  loadPortfolio: jest.fn().mockResolvedValue(null),
  createPortfolio: jest.fn().mockResolvedValue({ id: 'new-portfolio' }),
  updatePortfolio: jest.fn().mockResolvedValue({ id: 'updated-portfolio' }),
  deletePortfolio: jest.fn().mockResolvedValue(undefined),
  setCurrentPortfolio: jest.fn(),
  resetPortfolios: jest.fn(),
};

export const mockAuthStore = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  signIn: jest.fn().mockResolvedValue(undefined),
  signUp: jest.fn().mockResolvedValue(undefined),
  signOut: jest.fn().mockResolvedValue(undefined),
  setUser: jest.fn(),
  setSession: jest.fn(),
  resetAuth: jest.fn(),
  initializeAuth: jest.fn().mockResolvedValue(undefined),
};

export const mockUIStore = {
  theme: 'light' as const,
  sidebarOpen: true,
  modals: [],
  toasts: [],
  globalLoading: false,
  loadingMessage: null,
  setTheme: jest.fn(),
  toggleSidebar: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  showToast: jest.fn(),
  removeToast: jest.fn(),
  setGlobalLoading: jest.fn(),
  resetUI: jest.fn(),
};

// Subscription mocks
export const mockSubscription = {
  plan: 'free' as const,
  canCreatePortfolio: jest.fn().mockReturnValue(true),
  canUseAI: jest.fn().mockReturnValue(true),
  portfolioLimit: 1,
  aiCredits: 3,
  customDomain: false,
  analytics: false,
};

export const mockUseSubscription = jest.fn(() => mockSubscription);

// Upgrade prompts mocks
export const mockUpgradePrompts = {
  showModal: false,
  modalReason: null,
  hideUpgradeModal: jest.fn(),
  checkAndShowPrompt: jest.fn().mockReturnValue(false),
  shouldShowPrompt: jest.fn().mockReturnValue(false),
};

export const mockUseUpgradePrompts = jest.fn(() => mockUpgradePrompts);
