-- Initial database schema for PRISMA Portfolio Builder
-- Author: MADFAM Development Team
-- Date: 2025-01-09

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type template_type as enum (
  'developer',
  'designer', 
  'consultant',
  'educator',
  'creative',
  'business'
);

create type portfolio_status as enum (
  'draft',
  'published', 
  'archived'
);

create type skill_level as enum (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

create type enhancement_tone as enum (
  'professional',
  'casual',
  'creative'
);

create type enhancement_length as enum (
  'concise',
  'detailed',
  'comprehensive'
);

-- Create users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  
  -- Subscription info
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'business')),
  subscription_status text default 'active' check (subscription_status in ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamp with time zone,
  
  -- Usage tracking
  portfolio_count integer default 0,
  ai_requests_count integer default 0,
  ai_requests_reset_at timestamp with time zone default now(),
  
  -- Preferences
  preferred_language text default 'es' check (preferred_language in ('es', 'en')),
  preferred_currency text default 'MXN' check (preferred_currency in ('MXN', 'USD', 'EUR')),
  timezone text default 'America/Mexico_City',
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create portfolios table
create table public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  
  -- Basic information
  name text not null,
  title text not null,
  bio text default '',
  tagline text,
  avatar_url text,
  
  -- Contact information (JSONB for flexibility)
  contact jsonb default '{}' not null,
  social jsonb default '{}' not null,
  
  -- Professional content (JSONB arrays)
  experience jsonb default '[]' not null,
  education jsonb default '[]' not null,
  projects jsonb default '[]' not null,
  skills jsonb default '[]' not null,
  certifications jsonb default '[]' not null,
  
  -- Template and customization
  template template_type not null default 'developer',
  customization jsonb default '{}' not null,
  
  -- AI enhancement settings
  ai_settings jsonb default '{
    "enhanceBio": true,
    "enhanceProjectDescriptions": true,
    "generateSkillsFromExperience": false,
    "tone": "professional",
    "targetLength": "detailed"
  }' not null,
  
  -- Publishing settings
  status portfolio_status default 'draft' not null,
  subdomain text unique,
  custom_domain text unique,
  
  -- SEO and metadata
  meta_title text,
  meta_description text,
  og_image_url text,
  
  -- Analytics
  views integer default 0 not null,
  last_viewed_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  published_at timestamp with time zone,
  
  -- Constraints
  constraint valid_subdomain check (
    subdomain ~* '^[a-z0-9][a-z0-9-]*[a-z0-9]$' and
    length(subdomain) between 3 and 63
  ),
  constraint valid_custom_domain check (
    custom_domain ~* '^[a-z0-9][a-z0-9.-]*[a-z0-9]$' and
    length(custom_domain) between 4 and 253
  )
);

-- Create AI enhancement logs table
create table public.ai_enhancement_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  
  -- Enhancement details
  enhancement_type text not null check (enhancement_type in ('bio', 'project', 'skills')),
  model_used text not null,
  input_text text not null,
  output_text text not null,
  
  -- Metadata
  confidence_score decimal(3,2),
  processing_time_ms integer,
  cost_credits decimal(10,4),
  
  -- Settings used
  settings jsonb default '{}' not null,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null
);

-- Create file uploads table
create table public.file_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  
  -- File details
  filename text not null,
  file_path text not null,
  file_size integer not null,
  mime_type text not null,
  file_type text not null check (file_type in ('avatar', 'project_image', 'cv', 'document')),
  
  -- Processing status
  processing_status text default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'error')),
  processing_error text,
  
  -- Extracted data (for CV parsing)
  extracted_data jsonb,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create portfolio analytics table
create table public.portfolio_analytics (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  
  -- Visitor information
  visitor_id text, -- Anonymous visitor tracking
  ip_address inet,
  user_agent text,
  referrer text,
  
  -- Geographic data
  country text,
  region text,
  city text,
  
  -- Visit details
  pages_viewed integer default 1,
  time_spent_seconds integer,
  session_id text,
  
  -- Device information
  device_type text, -- mobile, tablet, desktop
  browser text,
  os text,
  
  -- Timestamps
  visited_at timestamp with time zone default now() not null
);

