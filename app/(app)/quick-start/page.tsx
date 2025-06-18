/**
 * Quick Start Page
 *
 * Allows users to quickly create a portfolio from templates
 */

import { Metadata } from 'next';
import { QuickStartGallery } from '@/components/demo/QuickStartGallery';
import { QuickStartHeader } from '@/components/demo/QuickStartHeader';
import { createClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation'; // Currently unused

export const metadata: Metadata = {
  title: 'Quick Start - Choose Your Template | PRISMA',
  description:
    'Get started quickly with our professionally designed portfolio templates. Choose your industry and customize your portfolio in minutes.',
};

export default async function QuickStartPage() {
  // Check if user is authenticated
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile for recommendations
  let userProfile;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('industry, experience_level, goals')
      .eq('id', user.id)
      .single();

    userProfile = profile
      ? {
          industry: profile.industry,
          experience: profile.experience_level,
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
