import React from 'react';
import toast from 'react-hot-toast';

/**
 * Toast notification utility
 * Provides a simple API for showing notifications without using alert()
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

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-center',
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, messages, { ...defaultOptions, ...options });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  custom: (message: React.ReactNode, options?: ToastOptions) => {
    if (message === undefined || message === null) {
      return;
    }
    // react-hot-toast custom method accepts ReactNode directly
    // We need to ensure it's a valid renderable type
    if (typeof message === 'number' || typeof message === 'bigint') {
      toast.custom(String(message), { ...defaultOptions, ...options });
    } else {
      // Type assertion is necessary due to react-hot-toast types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.custom(message as any, { ...defaultOptions, ...options });
    }
  },
};

// Export toast instance for advanced usage
export { toast };
