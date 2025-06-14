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
    <div className={cn(
      'min-h-screen flex flex-col bg-background',
      className
    )}>
      {children}
    </div>
  );
}