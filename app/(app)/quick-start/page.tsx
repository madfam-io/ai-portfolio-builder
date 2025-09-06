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

/**
 * Quick Start Page
 *
 * Allows users to quickly create a portfolio from templates
 */

import { type Metadata } from 'next';
import { QuickStartGallery } from '@/components/demo/QuickStartGallery';
import { QuickStartHeader } from '@/components/demo/QuickStartHeader';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export const metadata: Metadata = {
  title: 'Quick Start - Choose Your Template | Portfolio Builder',
  description:
    'Get started quickly with our professionally designed portfolio templates. Choose your industry and customize your portfolio in minutes.',
};

export default async function QuickStartPage() {
  // Check if user is authenticated
  const currentUser = await getCurrentUser();
  
  // Transform user object to match expected interface
  const user = currentUser ? {
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name || undefined,
    image: currentUser.image || undefined,
  } : null;

  // Get user profile for recommendations
  let userProfile;
  if (currentUser) {
    const profile = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        industry: true,
        experienceLevel: true,
        goals: true,
      },
    });

    userProfile = profile
      ? {
          industry: profile.industry || undefined,
          experience: profile.experienceLevel || undefined,
          goals: profile.goals,
        }
      : undefined;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <QuickStartHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <QuickStartGallery showTitle={true} userProfile={userProfile} />
      </main>
    </div>
  );
}
