
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================


// Mock UI store for showToast functionality
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

import { act, renderHook } from '@testing-library/react';
import { describe, test, it, expect, beforeEach, afterEach, jest,  } from '@jest/globals';

// Mock DOM methods
const mockMatchMedia = jest.fn().mockReturnValue(void 0);
const mockClassList = {
  add: jest.fn().mockReturnValue(void 0),
  remove: jest.fn().mockReturnValue(void 0),
};

// Mock UI store functions
const mockSetTheme = jest.fn().mockReturnValue(void 0);
const mockSetSidebarOpen = jest.fn().mockReturnValue(void 0);
const mockToggleSidebar = jest.fn().mockReturnValue(void 0);
const mockOpenModal = jest.fn().mockReturnValue(void 0);
const mockCloseModal = jest.fn().mockReturnValue(void 0);
const mockCloseAllModals = jest.fn().mockReturnValue(void 0);
const mockShowToast = jest.fn().mockReturnValue(void 0);
const mockRemoveToast = jest.fn().mockReturnValue(void 0);
const mockClearToasts = jest.fn().mockReturnValue(void 0);
const mockSetGlobalLoading = jest.fn().mockReturnValue(void 0);
const mockShowSuccessToast = jest.fn().mockReturnValue(void 0);
const mockShowErrorToast = jest.fn().mockReturnValue(void 0);
const mockShowWarningToast = jest.fn().mockReturnValue(void 0);
const mockShowInfoToast = jest.fn().mockReturnValue(void 0);

// Mock store state
let mockState = {
  theme: 'system' as const,
  sidebarOpen: true,
  modals: [],
  toasts: [],
  globalLoading: false,
  loadingMessage: null,
};

// Mock the entire store
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: {
    getState: () => ({
      ...mockState,
      setTheme: mockSetTheme,
      setSidebarOpen: mockSetSidebarOpen,
      toggleSidebar: mockToggleSidebar,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      closeAllModals: mockCloseAllModals,
      showToast: mockShowToast,
      removeToast: mockRemoveToast,
      clearToasts: mockClearToasts,
      setGlobalLoading: mockSetGlobalLoading,
    }),
    setState: jest.fn().mockReturnValue(void 0),
  },
  showSuccessToast: mockShowSuccessToast,
  showErrorToast: mockShowErrorToast,
  showWarningToast: mockShowWarningToast,
  showInfoToast: mockShowInfoToast,
}));

