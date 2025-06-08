import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
