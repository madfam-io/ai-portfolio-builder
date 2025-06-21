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
 * Toast utility - simple implementation for the new features
 * This can be enhanced with a proper toast library later
 */

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast(options: ToastOptions): void {
  // Simple console implementation for now
  // In a real app, this would integrate with a toast library like sonner or react-hot-toast
  if (options.variant === 'destructive') {
    // eslint-disable-next-line no-console
    console.error(`${options.title}: ${options.description || ''}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`${options.title}: ${options.description || ''}`);
  }

  // You can replace this with actual toast implementation
  if (typeof window !== 'undefined') {
    // Simple browser notification as fallback
    if (options.variant === 'destructive') {
      // eslint-disable-next-line no-alert
      alert(`Error: ${options.title}`);
    }
  }
}
