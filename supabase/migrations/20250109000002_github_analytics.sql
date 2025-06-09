-- GitHub Analytics Schema for PRISMA Portfolio Builder
-- Author: PRISMA Development Team
-- Date: 2025-01-09
-- Description: Database schema for enterprise GitHub analytics feature

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Create enums for GitHub analytics
create type github_integration_status as enum (
  'active',
  'inactive',
  'expired',
  'revoked'
);

create type repository_visibility as enum (
  'public',
  'private',
  'internal'
);

create type pull_request_state as enum (
  'open',
  'closed',
  'merged'
);

-- GitHub integrations table
-- Stores OAuth tokens and integration settings
create table public.github_integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  
  -- GitHub OAuth details
  github_user_id bigint unique,
  github_username text,
  access_token text, -- Will be encrypted in production
  refresh_token text, -- Will be encrypted in production
  token_expires_at timestamp with time zone,
  
  -- Integration settings
  status github_integration_status default 'active' not null,
  permissions jsonb default '{}' not null,
  scope text,
  
  -- Rate limit tracking
  rate_limit_remaining integer default 5000,
  rate_limit_reset_at timestamp with time zone,
  
  -- Timestamps
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Repositories table
-- Stores GitHub repository information
create table public.repositories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  github_integration_id uuid references public.github_integrations(id) on delete cascade not null,
  
  -- GitHub repository details
  github_id bigint unique not null,
  owner text not null,
  name text not null,
  full_name text not null,
  description text,
  homepage text,
  
  -- Repository metadata
  visibility repository_visibility default 'public' not null,
  default_branch text default 'main',
  language text,
  topics text[],
  size_kb integer,
  stargazers_count integer default 0,
  watchers_count integer default 0,
  forks_count integer default 0,
  open_issues_count integer default 0,
  
  -- Configuration
  is_active boolean default true,
  sync_enabled boolean default true,
  webhook_secret text,
  
  -- Additional metadata
  metadata jsonb default '{}' not null,
  
  -- Timestamps
  github_created_at timestamp with time zone,
  github_updated_at timestamp with time zone,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Indexes
  index idx_repositories_user_id (user_id),
  index idx_repositories_full_name (full_name),
  unique(user_id, github_id)
);

-- Code metrics table
-- Stores daily snapshots of code metrics
create table public.code_metrics (
  id uuid default uuid_generate_v4() primary key,
  repository_id uuid references public.repositories(id) on delete cascade not null,
  
  -- Metric date
  metric_date date not null,
  
  -- Lines of Code metrics
  loc_total integer,
  loc_by_language jsonb default '{}', -- {"javascript": 1000, "typescript": 500}
  file_count integer,
  
  -- Code quality metrics (Phase 1 - basic)
  commit_count integer,
  contributor_count integer,
  
  -- Activity metrics
  commits_last_30_days integer,
  contributors_last_30_days integer,
  
  -- Timestamps
  calculated_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  
  -- Ensure one metric per day per repository
  unique(repository_id, metric_date),
  index idx_code_metrics_date (metric_date)
);

-- Pull requests table
-- Stores pull request information and metrics
create table public.pull_requests (
  id uuid default uuid_generate_v4() primary key,
  repository_id uuid references public.repositories(id) on delete cascade not null,
  
  -- GitHub PR details
  github_pr_id bigint not null,
  number integer not null,
  title text,
  body text,
  author_login text,
  author_avatar_url text,
  
  -- PR state
  state pull_request_state not null,
  draft boolean default false,
  
  -- Metrics
  additions integer default 0,
  deletions integer default 0,
  changed_files integer default 0,
  commits integer default 0,
  review_comments integer default 0,
  
  -- Time tracking
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  merged_at timestamp with time zone,
  closed_at timestamp with time zone,
  
  -- Calculated metrics
  first_review_at timestamp with time zone,
  lead_time_hours float, -- Time from first commit to merge
  cycle_time_hours float, -- Time from PR creation to merge
  time_to_first_review_hours float,
  
  -- Labels and metadata
  labels jsonb default '[]',
  metadata jsonb default '{}',
  
  -- Ensure uniqueness
  unique(repository_id, github_pr_id),
  index idx_pull_requests_number (repository_id, number),
  index idx_pull_requests_created (created_at),
  index idx_pull_requests_state (state)
);

