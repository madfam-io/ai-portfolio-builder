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

'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface EditorLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * EditorLayout Component
 *
 * Main layout wrapper for the portfolio editor
 * Provides consistent structure and styling
 */
export function EditorLayout({ children, className }: EditorLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      {children}
    </div>
  );
}
