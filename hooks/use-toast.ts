import { useCallback } from 'react';
import { useUIStore } from '@/lib/store/ui-store';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

/**
 * Toast hook that integrates with the UI store
 */
export function useToast() {
  const { showToast } = useUIStore();

  const toast = useCallback(
    (options: ToastOptions) => {
      showToast({
        title: options.title,
        description: options.description,
        type: options.variant === 'destructive' ? 'error' : 'success',
        duration: options.duration || 5000,
      });
    },
    [showToast]
  );

  return { toast };
}