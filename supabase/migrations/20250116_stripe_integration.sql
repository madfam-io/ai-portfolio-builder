-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Add Stripe integration fields to users table
-- Author: MADFAM Development Team  
-- Date: 2025-01-16

-- Add Stripe-specific fields to users table
alter table public.users 
add column if not exists stripe_customer_id text unique,
add column if not exists stripe_subscription_id text unique;

-- Update subscription tier enum to include enterprise
alter table public.users 
drop constraint if exists users_subscription_tier_check;

alter table public.users 
add constraint users_subscription_tier_check 
check (subscription_tier in ('free', 'pro', 'business', 'enterprise'));

-- Update subscription status enum to include more states
alter table public.users 
drop constraint if exists users_subscription_status_check;

alter table public.users 
add constraint users_subscription_status_check 
check (subscription_status in ('active', 'inactive', 'cancelled', 'trialing', 'past_due', 'unpaid'));

-- Create indexes for Stripe fields
create index if not exists idx_users_stripe_customer_id on public.users(stripe_customer_id) where stripe_customer_id is not null;
create index if not exists idx_users_stripe_subscription_id on public.users(stripe_subscription_id) where stripe_subscription_id is not null;

-- Update subscription plans table with new enterprise plan
insert into public.subscription_plans (id, name, description, price_monthly, price_yearly, max_portfolios, max_ai_requests_monthly, features) values
  ('enterprise', 'Enterprise', 'For large organizations', 79.99, 799.99, -1, -1, '["Unlimited Portfolios", "Unlimited AI Requests", "White Label", "API Access", "Advanced Analytics", "Priority Support", "Custom Integrations", "SLA"]')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  max_portfolios = excluded.max_portfolios,
  max_ai_requests_monthly = excluded.max_ai_requests_monthly,
  features = excluded.features,
  updated_at = now();

-- Update existing plans with new pricing
update public.subscription_plans set
  price_monthly = 15.00,
  price_yearly = 150.00,
  max_ai_requests_monthly = 50,
  features = '["5 Portfolios", "50 AI Requests/month", "All Templates", "Custom Domain", "Basic Analytics", "Priority Support"]',
  updated_at = now()
where id = 'pro';

update public.subscription_plans set
  price_monthly = 39.00,
  price_yearly = 390.00,
  max_portfolios = 25,
  max_ai_requests_monthly = 200,
  features = '["25 Portfolios", "200 AI Requests/month", "All Templates", "Custom Domain", "Advanced Analytics", "Priority Support", "Team Collaboration"]',
  updated_at = now()
where id = 'business';

update public.subscription_plans set
  max_ai_requests_monthly = 3,
  features = '["1 Portfolio", "3 AI Requests/month", "Basic Templates", "PRISMA Subdomain"]',
  updated_at = now()
where id = 'free';

-- Create function to check user plan limits
create or replace function public.check_user_plan_limits(user_uuid uuid)
returns jsonb as $$
declare
  user_record record;
  plan_record record;
  current_usage record;
  result jsonb;
begin
  -- Get user subscription info
  select subscription_tier, subscription_status, ai_requests_count, portfolio_count, ai_requests_reset_at
  into user_record
  from public.users
  where id = user_uuid;

  if not found then
    return jsonb_build_object('error', 'User not found');
  end if;

  -- Get plan limits
  select max_portfolios, max_ai_requests_monthly
  into plan_record
  from public.subscription_plans
  where id = user_record.subscription_tier;

  if not found then
    return jsonb_build_object('error', 'Plan not found');
  end if;

  -- Check if AI requests should reset (monthly reset)
  if user_record.ai_requests_reset_at is null or 
     user_record.ai_requests_reset_at < date_trunc('month', now()) then
    
    -- Reset AI request count for new month
    update public.users 
    set ai_requests_count = 0, 
        ai_requests_reset_at = date_trunc('month', now()) + interval '1 month'
    where id = user_uuid;
    
    user_record.ai_requests_count := 0;
  end if;

  -- Build result
  result := jsonb_build_object(
    'subscription_tier', user_record.subscription_tier,
    'subscription_status', user_record.subscription_status,
    'current_usage', jsonb_build_object(
      'portfolios', user_record.portfolio_count,
      'ai_requests', user_record.ai_requests_count
    ),
    'limits', jsonb_build_object(
      'max_portfolios', plan_record.max_portfolios,
      'max_ai_requests', plan_record.max_ai_requests_monthly
    ),
    'can_create_portfolio', case 
      when plan_record.max_portfolios = -1 then true
      else user_record.portfolio_count < plan_record.max_portfolios
    end,
    'can_use_ai', case 
      when plan_record.max_ai_requests_monthly = -1 then true
      else user_record.ai_requests_count < plan_record.max_ai_requests_monthly
    end
  );

  return result;
end;
$$ language plpgsql security definer;

-- Create function to increment AI usage
create or replace function public.increment_ai_usage(user_uuid uuid)
returns boolean as $$
declare
  limits_check jsonb;
begin
  -- Check current limits
  limits_check := public.check_user_plan_limits(user_uuid);
  
  -- If can't use AI, return false
  if not (limits_check->>'can_use_ai')::boolean then
    return false;
  end if;

  -- Increment usage
  update public.users 
  set ai_requests_count = ai_requests_count + 1
  where id = user_uuid;

  return true;
end;
$$ language plpgsql security definer;

-- Grant execute permissions on new functions
grant execute on function public.check_user_plan_limits(uuid) to authenticated;
grant execute on function public.increment_ai_usage(uuid) to authenticated;