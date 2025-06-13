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
  success: (message: string, _options?: ToastOptions) => {
    console.info(`✅ ${message}`);
    // In production, this would show a toast notification
  },

  error: (message: string, _options?: ToastOptions) => {
    console.error(`❌ ${message}`);
    // In production, this would show a toast notification
  },

  loading: (message: string, _options?: ToastOptions) => {
    console.info(`⏳ ${message}`);
    // Return a mock ID for compatibility
    return `toast-${Date.now()}`;
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
    _options?: ToastOptions
  ) => {
    console.info(`⏳ ${messages.loading}`);

    return promise
      .then(data => {
        const successMsg =
          typeof messages.success === 'function'
            ? messages.success(data)
            : messages.success;
        console.info(`✅ ${successMsg}`);
        return data;
      })
      .catch(err => {
        const errorMsg =
          typeof messages.error === 'function'
            ? messages.error(err)
            : messages.error;
        console.error(`❌ ${errorMsg}`);
        throw err;
      });
  },

  dismiss: (_toastId?: string) => {
    // No-op for console implementation
  },

  custom: (message: React.ReactNode, _options?: ToastOptions) => {
    if (message === undefined || message === null) {
      return;
    }

    // Convert ReactNode to string for console
    let messageStr = '';
    if (typeof message === 'string') {
      messageStr = message;
    } else if (typeof message === 'number' || typeof message === 'bigint') {
      messageStr = String(message);
    } else if (React.isValidElement(message)) {
      // For React elements, just log a placeholder
      messageStr = '[React Component]';
    } else {
      messageStr = String(message);
    }

    console.info(`ℹ️ ${messageStr}`);
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
