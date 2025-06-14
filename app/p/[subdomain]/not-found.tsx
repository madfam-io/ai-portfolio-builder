import Link from 'next/link';
import { Home, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-2xl font-semibold mt-4">Portfolio Not Found</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            The portfolio you're looking for doesn't exist or has been unpublished.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/portfolios">
              <Search className="mr-2 h-4 w-4" />
              Browse Portfolios
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-muted/50 max-w-md mx-auto">
          <p className="text-sm font-medium mb-2">Create Your Own Portfolio</p>
          <p className="text-sm text-muted-foreground mb-4">
            Join PRISMA and build your professional portfolio in minutes.
          </p>
          <Button size="sm" asChild className="w-full">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}