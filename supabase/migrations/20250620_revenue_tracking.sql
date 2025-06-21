-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Create subscriptions table if not exists
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create revenue events table for tracking changes
CREATE TABLE IF NOT EXISTS revenue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_subscription', 'upgrade', 'downgrade', 'churn', 'reactivation', 'payment_failed', 'payment_succeeded')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  old_plan TEXT,
  new_plan TEXT,
  old_amount DECIMAL(10, 2),
  new_amount DECIMAL(10, 2),
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stripe events table for webhook tracking
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create credit purchases table
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  credits INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_type ON revenue_events(type);
CREATE INDEX IF NOT EXISTS idx_revenue_events_created_at ON revenue_events(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);

-- Add role column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate MRR
CREATE OR REPLACE FUNCTION calculate_mrr(as_of_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_mrr DECIMAL,
  active_subscriptions INTEGER,
  by_plan JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH active_subs AS (
    SELECT 
      plan,
      COUNT(*) as count,
      SUM(COALESCE(amount, CASE 
        WHEN plan = 'pro' THEN 24
        WHEN plan = 'business' THEN 39
        WHEN plan = 'enterprise' THEN 79
        ELSE 0
      END)) as mrr
    FROM subscriptions
    WHERE status IN ('active', 'trialing')
      AND created_at <= as_of_date
    GROUP BY plan
  )
  SELECT 
    COALESCE(SUM(mrr), 0) as total_mrr,
    COALESCE(SUM(count), 0)::INTEGER as active_subscriptions,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'plan', plan,
          'count', count,
          'mrr', mrr
        )
      ),
      '[]'::jsonb
    ) as by_plan
  FROM active_subs;
END;
$$ LANGUAGE plpgsql;

-- Create function to get revenue trends
CREATE OR REPLACE FUNCTION get_revenue_trends(months INTEGER DEFAULT 12)
RETURNS TABLE (
  month DATE,
  mrr DECIMAL,
  new_mrr DECIMAL,
  churned_mrr DECIMAL,
  customer_count INTEGER,
  new_customers INTEGER,
  churned_customers INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE months_series AS (
    SELECT DATE_TRUNC('month', CURRENT_DATE) as month
    UNION ALL
    SELECT month - INTERVAL '1 month'
    FROM months_series
    WHERE month > DATE_TRUNC('month', CURRENT_DATE) - (months || ' months')::INTERVAL
  ),
  monthly_metrics AS (
    SELECT 
      DATE_TRUNC('month', s.created_at) as month,
      COUNT(DISTINCT CASE WHEN s.status IN ('active', 'trialing') THEN s.user_id END) as customer_count,
      COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', s.created_at) THEN s.user_id END) as new_customers,
      SUM(CASE 
        WHEN s.status IN ('active', 'trialing') THEN 
          COALESCE(s.amount, CASE 
            WHEN s.plan = 'pro' THEN 24
            WHEN s.plan = 'business' THEN 39
            WHEN s.plan = 'enterprise' THEN 79
            ELSE 0
          END)
        ELSE 0
      END) as mrr,
      SUM(CASE 
        WHEN DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', s.created_at) THEN 
          COALESCE(s.amount, CASE 
            WHEN s.plan = 'pro' THEN 24
            WHEN s.plan = 'business' THEN 39
            WHEN s.plan = 'enterprise' THEN 79
            ELSE 0
          END)
        ELSE 0
      END) as new_mrr
    FROM subscriptions s
    GROUP BY DATE_TRUNC('month', s.created_at)
  ),
  churn_metrics AS (
    SELECT 
      DATE_TRUNC('month', re.created_at) as month,
      COUNT(DISTINCT CASE WHEN re.type = 'churn' THEN re.user_id END) as churned_customers,
      SUM(CASE WHEN re.type = 'churn' THEN COALESCE(re.old_amount, 0) ELSE 0 END) as churned_mrr
    FROM revenue_events re
    WHERE re.type = 'churn'
    GROUP BY DATE_TRUNC('month', re.created_at)
  )
  SELECT 
    ms.month::DATE,
    COALESCE(mm.mrr, 0) as mrr,
    COALESCE(mm.new_mrr, 0) as new_mrr,
    COALESCE(cm.churned_mrr, 0) as churned_mrr,
    COALESCE(mm.customer_count, 0) as customer_count,
    COALESCE(mm.new_customers, 0) as new_customers,
    COALESCE(cm.churned_customers, 0) as churned_customers
  FROM months_series ms
  LEFT JOIN monthly_metrics mm ON ms.month = mm.month
  LEFT JOIN churn_metrics cm ON ms.month = cm.month
  ORDER BY ms.month DESC
  LIMIT months;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON revenue_events TO authenticated;
GRANT SELECT ON credit_purchases TO authenticated;

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own revenue events
CREATE POLICY "Users can view own revenue events" ON revenue_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own credit purchases
CREATE POLICY "Users can view own credit purchases" ON credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all data
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all revenue events" ON revenue_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all credit purchases" ON credit_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );