import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

import { GlobalErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AppProvider } from '@/lib/contexts/AppContext';
import { LanguageProvider } from '@/lib/i18n/refactored-context';
import { StoreProvider } from '@/lib/store/provider';

import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://prisma.madfam.io'
  ),
  title: 'PRISMA by MADFAM - AI Portfolio Builder',
  description:
    'Transform your CV into a stunning portfolio website using AI. Create professional portfolios in under 30 minutes.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'PRISMA by MADFAM - AI Portfolio Builder',
    description: 'Transform your CV into a stunning portfolio website using AI',
    images: ['/prisma-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check UI store for theme preference
                  var uiStore = localStorage.getItem('ui-store');
                  var theme = 'dark'; // default
                  
                  if (uiStore) {
                    try {
                      var parsed = JSON.parse(uiStore);
                      if (parsed.state && parsed.state.theme) {
                        theme = parsed.state.theme;
                      }
                    } catch (e) {}
                  }
                  
                  // Apply theme
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {
                  // Default to dark mode if localStorage is not available
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} font-sans dark:bg-gray-900 bg-white`}
        suppressHydrationWarning={true}
      >
        <GlobalErrorBoundary
          showDetails={process.env.NODE_ENV === 'development'}
          allowRetry={true}
          maxRetries={3}
        >
          <AppProvider>
            <LanguageProvider>
              <StoreProvider>
                <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                  {children}
                </div>
              </StoreProvider>
            </LanguageProvider>
          </AppProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
