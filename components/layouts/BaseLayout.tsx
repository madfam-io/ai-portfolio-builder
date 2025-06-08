'use client';

import { ReactNode } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import { LanguageProvider } from '@/lib/i18n/minimal-context';

interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function BaseLayout({
  children,
  className = '',
}: BaseLayoutProps) {
  return (
    <LanguageProvider>
      <div className={`min-h-screen bg-white dark:bg-gray-900 ${className}`}>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <BackToTopButton />
      </div>
    </LanguageProvider>
  );
}
