import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/contexts/AppContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MADFAM AI Portfolio Builder',
  description: 'Transform your CV into a beautiful portfolio website using AI.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans`} suppressHydrationWarning={true}>
        <AppProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