-- Contributors table
-- Stores contributor information
create table public.contributors (
  id uuid default uuid_generate_v4() primary key,
  
  -- GitHub user details
  github_id bigint unique not null,
  login text unique not null,
  name text,
  email text,
  avatar_url text,
  company text,
  location text,
  bio text,
  
  -- Contribution tracking
  public_repos integer,
  followers integer,
  following integer,
  
  -- Timestamps
  github_created_at timestamp with time zone,
  last_seen_at timestamp with time zone default now(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  index idx_contributors_login (login)
);

-- Repository contributors junction table
-- Links repositories to contributors with metrics
create table public.repository_contributors (
  id uuid default uuid_generate_v4() primary key,
  repository_id uuid references public.repositories(id) on delete cascade not null,
  contributor_id uuid references public.contributors(id) on delete cascade not null,
  
  -- Contribution metrics
  commit_count integer default 0,
  additions integer default 0,
  deletions integer default 0,
  
  -- Time-based metrics
  first_commit_at timestamp with time zone,
  last_commit_at timestamp with time zone,
  
  -- Activity tracking
  is_active boolean default true,
  commits_last_30_days integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  unique(repository_id, contributor_id),
  index idx_repo_contributors_activity (repository_id, is_active)
);

-- Commit analytics table (lightweight for Phase 1)
-- Stores aggregated commit data
create table public.commit_analytics (
  id uuid default uuid_generate_v4() primary key,
  repository_id uuid references public.repositories(id) on delete cascade not null,
  
  -- Date for aggregation
  commit_date date not null,
  
  -- Aggregated metrics
  commit_count integer default 0,
  unique_authors integer default 0,
  additions integer default 0,
  deletions integer default 0,
  
  -- Peak activity
  peak_hour integer, -- 0-23
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  
  unique(repository_id, commit_date),
  index idx_commit_analytics_date (commit_date)
);

-- Analytics cache table
-- Stores pre-calculated analytics for performance
create table public.analytics_cache (
  id uuid default uuid_generate_v4() primary key,
  cache_key text unique not null,
  cache_type text not null, -- 'dashboard', 'repository', 'contributor'
  repository_id uuid references public.repositories(id) on delete cascade,
  
  -- Cached data
  data jsonb not null,
  
  -- Cache management
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null,
  
  index idx_analytics_cache_type (cache_type),
  index idx_analytics_cache_expires (expires_at)
);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_github_integrations_updated_at
  before update on public.github_integrations
  for each row
  execute function update_updated_at_column();

create trigger update_repositories_updated_at
  before update on public.repositories
  for each row
  execute function update_updated_at_column();

create trigger update_contributors_updated_at
  before update on public.contributors
  for each row
  execute function update_updated_at_column();

create trigger update_repository_contributors_updated_at
  before update on public.repository_contributors
  for each row
  execute function update_updated_at_column();

-- Row Level Security (RLS) policies
alter table public.github_integrations enable row level security;
alter table public.repositories enable row level security;
alter table public.code_metrics enable row level security;
alter table public.pull_requests enable row level security;
alter table public.repository_contributors enable row level security;
alter table public.commit_analytics enable row level security;
alter table public.analytics_cache enable row level security;

-- GitHub integrations policies
create policy "Users can view their own GitHub integrations"
  on public.github_integrations for select
  using (auth.uid() = user_id);

create policy "Users can create their own GitHub integrations"
  on public.github_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own GitHub integrations"
  on public.github_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own GitHub integrations"
  on public.github_integrations for delete
  using (auth.uid() = user_id);

-- Repositories policies
create policy "Users can view their own repositories"
  on public.repositories for select
  using (auth.uid() = user_id);

create policy "Users can create their own repositories"
  on public.repositories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own repositories"
  on public.repositories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own repositories"
  on public.repositories for delete
  using (auth.uid() = user_id);

-- Code metrics policies
create policy "Users can view metrics for their repositories"
  on public.code_metrics for select
  using (exists (
    select 1 from public.repositories r
    where r.id = repository_id and r.user_id = auth.uid()
  ));

create policy "Users can create metrics for their repositories"
  on public.code_metrics for insert
  with check (exists (
    select 1 from public.repositories r
    where r.id = repository_id and r.user_id = auth.uid()
  ));

-- Pull requests policies
create policy "Users can view PRs for their repositories"
  on public.pull_requests for select
  using (exists (
    select 1 from public.repositories r
    where r.id = repository_id and r.user_id = auth.uid()
  ));

create policy "Users can create PRs for their repositories"
  on public.pull_requests for insert
  with check (exists (
    select 1 from public.repositories r
    where r.id = repository_id and r.user_id = auth.uid()
  ));

-- Repository contributors policies
create policy "Users can view contributors for their repositories"
  on public.repository_contributors for select
  using (exists (
    select 1 from public.repositories r
    where r.id = repository_id and r.user_id = auth.uid()
  ));

-- Commit analytics policies
create policy "Users can view commit analytics for their repositories"
  on public.commit_analytics for select
  using (exists (
    select 1 from public.repositories r
    where r.id = repository_id and r.user_id = auth.uid()
  ));

-- Analytics cache policies
create policy "Users can view cached analytics for their repositories"
  on public.analytics_cache for select
  using (
    repository_id is null or
    exists (
      select 1 from public.repositories r
      where r.id = repository_id and r.user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index idx_github_integrations_user_status on public.github_integrations(user_id, status);
create index idx_repositories_sync on public.repositories(sync_enabled, last_synced_at);
create index idx_pull_requests_metrics on public.pull_requests(repository_id, created_at, state);
create index idx_code_metrics_recent on public.code_metrics(repository_id, metric_date desc);

-- Comments for documentation
comment on table public.github_integrations is 'Stores GitHub OAuth tokens and integration settings for users';
comment on table public.repositories is 'GitHub repositories tracked for analytics';
comment on table public.code_metrics is 'Daily snapshots of code metrics for repositories';
comment on table public.pull_requests is 'Pull request data and calculated metrics';
comment on table public.contributors is 'GitHub users who contribute to tracked repositories';
comment on table public.repository_contributors is 'Links repositories to contributors with contribution metrics';
comment on table public.commit_analytics is 'Aggregated commit data by date';
comment on table public.analytics_cache is 'Pre-calculated analytics data for performance';