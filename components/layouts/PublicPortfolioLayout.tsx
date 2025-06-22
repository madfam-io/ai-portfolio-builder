/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { ReactNode } from 'react';

interface PublicPortfolioLayoutProps {
  children: ReactNode;
}

export default function PublicPortfolioLayout({
  children,
}: PublicPortfolioLayoutProps) {
  return (
    <>
      {/* Public portfolio doesn't include the main app navigation */}
      <main className="min-h-screen">{children}</main>

      {/* Optional: Add a subtle "Powered by PRISMA" footer */}
      <footer className="py-4 text-center border-t bg-background/50 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <a
            href="https://prisma.madfam.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            PRISMA
          </a>{' '}
          · Create your own portfolio
        </p>
      </footer>
    </>
  );
}
