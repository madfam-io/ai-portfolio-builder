-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic information
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  template VARCHAR(50) NOT NULL DEFAULT 'developer',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Portfolio data (JSONB for flexibility)
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Customization
  customization JSONB DEFAULT '{}',
  ai_settings JSONB DEFAULT '{}',
  
  -- Publishing
  subdomain VARCHAR(63) UNIQUE,
  custom_domain VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  views INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_status ON portfolios(status);
CREATE INDEX idx_portfolios_subdomain ON portfolios(subdomain);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own portfolios
CREATE POLICY "Users can view their own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own portfolios
CREATE POLICY "Users can create their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own portfolios
CREATE POLICY "Users can delete their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Published portfolios are publicly viewable
CREATE POLICY "Published portfolios are publicly viewable" ON portfolios
  FOR SELECT USING (status = 'published');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  new_slug := base_slug;
  
  -- Check if slug exists and append number if needed
  WHILE EXISTS(SELECT 1 FROM portfolios WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate subdomain from name
CREATE OR REPLACE FUNCTION generate_subdomain(name TEXT)
RETURNS TEXT AS $$
DECLARE
  subdomain TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  subdomain := LOWER(name);
  subdomain := REGEXP_REPLACE(subdomain, '[^a-z0-9-]', '', 'g');
  subdomain := REGEXP_REPLACE(subdomain, '-+', '-', 'g');
  subdomain := TRIM(BOTH '-' FROM subdomain);
  
  -- Ensure minimum length
  IF LENGTH(subdomain) < 3 THEN
    subdomain := subdomain || '-portfolio';
  END IF;
  
  -- Ensure uniqueness
  WHILE EXISTS(SELECT 1 FROM portfolios WHERE portfolios.subdomain = subdomain) LOOP
    subdomain := subdomain || '-' || FLOOR(RANDOM() * 1000)::TEXT;
  END LOOP;
  
  RETURN subdomain;
END;
$$ LANGUAGE plpgsql;