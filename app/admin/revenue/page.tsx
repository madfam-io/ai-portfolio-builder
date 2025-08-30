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

import { type Metadata } from 'next';
import { RevenueAnalytics } from '@/components/dashboard/revenue-analytics';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Revenue Analytics | Admin Dashboard',
  description: 'Monitor your business performance and revenue metrics',
};

export default async function AdminRevenuePage() {
  // Check authentication and admin role
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user has admin role
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
    },
  });

  if (profile?.role !== 'ADMIN' && profile?.role !== 'MODERATOR') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <RevenueAnalytics />
    </div>
  );
}