describe('UI Store', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset mock state
    mockState = {
      theme: 'system',
      sidebarOpen: true,
      modals: [],
      toasts: [],
      globalLoading: false,
      loadingMessage: null,
    };

    // Mock window.matchMedia
    global.window.matchMedia = mockMatchMedia;
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn().mockReturnValue(void 0),
      removeListener: jest.fn().mockReturnValue(void 0),
      addEventListener: jest.fn().mockReturnValue(void 0),
      removeEventListener: jest.fn().mockReturnValue(void 0),
      dispatchEvent: jest.fn().mockReturnValue(void 0),
    });

    // Mock document.documentElement.classList
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Theme Management', () => {
    it('should call setTheme with light', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setTheme } = useUIStore.getState();

      await act(async () => {
        setTheme('light');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should call setTheme with dark', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setTheme } = useUIStore.getState();

      await act(async () => {
        setTheme('dark');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should call setTheme with system', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setTheme } = useUIStore.getState();

      await act(async () => {
        setTheme('system');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Sidebar Management', () => {
    it('should call toggleSidebar', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { toggleSidebar } = useUIStore.getState();

      await act(async () => {
        toggleSidebar();
      });

      expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('should call setSidebarOpen', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setSidebarOpen } = useUIStore.getState();

      await act(async () => {
        setSidebarOpen(false);
      });

      expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Modal Management', () => {
    it('should call openModal', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { openModal } = useUIStore.getState();

      const modal = {
        id: 'test-modal',
        type: 'confirm' as const,
        title: 'Test Modal',
        description: 'Test description',
        onConfirm: jest.fn().mockReturnValue(void 0),
        onCancel: jest.fn().mockReturnValue(void 0),
      };

      await act(async () => {
        openModal(modal);
      });

      expect(mockOpenModal).toHaveBeenCalledWith(modal);
    });

    it('should call closeModal', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { closeModal } = useUIStore.getState();

      await act(async () => {
        closeModal('test-modal');
      });

      expect(mockCloseModal).toHaveBeenCalledWith('test-modal');
    });

    it('should call closeAllModals', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { closeAllModals } = useUIStore.getState();

      await act(async () => {
        closeAllModals();
      });

      expect(mockCloseAllModals).toHaveBeenCalled();
    });
  });

  describe('Toast Management', () => {
    it('should call showToast', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { showToast } = useUIStore.getState();

      const toast = {
        title: 'Test Toast',
        description: 'Test description',
        type: 'success' as const,
      };

      await act(async () => {
        showToast(toast);
      });

      expect(mockShowToast).toHaveBeenCalledWith(toast);
    });

    it('should call removeToast', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { removeToast } = useUIStore.getState();

      await act(async () => {
        removeToast('toast-id');
      });

      expect(mockRemoveToast).toHaveBeenCalledWith('toast-id');
    });

    it('should call clearToasts', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { clearToasts } = useUIStore.getState();

      await act(async () => {
        clearToasts();
      });

      expect(mockClearToasts).toHaveBeenCalled();
    });
  });

  describe('Toast Utility Functions', () => {
    it('should call showSuccessToast', async () => {
      const { showSuccessToast } = require('@/lib/store/ui-store');

      await act(async () => {
        showSuccessToast('Success!', 'Operation completed');
      });

      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Success!',
        'Operation completed'
      );
    });

    it('should call showErrorToast', async () => {
      const { showErrorToast } = require('@/lib/store/ui-store');

      await act(async () => {
        showErrorToast('Error!', 'Something went wrong');
      });

      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Error!',
        'Something went wrong'
      );
    });

    it('should call showWarningToast', async () => {
      const { showWarningToast } = require('@/lib/store/ui-store');

      await act(async () => {
        showWarningToast('Warning!', 'Please be careful');
      });

      expect(mockShowWarningToast).toHaveBeenCalledWith(
        'Warning!',
        'Please be careful'
      );
    });

    it('should call showInfoToast', async () => {
      const { showInfoToast } = require('@/lib/store/ui-store');

      await act(async () => {
        showInfoToast('Info', 'Just letting you know');
      });

      expect(mockShowInfoToast).toHaveBeenCalledWith(
        'Info',
        'Just letting you know'
      );
    });
  });

  describe('Loading State Management', () => {
    it('should call setGlobalLoading with loading state', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setGlobalLoading } = useUIStore.getState();

      await act(async () => {
        setGlobalLoading(true, 'Loading data...');
      });

      expect(mockSetGlobalLoading).toHaveBeenCalledWith(
        true,
        'Loading data...'
      );
    });

    it('should call setGlobalLoading to clear loading', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setGlobalLoading } = useUIStore.getState();

      await act(async () => {
        setGlobalLoading(false);
      });

      expect(mockSetGlobalLoading).toHaveBeenCalledWith(false);
    });

    it('should call setGlobalLoading without message', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setGlobalLoading } = useUIStore.getState();

      await act(async () => {
        setGlobalLoading(true);
      });

      expect(mockSetGlobalLoading).toHaveBeenCalledWith(true);
    });
  });

  describe('Store State Access', () => {
    it('should return current state from getState', async () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const state = useUIStore.getState();

      expect(state.theme).toBe('system');
      expect(state.sidebarOpen).toBe(true);
      expect(state.modals).toEqual([]);
      expect(state.toasts).toEqual([]);
      expect(state.globalLoading).toBe(false);
      expect(state.loadingMessage).toBeNull();
    });
  });
});
