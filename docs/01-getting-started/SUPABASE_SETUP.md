# 🚀 Supabase Setup Guide

This guide will help you set up Supabase for the PRISMA AI Portfolio Builder.

## Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- Access to the project repository

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Fill in the project details:
   - **Name**: `prisma-portfolio-builder`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

## Step 2: Get Your API Keys

Once your project is created:

1. Go to Settings → API
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update the Supabase values in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Step 4: Set Up Database Schema

### Option A: Using Supabase Dashboard

1. Go to SQL Editor in your Supabase dashboard
2. Create the portfolios table:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  template VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  data JSONB NOT NULL DEFAULT '{}',
  custom_domain VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_status ON portfolios(status);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Public portfolios can be viewed by anyone
CREATE POLICY "Published portfolios are publicly viewable" ON portfolios
  FOR SELECT USING (status = 'published');
```

### Option B: Using Migration Files

1. Install Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase:

   ```bash
   supabase init
   ```

3. Link to your project:

   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## Step 5: Configure Authentication

### Enable Auth Providers

1. Go to Authentication → Providers
2. Enable Email provider (already enabled by default)
3. Configure OAuth providers:

#### GitHub OAuth

1. Enable GitHub provider
2. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Create GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Copy Client ID and Secret to Supabase

#### LinkedIn OAuth

1. Enable LinkedIn provider
2. Follow similar steps as GitHub

## Step 6: Set Up Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `avatars`:

   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('avatars', 'avatars', true);
   ```

3. Create a bucket for portfolio assets:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('portfolio-assets', 'portfolio-assets', true);
   ```

## Step 7: Test Your Setup

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Test authentication:

   - Try signing up with email
   - Test OAuth providers if configured

3. Check the Supabase dashboard:
   - Authentication → Users (should show new users)
   - Table Editor → portfolios (ready for data)

## Troubleshooting

### Common Issues

1. **"Invalid API key"**

   - Double-check your environment variables
   - Ensure no extra spaces in keys
   - Restart your dev server

2. **"Database connection failed"**

   - Check if your project is paused (free tier pauses after 1 week)
   - Verify your project URL is correct

3. **"Permission denied"**
   - Check RLS policies are set up correctly
   - Ensure user is authenticated

### Useful Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase db logs

# Reset database
supabase db reset
```

## Next Steps

1. Set up real-time subscriptions for collaborative features
2. Configure edge functions for server-side logic
3. Set up database backups
4. Configure custom domains

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/with-nextjs)
