import { Inter } from 'next/font/google';
import React, { Suspense } from 'react';

import type { Metadata } from 'next';
import './globals.css';

import { GlobalErrorBoundary } from '@/components/shared/error-boundaries/GlobalErrorBoundary';
import { AppProvider } from '@/lib/contexts/AppContext';
import { LanguageProvider } from '@/lib/i18n/refactored-context';
import { StoreProvider } from '@/lib/store/provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { FeedbackProvider } from '@/components/providers/feedback-provider';
import { initializeAllMonitoring } from '@/lib/monitoring';

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
  // Initialize monitoring systems on app start
  React.useEffect(() => {
    initializeAllMonitoring();
  }, []);

  return (
    <html
      lang="en"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme initialization moved to ThemeScript component below */}
        {/* Stripe */}
        {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <script async src="https://js.stripe.com/v3/"></script>
        )}
      </head>
      <body
        className={`${inter.className} font-sans dark:bg-gray-900 bg-white`}
        suppressHydrationWarning={true}
      >
        <GlobalErrorBoundary>
          <AppProvider>
            <LanguageProvider>
              <StoreProvider>
                <AuthProvider>
                  <Suspense fallback={null}>
                    <PostHogProvider>
                      <FeedbackProvider>
                        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                          {children}
                        </div>
                      </FeedbackProvider>
                    </PostHogProvider>
                  </Suspense>
                </AuthProvider>
              </StoreProvider>
            </LanguageProvider>
          </AppProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
