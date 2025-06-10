import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/contexts/AppContext';
import { GlobalErrorBoundary } from '@/components/shared/ErrorBoundary';

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
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Default to dark mode
                    document.documentElement.classList.add('dark');
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
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
              {children}
            </div>
          </AppProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
