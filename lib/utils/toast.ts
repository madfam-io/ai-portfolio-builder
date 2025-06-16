import React from 'react';

/**
 * Toast notification utility
 * Provides a simple API for showing notifications without external dependencies
 */

interface ToastOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

// Simple console-based implementation for now
// In production, this would integrate with a proper notification system
export const showToast = {
  success: (_message: string, _options?: ToastOptions) => {
    // In production, this would show a toast notification
  },

  error: (_message: string, _options?: ToastOptions) => {
    // In production, this would show a toast notification
  },

  loading: (_message: string, _options?: ToastOptions) => {
    // Return a mock ID for compatibility
    return `toast-${Date.now()}`;
  },

  promise: <T>(
    promise: Promise<T>,
    _messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
    _options?: ToastOptions
  ) => {
    return promise
      .then(data => {
        // In production, would show success toast
        return data;
      })
      .catch(err => {
        // In production, would show error toast
        throw err;
      });
  },

  dismiss: (_toastId?: string) => {
    // No-op for console implementation
  },

  custom: (_message: React.ReactNode, _options?: ToastOptions) => {
    // In production, this would show a custom toast notification
  },
};

// Export a mock toast object for compatibility
export const toast = {
  success: showToast.success,
  error: showToast.error,
  loading: showToast.loading,
  promise: showToast.promise,
  dismiss: showToast.dismiss,
  custom: showToast.custom,
};
