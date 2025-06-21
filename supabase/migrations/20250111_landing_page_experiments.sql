-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Landing Page A/B Testing and Configuration System
-- Author: PRISMA Development Team
-- Date: 2025-01-11

-- Create enum for experiment status
create type experiment_status as enum (
  'draft',      -- Being configured, not yet live
  'active',     -- Currently running
  'paused',     -- Temporarily stopped
  'completed',  -- Finished, winner selected
  'archived'    -- No longer needed
);

-- Create enum for component types
create type landing_component_type as enum (
  'hero',
  'social_proof',
  'features',
  'how_it_works',
  'templates',
  'pricing',
  'cta',
  'testimonials',
  'faq',
  'stats',
  'benefits',
  'comparison'
);

-- Create landing page experiments table
create table public.landing_page_experiments (
  id uuid default uuid_generate_v4() primary key,
  
  -- Basic info
  name text not null,
  description text,
  hypothesis text, -- What we're testing
  
  -- Experiment configuration
  status experiment_status default 'draft' not null,
  traffic_percentage integer default 100 check (traffic_percentage between 1 and 100),
  
  -- Targeting (optional)
  target_audience jsonb default '{}' not null, -- e.g., {"geo": ["MX", "US"], "device": ["mobile"]}
  
  -- Success metrics
  primary_metric text not null, -- e.g., 'signup_rate', 'demo_click_rate'
  secondary_metrics text[], -- Additional metrics to track
  
  -- Scheduling
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  
  -- Results
  winning_variant_id uuid,
  results_summary jsonb, -- Statistical analysis results
  
  -- Metadata
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Constraints
  constraint valid_dates check (
    (start_date is null and end_date is null) or
    (start_date is not null and end_date is not null and end_date > start_date)
  )
);

-- Create landing page variants table
create table public.landing_page_variants (
  id uuid default uuid_generate_v4() primary key,
  experiment_id uuid references public.landing_page_experiments(id) on delete cascade not null,
  
  -- Variant info
  name text not null, -- e.g., 'Control', 'Variant A', 'Variant B'
  description text,
  is_control boolean default false not null,
  
  -- Traffic allocation
  traffic_percentage integer not null check (traffic_percentage between 0 and 100),
  
  -- Component configuration
  components jsonb not null default '[]', -- Array of component configurations
  /* Example structure:
  [
    {
      "type": "hero",
      "order": 1,
      "visible": true,
      "variant": "default",
      "props": {
        "title": "Custom Hero Title",
        "subtitle": "Custom subtitle",
        "ctaText": "Get Started Now",
        "showVideo": true
      }
    },
    {
      "type": "features",
      "order": 2,
      "visible": true,
      "variant": "grid",
      "props": {
        "columns": 3,
        "showIcons": true
      }
    }
  ]
  */
  
  -- Global settings
  theme_overrides jsonb default '{}' not null, -- Color scheme, fonts, etc.
  
  -- Performance
  conversions integer default 0 not null,
  visitors integer default 0 not null,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Ensure only one control per experiment
  constraint unique_control unique (experiment_id, is_control) where (is_control = true)
);

-- Create landing page analytics table
create table public.landing_page_analytics (
  id uuid default uuid_generate_v4() primary key,
  
  -- Session info
  session_id text not null,
  visitor_id text, -- Anonymous visitor tracking
  user_id uuid references public.users(id),
  
  -- Experiment assignment
  experiment_id uuid references public.landing_page_experiments(id) on delete cascade not null,
  variant_id uuid references public.landing_page_variants(id) on delete cascade not null,
  
  -- Visitor info
  ip_address inet,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  -- Geographic data
  country text,
  region text,
  city text,
  
  -- Device info
  device_type text, -- mobile, tablet, desktop
  browser text,
  os text,
  screen_resolution text,
  
  -- Behavior tracking
  landing_time timestamp with time zone default now() not null,
  time_on_page integer, -- seconds
  scroll_depth integer, -- percentage
  clicks jsonb default '[]' not null, -- Array of clicked elements
  
  -- Conversion tracking
  converted boolean default false not null,
  conversion_value decimal(10,2),
  conversion_metadata jsonb default '{}' not null,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  
  -- Indexes for performance
  constraint unique_session_experiment unique (session_id, experiment_id)
);

-- Create component library table for reusable components
create table public.landing_component_library (
  id uuid default uuid_generate_v4() primary key,
  
  -- Component identification
  type landing_component_type not null,
  variant_name text not null, -- e.g., 'default', 'minimal', 'bold'
  
  -- Component details
  name text not null,
  description text,
  thumbnail_url text, -- Preview image
  
  -- Configuration
  default_props jsonb not null default '{}',
  prop_schema jsonb not null default '{}', -- JSON Schema for validation
  
  -- Categorization
  tags text[],
  category text, -- e.g., 'conversion', 'engagement', 'trust'
  
  -- Usage stats
  usage_count integer default 0 not null,
  average_conversion_rate decimal(5,2),
  
  -- Status
  is_active boolean default true not null,
  is_premium boolean default false not null, -- Reserved for paid tiers
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Unique constraint
  constraint unique_component_variant unique (type, variant_name)
);

