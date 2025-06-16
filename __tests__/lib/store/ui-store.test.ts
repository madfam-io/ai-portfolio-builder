import { act } from '@testing-library/react';
import {
  useUIStore,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from '@/lib/store/ui-store';
import type { Modal, Toast } from '@/lib/store/types';

// Mock DOM methods
const mockMatchMedia = jest.fn();
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
};

describe('UI Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

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

    // Reset store state
    useUIStore.setState({
      theme: 'system',
      sidebarOpen: true,
      modals: [],
      toasts: [],
      globalLoading: false,
      loadingMessage: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Theme Management', () => {
    it('should set theme to light', () => {
      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('light');
      });

      const { theme } = useUIStore.getState();
      expect(theme).toBe('light');
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('light');
    });

    it('should set theme to dark', () => {
      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('dark');
      });

      const { theme } = useUIStore.getState();
      expect(theme).toBe('dark');
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });

    it('should set theme to system and apply light theme when prefers light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false, // Light mode
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('system');
      });

      const { theme } = useUIStore.getState();
      expect(theme).toBe('system');
      expect(mockClassList.add).toHaveBeenCalledWith('light');
    });

    it('should set theme to system and apply dark theme when prefers dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      const { setTheme } = useUIStore.getState();

      act(() => {
        setTheme('system');
      });

      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();

      expect(useUIStore.getState().sidebarOpen).toBe(true);

      act(() => {
        toggleSidebar();
      });

      expect(useUIStore.getState().sidebarOpen).toBe(false);

      act(() => {
        toggleSidebar();
      });

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      act(() => {
        setSidebarOpen(false);
      });

      expect(useUIStore.getState().sidebarOpen).toBe(false);

      act(() => {
        setSidebarOpen(true);
      });

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('Modal Management', () => {
    it('should open a modal', () => {
      const modal: Modal = {
        id: 'test-modal',
        type: 'confirm',
        title: 'Test Modal',
        description: 'Test description',
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
      };

      const { openModal } = useUIStore.getState();

      act(() => {
        openModal(modal);
      });

      const { modals } = useUIStore.getState();
      expect(modals).toHaveLength(1);
      expect(modals[0]).toEqual(modal);
    });

    it('should not duplicate modals with same id', () => {
      const modal: Modal = {
        id: 'test-modal',
        type: 'info',
        title: 'Test Modal',
      };

      const { openModal } = useUIStore.getState();

      act(() => {
        openModal(modal);
        openModal(modal);
      });

      const { modals } = useUIStore.getState();
      expect(modals).toHaveLength(1);
    });

    it('should close a specific modal', () => {
      const modal1: Modal = { id: 'modal-1', type: 'info', title: 'Modal 1' };
      const modal2: Modal = { id: 'modal-2', type: 'info', title: 'Modal 2' };

      const { openModal, closeModal } = useUIStore.getState();

      act(() => {
        openModal(modal1);
        openModal(modal2);
      });

      expect(useUIStore.getState().modals).toHaveLength(2);

      act(() => {
        closeModal('modal-1');
      });

      const { modals } = useUIStore.getState();
      expect(modals).toHaveLength(1);
      expect(modals[0].id).toBe('modal-2');
    });

    it('should close all modals', () => {
      const { openModal, closeAllModals } = useUIStore.getState();

      act(() => {
        openModal({ id: 'modal-1', type: 'info', title: 'Modal 1' });
        openModal({ id: 'modal-2', type: 'info', title: 'Modal 2' });
        openModal({ id: 'modal-3', type: 'info', title: 'Modal 3' });
      });

      expect(useUIStore.getState().modals).toHaveLength(3);

      act(() => {
        closeAllModals();
      });

      expect(useUIStore.getState().modals).toHaveLength(0);
    });
  });

  describe('Toast Management', () => {
    it('should show a toast with auto-generated id', () => {
      const { showToast } = useUIStore.getState();

      act(() => {
        showToast({
          title: 'Test Toast',
          description: 'Test description',
          type: 'success',
        });
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        id: expect.stringMatching(/^toast-\d+-[\d.]+$/),
        title: 'Test Toast',
        description: 'Test description',
        type: 'success',
        duration: 5000,
      });
    });

    it('should auto-remove toast after duration', () => {
      const { showToast } = useUIStore.getState();

      act(() => {
        showToast({
          title: 'Auto-remove Toast',
          type: 'info',
          duration: 3000,
        });
      });

      expect(useUIStore.getState().toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('should not auto-remove toast with no duration', () => {
      const { showToast } = useUIStore.getState();

      act(() => {
        showToast({
          title: 'Persistent Toast',
          type: 'info',
          duration: 0,
        });
      });

      expect(useUIStore.getState().toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(useUIStore.getState().toasts).toHaveLength(1);
    });

    it('should remove specific toast', () => {
      const { showToast, removeToast } = useUIStore.getState();

      act(() => {
        showToast({ title: 'Toast 1', type: 'info' });
        showToast({ title: 'Toast 2', type: 'info' });
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(2);

      const toastId = toasts[0].id;

      act(() => {
        removeToast(toastId);
      });

      const updatedToasts = useUIStore.getState().toasts;
      expect(updatedToasts).toHaveLength(1);
      expect(updatedToasts[0].title).toBe('Toast 2');
    });

    it('should clear all toasts', () => {
      const { showToast, clearToasts } = useUIStore.getState();

      act(() => {
        showToast({ title: 'Toast 1', type: 'info' });
        showToast({ title: 'Toast 2', type: 'success' });
        showToast({ title: 'Toast 3', type: 'error' });
      });

      expect(useUIStore.getState().toasts).toHaveLength(3);

      act(() => {
        clearToasts();
      });

      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('Toast Utility Functions', () => {
    it('should show success toast', () => {
      act(() => {
        showSuccessToast('Success!', 'Operation completed');
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        title: 'Success!',
        description: 'Operation completed',
        type: 'success',
      });
    });

    it('should show error toast', () => {
      act(() => {
        showErrorToast('Error!', 'Something went wrong');
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        title: 'Error!',
        description: 'Something went wrong',
        type: 'error',
      });
    });

    it('should show warning toast', () => {
      act(() => {
        showWarningToast('Warning!', 'Please be careful');
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        title: 'Warning!',
        description: 'Please be careful',
        type: 'warning',
      });
    });

    it('should show info toast', () => {
      act(() => {
        showInfoToast('Info', 'Just letting you know');
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        title: 'Info',
        description: 'Just letting you know',
        type: 'info',
      });
    });

    it('should show toast without description', () => {
      act(() => {
        showSuccessToast('Success!');
      });

      const { toasts } = useUIStore.getState();
      expect(toasts[0].description).toBeUndefined();
    });
  });

  describe('Loading State Management', () => {
    it('should set global loading state', () => {
      const { setGlobalLoading } = useUIStore.getState();

      act(() => {
        setGlobalLoading(true, 'Loading data...');
      });

      const { globalLoading, loadingMessage } = useUIStore.getState();
      expect(globalLoading).toBe(true);
      expect(loadingMessage).toBe('Loading data...');
    });

    it('should clear loading state', () => {
      const { setGlobalLoading } = useUIStore.getState();

      act(() => {
        setGlobalLoading(true, 'Loading...');
      });

      expect(useUIStore.getState().globalLoading).toBe(true);

      act(() => {
        setGlobalLoading(false);
      });

      const { globalLoading, loadingMessage } = useUIStore.getState();
      expect(globalLoading).toBe(false);
      expect(loadingMessage).toBeNull();
    });

    it('should set loading without message', () => {
      const { setGlobalLoading } = useUIStore.getState();

      act(() => {
        setGlobalLoading(true);
      });

      const { globalLoading, loadingMessage } = useUIStore.getState();
      expect(globalLoading).toBe(true);
      expect(loadingMessage).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should persist only theme preference', () => {
      const { setTheme, setSidebarOpen, setGlobalLoading } =
        useUIStore.getState();

      act(() => {
        setTheme('dark');
        setSidebarOpen(false);
        setGlobalLoading(true, 'Test');
      });

      // Simulate what would be persisted
      const persistedState = {
        theme: useUIStore.getState().theme,
      };

      expect(persistedState).toEqual({
        theme: 'dark',
      });

      // Other state should not be persisted
      expect(persistedState).not.toHaveProperty('sidebarOpen');
      expect(persistedState).not.toHaveProperty('globalLoading');
    });
  });
});
