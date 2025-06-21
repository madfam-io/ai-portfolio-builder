-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- PostHog Experiments and Analytics Tables
-- For A/B testing and advanced analytics features

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('landing_page', 'portfolio_variant', 'feature')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  
  -- Experiment configuration
  target_metric VARCHAR(255) NOT NULL,
  secondary_metrics JSONB DEFAULT '[]'::jsonb,
  audience_filters JSONB DEFAULT '{}'::jsonb,
  traffic_allocation JSONB DEFAULT '{}'::jsonb, -- variant_id -> percentage
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Experiment variants table
CREATE TABLE IF NOT EXISTS experiment_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_control BOOLEAN DEFAULT false,
  
  -- Configuration for this variant
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metrics (updated in real-time)
  participants INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0, -- 0.0000 to 0.9999
  confidence_level DECIMAL(5, 4),
  is_winner BOOLEAN DEFAULT false,
  relative_improvement DECIMAL(10, 4), -- Percentage improvement over control
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one control per experiment
  UNIQUE(experiment_id, is_control) WHERE is_control = true
);

-- Experiment assignments table (track which users see which variants)
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES experiment_variants(id) ON DELETE CASCADE,
  
  -- Assignment details
  user_id UUID REFERENCES auth.users(id),
  visitor_id VARCHAR(255), -- For anonymous visitors
  session_id VARCHAR(255),
  
  -- Assignment metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  conversion_value DECIMAL(10, 2),
  
  -- Device and context info
  device_type VARCHAR(50),
  browser VARCHAR(100),
  country VARCHAR(2),
  
  -- Ensure unique assignment per user/visitor per experiment
  UNIQUE(experiment_id, user_id),
  UNIQUE(experiment_id, visitor_id) WHERE visitor_id IS NOT NULL
);

-- Analytics events table (for custom event tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50),
  
  -- User/visitor info
  user_id UUID REFERENCES auth.users(id),
  visitor_id VARCHAR(255),
  session_id VARCHAR(255),
  
  -- Context
  portfolio_id UUID REFERENCES portfolios(id),
  variant_id UUID REFERENCES portfolio_variants(id),
  
  -- Event data
  properties JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_analytics_events_user_id (user_id),
  INDEX idx_analytics_events_portfolio_id (portfolio_id),
  INDEX idx_analytics_events_event_name (event_name),
  INDEX idx_analytics_events_created_at (created_at)
);

-- Visitor sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session identification
  session_id VARCHAR(255) UNIQUE NOT NULL,
  visitor_id VARCHAR(255) NOT NULL,
  
  -- User association (if logged in)
  user_id UUID REFERENCES auth.users(id),
  
  -- Portfolio being viewed
  portfolio_id UUID REFERENCES portfolios(id),
  variant_id UUID REFERENCES portfolio_variants(id),
  
  -- Session details
  landing_page VARCHAR(500),
  referrer VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Device info
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  screen_resolution VARCHAR(50),
  
  -- Location
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Behavior metrics
  pages_viewed INTEGER DEFAULT 1,
  total_time_seconds INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_visitor_sessions_visitor_id (visitor_id),
  INDEX idx_visitor_sessions_portfolio_id (portfolio_id),
  INDEX idx_visitor_sessions_started_at (started_at)
);

-- Functions and triggers

-- Update experiment variant metrics
CREATE OR REPLACE FUNCTION update_experiment_variant_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update participant count and conversion metrics
  UPDATE experiment_variants
  SET 
    participants = (
      SELECT COUNT(DISTINCT COALESCE(user_id::text, visitor_id))
      FROM experiment_assignments
      WHERE variant_id = NEW.variant_id
    ),
    conversions = (
      SELECT COUNT(*)
      FROM experiment_assignments
      WHERE variant_id = NEW.variant_id AND converted = true
    ),
    conversion_rate = CASE 
      WHEN participants > 0 THEN conversions::decimal / participants::decimal
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = NEW.variant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics on assignment changes
CREATE TRIGGER update_variant_metrics_on_assignment
AFTER INSERT OR UPDATE ON experiment_assignments
FOR EACH ROW
EXECUTE FUNCTION update_experiment_variant_metrics();

-- Function to assign user to experiment variant
CREATE OR REPLACE FUNCTION assign_to_experiment_variant(
  p_experiment_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_visitor_id VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_variant_id UUID;
  v_traffic_allocation JSONB;
  v_random_value DECIMAL;
  v_cumulative_percentage DECIMAL := 0;
  v_variant RECORD;
BEGIN
  -- Check if already assigned
  SELECT variant_id INTO v_variant_id
  FROM experiment_assignments
  WHERE experiment_id = p_experiment_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id)
      OR (p_visitor_id IS NOT NULL AND visitor_id = p_visitor_id)
    );
  
  IF v_variant_id IS NOT NULL THEN
    RETURN v_variant_id;
  END IF;
  
  -- Get traffic allocation
  SELECT traffic_allocation INTO v_traffic_allocation
  FROM experiments
  WHERE id = p_experiment_id AND status = 'running';
  
  IF v_traffic_allocation IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Random assignment based on traffic allocation
  v_random_value := random();
  
  FOR v_variant IN 
    SELECT id, (value::text)::decimal as percentage
    FROM experiment_variants, jsonb_each(v_traffic_allocation)
    WHERE experiment_variants.id = (key::uuid)
    ORDER BY percentage DESC
  LOOP
    v_cumulative_percentage := v_cumulative_percentage + v_variant.percentage;
    IF v_random_value <= v_cumulative_percentage THEN
      v_variant_id := v_variant.id;
      EXIT;
    END IF;
  END LOOP;
  
  -- Create assignment
  IF v_variant_id IS NOT NULL THEN
    INSERT INTO experiment_assignments (
      experiment_id, variant_id, user_id, visitor_id
    ) VALUES (
      p_experiment_id, v_variant_id, p_user_id, p_visitor_id
    );
  END IF;
  
  RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- Experiments: Admins only for now
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage experiments"
  ON experiments
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Analytics events: Users can create their own events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Visitor sessions: Portfolio owners can view
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio owners can view visitor sessions"
  ON visitor_sessions
  FOR SELECT
  TO authenticated
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiment_variants_experiment_id ON experiment_variants(experiment_id);
CREATE INDEX idx_experiment_assignments_experiment_variant ON experiment_assignments(experiment_id, variant_id);
CREATE INDEX idx_visitor_sessions_portfolio_variant ON visitor_sessions(portfolio_id, variant_id);

-- Comments for documentation
COMMENT ON TABLE experiments IS 'A/B testing experiments for landing pages, portfolio variants, and features';
COMMENT ON TABLE experiment_variants IS 'Different variations being tested in an experiment';
COMMENT ON TABLE experiment_assignments IS 'Tracks which users/visitors are assigned to which experiment variants';
COMMENT ON TABLE analytics_events IS 'Custom event tracking for detailed analytics';
COMMENT ON TABLE visitor_sessions IS 'Visitor session tracking for portfolio analytics';