-- Create experiment templates table
create table public.experiment_templates (
  id uuid default uuid_generate_v4() primary key,
  
  -- Template info
  name text not null,
  description text,
  category text, -- e.g., 'conversion_optimization', 'messaging_test'
  
  -- Pre-configured experiment settings
  hypothesis_template text,
  primary_metric text,
  recommended_duration_days integer,
  minimum_sample_size integer,
  
  -- Variant configurations
  variants jsonb not null default '[]',
  
  -- Usage
  usage_count integer default 0 not null,
  success_rate decimal(5,2), -- Percentage of experiments that found a winner
  
  -- Status
  is_active boolean default true not null,
  
  -- Timestamps
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create indexes for performance
create index idx_experiments_status on public.landing_page_experiments(status) where status = 'active';
create index idx_experiments_dates on public.landing_page_experiments(start_date, end_date) where status = 'active';
create index idx_variants_experiment on public.landing_page_variants(experiment_id);
create index idx_analytics_experiment on public.landing_page_analytics(experiment_id);
create index idx_analytics_variant on public.landing_page_analytics(variant_id);
create index idx_analytics_session on public.landing_page_analytics(session_id);
create index idx_analytics_visitor on public.landing_page_analytics(visitor_id) where visitor_id is not null;
create index idx_analytics_created on public.landing_page_analytics(created_at);
create index idx_analytics_converted on public.landing_page_analytics(converted) where converted = true;
create index idx_component_library_type on public.landing_component_library(type);
create index idx_component_library_active on public.landing_component_library(is_active) where is_active = true;

-- Create function to validate variant traffic allocation
create or replace function validate_variant_traffic_allocation()
returns trigger as $$
declare
  total_percentage integer;
begin
  -- Calculate total traffic percentage for all variants in the experiment
  select sum(traffic_percentage) into total_percentage
  from public.landing_page_variants
  where experiment_id = new.experiment_id
    and id != coalesce(old.id, uuid_nil());
  
  -- Add the new/updated variant's percentage
  total_percentage := total_percentage + new.traffic_percentage;
  
  -- Ensure total doesn't exceed 100%
  if total_percentage > 100 then
    raise exception 'Total traffic allocation cannot exceed 100%%. Current total: %%', total_percentage;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Create trigger for traffic validation
create trigger validate_traffic_before_insert_or_update
  before insert or update on public.landing_page_variants
  for each row execute function validate_variant_traffic_allocation();

-- Create function to record analytics event
create or replace function record_landing_page_event(
  p_session_id text,
  p_experiment_id uuid,
  p_variant_id uuid,
  p_event_type text,
  p_event_data jsonb default '{}'
) returns void as $$
begin
  -- Update or insert analytics record
  insert into public.landing_page_analytics (
    session_id,
    experiment_id,
    variant_id
  ) values (
    p_session_id,
    p_experiment_id,
    p_variant_id
  )
  on conflict (session_id, experiment_id) do nothing;
  
  -- Handle specific event types
  if p_event_type = 'conversion' then
    update public.landing_page_analytics
    set converted = true,
        conversion_metadata = p_event_data
    where session_id = p_session_id
      and experiment_id = p_experiment_id;
    
    -- Update variant conversion count
    update public.landing_page_variants
    set conversions = conversions + 1
    where id = p_variant_id;
  end if;
  
  -- Record click events
  if p_event_type = 'click' then
    update public.landing_page_analytics
    set clicks = clicks || p_event_data
    where session_id = p_session_id
      and experiment_id = p_experiment_id;
  end if;
end;
$$ language plpgsql security definer;

-- Create function to get active experiment for visitor
create or replace function get_active_experiment_for_visitor(
  p_visitor_id text default null,
  p_device_type text default null,
  p_country text default null
) returns table (
  experiment_id uuid,
  variant_id uuid,
  variant_name text,
  components jsonb,
  theme_overrides jsonb
) as $$
declare
  v_experiment record;
  v_variant record;
  v_random_number integer;
  v_cumulative_percentage integer := 0;
begin
  -- Get active experiments
  for v_experiment in
    select e.*
    from public.landing_page_experiments e
    where e.status = 'active'
      and (e.start_date is null or e.start_date <= now())
      and (e.end_date is null or e.end_date >= now())
      and random() * 100 <= e.traffic_percentage
    order by e.created_at desc
    limit 1
  loop
    -- Check targeting criteria
    if v_experiment.target_audience != '{}' then
      -- Check device targeting
      if v_experiment.target_audience->>'device' is not null 
         and p_device_type is not null
         and not (v_experiment.target_audience->'device' ? p_device_type) then
        continue;
      end if;
      
      -- Check geo targeting
      if v_experiment.target_audience->>'geo' is not null
         and p_country is not null
         and not (v_experiment.target_audience->'geo' ? p_country) then
        continue;
      end if;
    end if;
    
    -- Select variant based on traffic allocation
    v_random_number := floor(random() * 100) + 1;
    
    for v_variant in
      select *
      from public.landing_page_variants
      where experiment_id = v_experiment.id
      order by is_control desc, created_at
    loop
      v_cumulative_percentage := v_cumulative_percentage + v_variant.traffic_percentage;
      
      if v_random_number <= v_cumulative_percentage then
        -- Update visitor count
        update public.landing_page_variants
        set visitors = visitors + 1
        where id = v_variant.id;
        
        return query
        select 
          v_experiment.id,
          v_variant.id,
          v_variant.name,
          v_variant.components,
          v_variant.theme_overrides;
        
        return;
      end if;
    end loop;
  end loop;
  
  -- No active experiment found
  return;
end;
$$ language plpgsql security definer;

-- Insert default component library entries
insert into public.landing_component_library (type, variant_name, name, description, default_props, tags, category) values
  -- Hero variants
  ('hero', 'default', 'Default Hero', 'Standard hero with title, subtitle, and CTA', 
   '{"showVideo": false, "ctaStyle": "primary"}', 
   array['conversion', 'standard'], 'conversion'),
  
  ('hero', 'video', 'Video Hero', 'Hero section with embedded video background', 
   '{"videoUrl": "", "autoplay": true, "ctaStyle": "overlay"}', 
   array['engagement', 'premium'], 'engagement'),
  
  ('hero', 'minimal', 'Minimal Hero', 'Clean hero with focus on messaging', 
   '{"showStats": false, "ctaStyle": "text"}', 
   array['minimal', 'clean'], 'conversion'),
  
  -- Features variants
  ('features', 'grid', '3-Column Grid', 'Features displayed in a 3-column grid', 
   '{"columns": 3, "showIcons": true}', 
   array['standard', 'responsive'], 'engagement'),
  
  ('features', 'carousel', 'Feature Carousel', 'Scrollable feature carousel', 
   '{"autoScroll": true, "showDots": true}', 
   array['interactive', 'mobile-friendly'], 'engagement'),
  
  -- Pricing variants
  ('pricing', 'default', 'Standard Pricing', 'Traditional pricing table', 
   '{"highlightPlan": "pro", "showFeatures": true}', 
   array['conversion', 'standard'], 'conversion'),
  
  ('pricing', 'comparison', 'Comparison Table', 'Detailed feature comparison', 
   '{"showAllFeatures": true, "stickyHeader": true}', 
   array['detailed', 'enterprise'], 'conversion');

-- Insert sample experiment templates
insert into public.experiment_templates (name, description, category, hypothesis_template, primary_metric, recommended_duration_days, minimum_sample_size, variants) values
  ('Hero Message Test', 'Test different hero messaging approaches', 'messaging_test',
   'Changing the hero message from feature-focused to benefit-focused will increase signup conversions',
   'signup_rate', 14, 1000,
   '[{"name": "Control", "description": "Current hero messaging"}, {"name": "Benefit-Focused", "description": "Emphasize user benefits over features"}]'),
  
  ('CTA Button Test', 'Test different CTA button styles and text', 'conversion_optimization',
   'A more prominent CTA button with action-oriented text will increase click-through rates',
   'cta_click_rate', 7, 500,
   '[{"name": "Control", "description": "Current button"}, {"name": "Large Primary", "description": "Larger button with primary color"}, {"name": "Urgency Text", "description": "Button with urgency-focused text"}]');

-- Row Level Security
alter table public.landing_page_experiments enable row level security;
alter table public.landing_page_variants enable row level security;
alter table public.landing_page_analytics enable row level security;
alter table public.landing_component_library enable row level security;
alter table public.experiment_templates enable row level security;

-- Policies for experiments (admin only for now)
create policy "Admins can manage experiments" on public.landing_page_experiments
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.subscription_tier = 'business'
    )
  );

-- Anyone can view active experiments (for the system to work)
create policy "System can read active experiments" on public.landing_page_experiments
  for select using (status = 'active');

-- Variants follow experiment permissions
create policy "Variants follow experiment permissions" on public.landing_page_variants
  for all using (
    exists (
      select 1 from public.landing_page_experiments e
      where e.id = experiment_id
      and (
        e.status = 'active' or
        exists (
          select 1 from public.users
          where users.id = auth.uid()
          and users.subscription_tier = 'business'
        )
      )
    )
  );

-- Analytics can be inserted by anyone (for tracking)
create policy "Anyone can insert analytics" on public.landing_page_analytics
  for insert with check (true);

-- But only admins can read analytics
create policy "Admins can read analytics" on public.landing_page_analytics
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.subscription_tier = 'business'
    )
  );

-- Component library is public read
create policy "Anyone can view component library" on public.landing_component_library
  for select using (is_active = true);

-- Templates are public read
create policy "Anyone can view experiment templates" on public.experiment_templates
  for select using (is_active = true);

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select on public.landing_component_library to anon;
grant select on public.experiment_templates to anon;
grant execute on function public.get_active_experiment_for_visitor to anon, authenticated;
grant execute on function public.record_landing_page_event to anon, authenticated;