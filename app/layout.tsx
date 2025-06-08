import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:
    'MADFAM AI Portfolio Builder - Create Stunning Portfolios in 30 Minutes',
  description:
    'Transform your LinkedIn, GitHub and CV into a beautiful portfolio website using AI. No design skills needed. Start free.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
