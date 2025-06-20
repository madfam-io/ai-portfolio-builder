import { Metadata } from 'next';
import { RevenueAnalytics } from '@/components/dashboard/revenue-analytics';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Revenue Analytics | Admin Dashboard',
  description: 'Monitor your business performance and revenue metrics',
};

export default async function AdminRevenuePage() {
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

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <RevenueAnalytics />
    </div>
  );
}
