/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import * as React from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});
ToastAction.displayName = 'ToastAction';

export interface ToastActionElement
  extends React.ReactElement<typeof ToastAction> {}

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(toasts => [...toasts, { ...toast, id }]);
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    setToasts(toasts => toasts.filter(t => t.id !== toastId));
  }, []);

  return { toast, toasts, dismiss };
};