-- Create subscription plans table
create table public.subscription_plans (
  id text primary key,
  name text not null,
  description text,
  
  -- Pricing
  price_monthly decimal(10,2) not null,
  price_yearly decimal(10,2),
  currency text default 'USD' not null,
  
  -- Limits
  max_portfolios integer not null,
  max_ai_requests_monthly integer not null,
  features jsonb default '[]' not null,
  
  -- Status
  active boolean default true not null,
  sort_order integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Insert default subscription plans
insert into public.subscription_plans (id, name, description, price_monthly, price_yearly, max_portfolios, max_ai_requests_monthly, features) values
  ('free', 'Free', 'Perfect for getting started', 0.00, 0.00, 1, 10, '["1 Portfolio", "Basic Templates", "PRISMA Subdomain", "Basic AI Enhancement"]'),
  ('pro', 'PRO', 'For serious professionals', 19.99, 199.99, 5, 100, '["5 Portfolios", "All Templates", "Custom Domain", "Advanced AI Features", "Analytics", "Priority Support"]'),
  ('business', 'PRISMA+', 'For teams and agencies', 49.99, 499.99, -1, 500, '["Unlimited Portfolios", "White Label", "Team Collaboration", "API Access", "Advanced Analytics", "Custom Integrations"]');

-- Create indexes for performance
create index idx_portfolios_user_id on public.portfolios(user_id);
create index idx_portfolios_status on public.portfolios(status);
create index idx_portfolios_subdomain on public.portfolios(subdomain) where subdomain is not null;
create index idx_portfolios_custom_domain on public.portfolios(custom_domain) where custom_domain is not null;
create index idx_portfolios_published_at on public.portfolios(published_at) where published_at is not null;

create index idx_ai_enhancement_logs_user_id on public.ai_enhancement_logs(user_id);
create index idx_ai_enhancement_logs_portfolio_id on public.ai_enhancement_logs(portfolio_id);
create index idx_ai_enhancement_logs_created_at on public.ai_enhancement_logs(created_at);

create index idx_file_uploads_user_id on public.file_uploads(user_id);
create index idx_file_uploads_portfolio_id on public.file_uploads(portfolio_id);
create index idx_file_uploads_processing_status on public.file_uploads(processing_status);

create index idx_portfolio_analytics_portfolio_id on public.portfolio_analytics(portfolio_id);
create index idx_portfolio_analytics_visited_at on public.portfolio_analytics(visited_at);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_users_updated_at before update on public.users for each row execute function update_updated_at_column();
create trigger update_portfolios_updated_at before update on public.portfolios for each row execute function update_updated_at_column();
create trigger update_file_uploads_updated_at before update on public.file_uploads for each row execute function update_updated_at_column();
create trigger update_subscription_plans_updated_at before update on public.subscription_plans for each row execute function update_updated_at_column();

-- Create function to increment portfolio views
create or replace function increment_portfolio_views(portfolio_uuid uuid)
returns void as $$
begin
  update public.portfolios 
  set views = views + 1, last_viewed_at = now()
  where id = portfolio_uuid;
end;
$$ language plpgsql security definer;

-- Create function to update user portfolio count
create or replace function update_user_portfolio_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.users 
    set portfolio_count = portfolio_count + 1
    where id = new.user_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.users 
    set portfolio_count = portfolio_count - 1
    where id = old.user_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Create trigger for portfolio count
create trigger update_portfolio_count 
  after insert or delete on public.portfolios 
  for each row execute function update_user_portfolio_count();

-- Row Level Security (RLS) policies
alter table public.users enable row level security;
alter table public.portfolios enable row level security;
alter table public.ai_enhancement_logs enable row level security;
alter table public.file_uploads enable row level security;
alter table public.portfolio_analytics enable row level security;

-- Users can only see and update their own record
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Portfolio policies
create policy "Users can view own portfolios" on public.portfolios for select using (auth.uid() = user_id);
create policy "Users can create portfolios" on public.portfolios for insert with check (auth.uid() = user_id);
create policy "Users can update own portfolios" on public.portfolios for update using (auth.uid() = user_id);
create policy "Users can delete own portfolios" on public.portfolios for delete using (auth.uid() = user_id);

-- Public can view published portfolios
create policy "Anyone can view published portfolios" on public.portfolios for select using (status = 'published');

-- AI enhancement logs policies
create policy "Users can view own AI logs" on public.ai_enhancement_logs for select using (auth.uid() = user_id);
create policy "Users can create AI logs" on public.ai_enhancement_logs for insert with check (auth.uid() = user_id);

-- File upload policies
create policy "Users can view own files" on public.file_uploads for select using (auth.uid() = user_id);
create policy "Users can upload files" on public.file_uploads for insert with check (auth.uid() = user_id);
create policy "Users can update own files" on public.file_uploads for update using (auth.uid() = user_id);
create policy "Users can delete own files" on public.file_uploads for delete using (auth.uid() = user_id);

-- Analytics policies (allow inserts for tracking, restricted selects)
create policy "Anyone can create analytics" on public.portfolio_analytics for insert with check (true);
create policy "Portfolio owners can view analytics" on public.portfolio_analytics for select using (
  exists (
    select 1 from public.portfolios 
    where portfolios.id = portfolio_analytics.portfolio_id 
    and portfolios.user_id = auth.uid()
  )
);

-- Subscription plans are public (read-only)
create policy "Anyone can view subscription plans" on public.subscription_plans for select using (true);

-- Create user profile function (called after signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to postgres, authenticated, service_role;
grant execute on all functions in schema public to postgres, authenticated, service_role;