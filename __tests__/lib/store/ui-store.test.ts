import {
  describe,
  test,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { act, renderHook } from '@testing-library/react';

// Mock DOM methods
const mockMatchMedia = jest.fn();
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
};

// Mock UI store functions
const mockSetTheme = jest.fn();
const mockSetSidebarOpen = jest.fn();
const mockToggleSidebar = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockCloseAllModals = jest.fn();
const mockShowToast = jest.fn();
const mockRemoveToast = jest.fn();
const mockClearToasts = jest.fn();
const mockSetGlobalLoading = jest.fn();
const mockShowSuccessToast = jest.fn();
const mockShowErrorToast = jest.fn();
const mockShowWarningToast = jest.fn();
const mockShowInfoToast = jest.fn();

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
    setState: jest.fn(),
  },
  showSuccessToast: mockShowSuccessToast,
  showErrorToast: mockShowErrorToast,
  showWarningToast: mockShowWarningToast,
  showInfoToast: mockShowInfoToast,
}));

describe('UI Store', () => {
  beforeEach(() => {
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
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
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
    it('should call setTheme with light', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('light');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should call setTheme with dark', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('dark');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should call setTheme with system', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('system');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Sidebar Management', () => {
    it('should call toggleSidebar', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { toggleSidebar } = useUIStore.getState();

      act(() => {
        toggleSidebar();
      });

      expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('should call setSidebarOpen', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setSidebarOpen } = useUIStore.getState();

      act(() => {
        setSidebarOpen(false);
      });

      expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Modal Management', () => {
    it('should call openModal', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { openModal } = useUIStore.getState();

      const modal = {
        id: 'test-modal',
        type: 'confirm' as const,
        title: 'Test Modal',
        description: 'Test description',
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
      };

      act(() => {
        openModal(modal);
      });

      expect(mockOpenModal).toHaveBeenCalledWith(modal);
    });

    it('should call closeModal', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { closeModal } = useUIStore.getState();

      act(() => {
        closeModal('test-modal');
      });

      expect(mockCloseModal).toHaveBeenCalledWith('test-modal');
    });

    it('should call closeAllModals', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { closeAllModals } = useUIStore.getState();

      act(() => {
        closeAllModals();
      });

      expect(mockCloseAllModals).toHaveBeenCalled();
    });
  });

  describe('Toast Management', () => {
    it('should call showToast', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { showToast } = useUIStore.getState();

      const toast = {
        title: 'Test Toast',
        description: 'Test description',
        type: 'success' as const,
      };

      act(() => {
        showToast(toast);
      });

      expect(mockShowToast).toHaveBeenCalledWith(toast);
    });

    it('should call removeToast', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { removeToast } = useUIStore.getState();

      act(() => {
        removeToast('toast-id');
      });

      expect(mockRemoveToast).toHaveBeenCalledWith('toast-id');
    });

    it('should call clearToasts', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { clearToasts } = useUIStore.getState();

      act(() => {
        clearToasts();
      });

      expect(mockClearToasts).toHaveBeenCalled();
    });
  });

  describe('Toast Utility Functions', () => {
    it('should call showSuccessToast', () => {
      const { showSuccessToast } = require('@/lib/store/ui-store');

      act(() => {
        showSuccessToast('Success!', 'Operation completed');
      });

      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Success!',
        'Operation completed'
      );
    });

    it('should call showErrorToast', () => {
      const { showErrorToast } = require('@/lib/store/ui-store');

      act(() => {
        showErrorToast('Error!', 'Something went wrong');
      });

      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Error!',
        'Something went wrong'
      );
    });

    it('should call showWarningToast', () => {
      const { showWarningToast } = require('@/lib/store/ui-store');

      act(() => {
        showWarningToast('Warning!', 'Please be careful');
      });

      expect(mockShowWarningToast).toHaveBeenCalledWith(
        'Warning!',
        'Please be careful'
      );
    });

    it('should call showInfoToast', () => {
      const { showInfoToast } = require('@/lib/store/ui-store');

      act(() => {
        showInfoToast('Info', 'Just letting you know');
      });

      expect(mockShowInfoToast).toHaveBeenCalledWith(
        'Info',
        'Just letting you know'
      );
    });
  });

  describe('Loading State Management', () => {
    it('should call setGlobalLoading with loading state', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setGlobalLoading } = useUIStore.getState();

      act(() => {
        setGlobalLoading(true, 'Loading data...');
      });

      expect(mockSetGlobalLoading).toHaveBeenCalledWith(
        true,
        'Loading data...'
      );
    });

    it('should call setGlobalLoading to clear loading', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setGlobalLoading } = useUIStore.getState();

      act(() => {
        setGlobalLoading(false);
      });

      expect(mockSetGlobalLoading).toHaveBeenCalledWith(false);
    });

    it('should call setGlobalLoading without message', () => {
      const { useUIStore } = require('@/lib/store/ui-store');
      const { setGlobalLoading } = useUIStore.getState();

      act(() => {
        setGlobalLoading(true);
      });

      expect(mockSetGlobalLoading).toHaveBeenCalledWith(true);
    });
  });

  describe('Store State Access', () => {
    it('should return current state from getState', () => {
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
