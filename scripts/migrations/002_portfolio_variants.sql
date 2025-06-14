-- Portfolio Variants Migration
-- Enables multiple portfolio versions for different audiences

-- Create audience_profiles table
CREATE TABLE IF NOT EXISTS audience_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  type TEXT NOT NULL CHECK (type IN ('recruiter', 'hiring-manager', 'client', 'investor', 'conference-organizer', 'peer', 'general', 'custom')),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Target characteristics
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'lead', 'director', 'executive')),
  
  -- Geographic and cultural
  location TEXT,
  language TEXT,
  cultural_context TEXT,
  
  -- Decision factors (JSONB arrays)
  key_priorities JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  decision_criteria JSONB DEFAULT '[]',
  
  -- Keywords (JSONB arrays)
  important_keywords JSONB DEFAULT '[]',
  avoid_keywords JSONB DEFAULT '[]',
  
  -- Style preferences
  communication_style TEXT CHECK (communication_style IN ('formal', 'casual', 'technical', 'creative')),
  preferred_length TEXT CHECK (preferred_length IN ('concise', 'detailed', 'comprehensive')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT unique_user_audience_name UNIQUE (user_id, name)
);

-- Create portfolio_variants table
CREATE TABLE IF NOT EXISTS portfolio_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  audience_profile_id UUID REFERENCES audience_profiles(id) ON DELETE SET NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Variant settings
  is_default BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Content overrides (JSONB for flexibility)
  content_overrides JSONB DEFAULT '{}',
  
  -- AI optimization settings
  ai_optimization JSONB DEFAULT '{
    "autoOptimize": false,
    "optimizationGoals": [],
    "lastOptimized": null,
    "performanceScore": null
  }',
  
  -- Analytics
  analytics JSONB DEFAULT '{
    "views": 0,
    "uniqueVisitors": 0,
    "avgTimeOnPage": 0,
    "conversionRate": 0,
    "lastViewed": null
  }',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_portfolio_slug UNIQUE (portfolio_id, slug),
  CONSTRAINT unique_portfolio_default UNIQUE (portfolio_id, is_default) WHERE is_default = TRUE
);

-- Create variant_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS variant_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES portfolio_variants(id) ON DELETE CASCADE,
  
  -- Time period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('hour', 'day', 'week', 'month')),
  
  -- Metrics
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page FLOAT DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0,
  scroll_depth FLOAT DEFAULT 0,
  
  -- Conversion events (JSONB)
  conversion_events JSONB DEFAULT '{}',
  
  -- Visitor insights (JSONB)
  visitor_insights JSONB DEFAULT '{
    "topCompanies": [],
    "topLocations": [],
    "topReferrers": [],
    "deviceTypes": {}
  }',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for efficient querying
  CONSTRAINT unique_variant_period UNIQUE (variant_id, period_start, period_type)
);

-- Create variant_comparisons table for A/B testing
CREATE TABLE IF NOT EXISTS variant_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  variant_a_id UUID NOT NULL REFERENCES portfolio_variants(id) ON DELETE CASCADE,
  variant_b_id UUID NOT NULL REFERENCES portfolio_variants(id) ON DELETE CASCADE,
  
  -- Comparison period
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- Metrics (JSONB for flexibility)
  metrics JSONB DEFAULT '{
    "views": {"a": 0, "b": 0},
    "engagement": {"a": 0, "b": 0},
    "conversion": {"a": 0, "b": 0}
  }',
  
  -- Results
  winner UUID REFERENCES portfolio_variants(id),
  confidence FLOAT,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_variants CHECK (variant_a_id != variant_b_id),
  CONSTRAINT unique_active_comparison UNIQUE (portfolio_id, variant_a_id, variant_b_id) WHERE status = 'active'
);

-- Create indexes for performance
CREATE INDEX idx_audience_profiles_user_id ON audience_profiles(user_id);
CREATE INDEX idx_portfolio_variants_portfolio_id ON portfolio_variants(portfolio_id);
CREATE INDEX idx_portfolio_variants_slug ON portfolio_variants(slug);
CREATE INDEX idx_portfolio_variants_published ON portfolio_variants(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_variant_analytics_variant_id ON variant_analytics(variant_id);
CREATE INDEX idx_variant_analytics_period ON variant_analytics(period_start, period_type);
CREATE INDEX idx_variant_comparisons_portfolio_id ON variant_comparisons(portfolio_id);
CREATE INDEX idx_variant_comparisons_status ON variant_comparisons(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audience_profiles_updated_at BEFORE UPDATE ON audience_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_variants_updated_at BEFORE UPDATE ON portfolio_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variant_comparisons_updated_at BEFORE UPDATE ON variant_comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE audience_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_comparisons ENABLE ROW LEVEL SECURITY;

-- Audience profiles policies
CREATE POLICY "Users can view their own audience profiles" ON audience_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audience profiles" ON audience_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience profiles" ON audience_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audience profiles" ON audience_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Portfolio variants policies
CREATE POLICY "Users can view their own portfolio variants" ON portfolio_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_variants.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create variants for their portfolios" ON portfolio_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_variants.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their portfolio variants" ON portfolio_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_variants.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their portfolio variants" ON portfolio_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_variants.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

-- Public can view published variants
CREATE POLICY "Public can view published portfolio variants" ON portfolio_variants
  FOR SELECT USING (is_published = TRUE);

-- Analytics policies (users can only view analytics for their variants)
CREATE POLICY "Users can view analytics for their variants" ON variant_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio_variants
      JOIN portfolios ON portfolios.id = portfolio_variants.portfolio_id
      WHERE portfolio_variants.id = variant_analytics.variant_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Comparison policies
CREATE POLICY "Users can view their variant comparisons" ON variant_comparisons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = variant_comparisons.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create variant comparisons" ON variant_comparisons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = variant_comparisons.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their variant comparisons" ON variant_comparisons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = variant_comparisons.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

-- Create default variant for existing portfolios
INSERT INTO portfolio_variants (portfolio_id, name, slug, is_default, is_published, content_overrides)
SELECT 
  id,
  'Default',
  'default',
  TRUE,
  status = 'published',
  '{}'::jsonb
FROM portfolios
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_variants 
  WHERE portfolio_variants.portfolio_id = portfolios.id 
  AND portfolio_variants.is_default = TRUE
);