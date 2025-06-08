'use client';

import { ReactNode } from 'react';
// import Header from '@/components/landing/Header';
// import Footer from '@/components/landing/Footer';
// import NavigationEnhancer from '@/components/NavigationEnhancer';
// import BackToTopButton from '@/components/BackToTopButton';
// import { MinimalLanguageProvider } from '@/lib/i18n/minimal-context';

interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function BaseLayout({
  children,
  className = '',
}: BaseLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {children}
      {/* <BackToTopButton /> */}
    </div>
  );
}
