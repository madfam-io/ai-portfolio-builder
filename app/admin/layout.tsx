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

import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  BarChart3,
  Users,
  CreditCard,
  TestTube2,
  Settings,
  Home,
  TrendingUp,
  FileText,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Admin Dashboard | PRISMA',
  description: 'Admin dashboard for PRISMA portfolio builder',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check authentication and admin role
  const supabase = await createClient();

  if (!supabase) {
    redirect('/auth/signin');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  const adminNavigation = [
    {
      name: 'Overview',
      href: '/admin',
      icon: Home,
      description: 'Admin dashboard overview',
    },
    {
      name: 'Revenue Analytics',
      href: '/admin/revenue',
      icon: TrendingUp,
      description: 'Revenue metrics and insights',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      description: 'User management',
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      description: 'Subscription management',
    },
    {
      name: 'Experiments',
      href: '/admin/experiments',
      icon: TestTube2,
      description: 'A/B testing experiments',
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: FileText,
      description: 'Portfolio & template management',
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
      description: 'Security & audit logs',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System configuration',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Admin Dashboard</span>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">
              {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">← Back to User Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex gap-6 py-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0">
          <nav className="space-y-1">
            {adminNavigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
