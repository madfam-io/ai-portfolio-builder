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
        duration: options.duration !== undefined ? options.duration : 5000,
      });
    },
    [showToast]
  );

  return { toast };
}
