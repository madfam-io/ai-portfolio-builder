-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Template Marketplace Schema
-- This migration creates the schema for premium template marketplace

-- Premium templates table
CREATE TABLE IF NOT EXISTS premium_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Pricing
  price_usd DECIMAL(10,2) NOT NULL,
  price_mxn DECIMAL(10,2) NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  
  -- Template details
  template_type VARCHAR(50) NOT NULL,
  preview_url TEXT,
  thumbnail_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  demo_portfolio_id VARCHAR(100),
  
  -- Features and specifications
  features JSONB DEFAULT '[]',
  industries TEXT[] DEFAULT '{}',
  best_for TEXT[] DEFAULT '{}', -- e.g., ['freelancers', 'agencies', 'consultants']
  customization_options JSONB DEFAULT '{}',
  
  -- Stats
  purchases_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  -- Author/Creator info
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(255),
  author_avatar TEXT,
  revenue_share DECIMAL(3,2) DEFAULT 0.70, -- Author gets 70% by default
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, active, inactive
  featured BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price_usd > 0),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_revenue_share CHECK (revenue_share >= 0 AND revenue_share <= 1)
);

-- Template purchases table
CREATE TABLE IF NOT EXISTS template_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  template_id UUID NOT NULL REFERENCES premium_templates(id),
  
  -- Purchase details
  purchase_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  discount_applied DECIMAL(10,2) DEFAULT 0,
  stripe_payment_id VARCHAR(255),
  
  -- License info
  license_key VARCHAR(255) UNIQUE NOT NULL,
  license_type VARCHAR(50) DEFAULT 'single_use', -- single_use, unlimited_use, team
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, expired, refunded
  
  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For limited time licenses
  
  -- Constraints
  CONSTRAINT unique_user_template UNIQUE(user_id, template_id)
);

-- Template reviews table
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES premium_templates(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  purchase_id UUID REFERENCES template_purchases(id),
  
  -- Review content
  rating INTEGER NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_review_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_user_template_review UNIQUE(user_id, template_id)
);

-- Template analytics table
CREATE TABLE IF NOT EXISTS template_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES premium_templates(id),
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  preview_clicks INTEGER DEFAULT 0,
  purchase_clicks INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue_usd DECIMAL(10,2) DEFAULT 0,
  
  -- Constraints
  CONSTRAINT unique_template_date UNIQUE(template_id, date)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS template_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  template_id UUID NOT NULL REFERENCES premium_templates(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_template_wishlist UNIQUE(user_id, template_id)
);

-- Create indexes
CREATE INDEX idx_premium_templates_slug ON premium_templates(slug);
CREATE INDEX idx_premium_templates_category ON premium_templates(category);
CREATE INDEX idx_premium_templates_status ON premium_templates(status);
CREATE INDEX idx_premium_templates_featured ON premium_templates(featured);
CREATE INDEX idx_premium_templates_author ON premium_templates(author_id);
CREATE INDEX idx_premium_templates_price ON premium_templates(price_usd);
CREATE INDEX idx_template_purchases_user ON template_purchases(user_id);
CREATE INDEX idx_template_purchases_template ON template_purchases(template_id);
CREATE INDEX idx_template_purchases_license ON template_purchases(license_key);
CREATE INDEX idx_template_reviews_template ON template_reviews(template_id);
CREATE INDEX idx_template_reviews_user ON template_reviews(user_id);
CREATE INDEX idx_template_analytics_template_date ON template_analytics(template_id, date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_premium_templates_updated_at BEFORE UPDATE
  ON premium_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_reviews_updated_at BEFORE UPDATE
  ON template_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE premium_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Premium templates: Anyone can view active templates
CREATE POLICY "Anyone can view active templates" ON premium_templates
  FOR SELECT USING (status = 'active');

-- Authors can manage their own templates
CREATE POLICY "Authors can manage own templates" ON premium_templates
  FOR ALL USING (auth.uid() = author_id);

-- Admins can manage all templates
CREATE POLICY "Admins can manage all templates" ON premium_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON template_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create reviews for purchased templates
CREATE POLICY "Users can create reviews for purchased templates" ON template_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM template_purchases
      WHERE user_id = auth.uid() AND template_id = template_reviews.template_id
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON template_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON template_reviews
  FOR SELECT USING (status = 'approved');

-- Users can manage their wishlist
CREATE POLICY "Users can manage own wishlist" ON template_wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Template authors can view their analytics
CREATE POLICY "Authors can view template analytics" ON template_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM premium_templates
      WHERE id = template_analytics.template_id AND author_id = auth.uid()
    )
  );