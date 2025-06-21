-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Custom Domain Integration Schema
-- This migration creates the schema for custom domain management

-- Custom domains table
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Domain details
  domain VARCHAR(255) NOT NULL UNIQUE,
  subdomain VARCHAR(255),
  
  -- DNS configuration
  dns_configured BOOLEAN DEFAULT FALSE,
  dns_txt_record VARCHAR(255),
  dns_cname_record VARCHAR(255),
  dns_last_checked_at TIMESTAMPTZ,
  
  -- SSL certificate
  ssl_status VARCHAR(50) DEFAULT 'pending', -- pending, provisioning, active, failed
  ssl_certificate_id VARCHAR(255),
  ssl_expires_at TIMESTAMPTZ,
  
  -- Verification
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verifying, verified, failed
  verification_method VARCHAR(50) DEFAULT 'dns', -- dns, http
  verification_token VARCHAR(255) UNIQUE NOT NULL,
  verification_attempts INTEGER DEFAULT 0,
  last_verification_at TIMESTAMPTZ,
  
  -- Configuration
  is_primary BOOLEAN DEFAULT FALSE,
  force_ssl BOOLEAN DEFAULT TRUE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended, expired
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_portfolio_primary_domain UNIQUE(portfolio_id, is_primary),
  CONSTRAINT valid_domain CHECK (domain ~ '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$')
);

-- Domain verification logs
CREATE TABLE IF NOT EXISTS domain_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
  
  -- Verification details
  verification_type VARCHAR(50) NOT NULL, -- dns_txt, dns_cname, http_file
  status VARCHAR(50) NOT NULL, -- success, failed, timeout
  
  -- DNS lookup results
  dns_records JSONB,
  expected_value VARCHAR(255),
  actual_value VARCHAR(255),
  
  -- Error details
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domain analytics
CREATE TABLE IF NOT EXISTS domain_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Traffic metrics
  visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_load_time_ms INTEGER,
  ssl_handshake_time_ms INTEGER,
  
  -- Error metrics
  error_4xx_count INTEGER DEFAULT 0,
  error_5xx_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT unique_domain_date UNIQUE(domain_id, date)
);

-- Domain redirects
CREATE TABLE IF NOT EXISTS domain_redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
  
  -- Redirect configuration
  from_path VARCHAR(255) NOT NULL,
  to_path VARCHAR(255) NOT NULL,
  redirect_type INTEGER DEFAULT 301, -- 301 or 302
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Usage tracking
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_domain_from_path UNIQUE(domain_id, from_path),
  CONSTRAINT valid_redirect_type CHECK (redirect_type IN (301, 302))
);

-- DNS record templates for easy setup
CREATE TABLE IF NOT EXISTS dns_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider VARCHAR(100) NOT NULL, -- cloudflare, namecheap, godaddy, etc.
  record_type VARCHAR(10) NOT NULL, -- A, CNAME, TXT
  instructions TEXT NOT NULL,
  example_value TEXT,
  
  -- Constraints
  CONSTRAINT unique_provider_type UNIQUE(provider, record_type)
);

-- Insert common DNS templates
INSERT INTO dns_templates (provider, record_type, instructions, example_value) VALUES
  ('generic', 'CNAME', 'Add a CNAME record pointing to portfolios.prisma.madfam.io', 'portfolios.prisma.madfam.io'),
  ('generic', 'TXT', 'Add a TXT record with your verification token', 'prisma-verify=YOUR_VERIFICATION_TOKEN'),
  ('cloudflare', 'CNAME', 'In Cloudflare DNS settings, add a CNAME record with Proxy status OFF', 'portfolios.prisma.madfam.io'),
  ('namecheap', 'CNAME', 'In Advanced DNS, add a CNAME Record with Host @ and Value portfolios.prisma.madfam.io', 'portfolios.prisma.madfam.io');

-- Create indexes
CREATE INDEX idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_portfolio ON custom_domains(portfolio_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);
CREATE INDEX idx_custom_domains_verification ON custom_domains(verification_status);
CREATE INDEX idx_domain_verification_logs_domain ON domain_verification_logs(domain_id);
CREATE INDEX idx_domain_verification_logs_created ON domain_verification_logs(created_at);
CREATE INDEX idx_domain_analytics_domain_date ON domain_analytics(domain_id, date);

-- Create updated_at trigger
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE
  ON custom_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_redirects_updated_at BEFORE UPDATE
  ON domain_redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_redirects ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can manage their own domains
CREATE POLICY "Users can view own domains" ON custom_domains
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own domains" ON custom_domains
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains" ON custom_domains
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains" ON custom_domains
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view verification logs for their domains
CREATE POLICY "Users can view own domain verification logs" ON domain_verification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE custom_domains.id = domain_verification_logs.domain_id
      AND custom_domains.user_id = auth.uid()
    )
  );

-- Users can view analytics for their domains
CREATE POLICY "Users can view own domain analytics" ON domain_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE custom_domains.id = domain_analytics.domain_id
      AND custom_domains.user_id = auth.uid()
    )
  );

-- Users can manage redirects for their domains
CREATE POLICY "Users can manage own domain redirects" ON domain_redirects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE custom_domains.id = domain_redirects.domain_id
      AND custom_domains.user_id = auth.uid()
    )
  );

-- Function to generate verification token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random 32-character token
  token := encode(gen_random_bytes(16), 'hex');
  RETURN 'prisma-verify=' || token;
END;
$$ LANGUAGE plpgsql;

-- Function to check domain availability
CREATE OR REPLACE FUNCTION check_domain_availability(p_domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM custom_domains 
    WHERE domain = p_domain 
    AND status != 'expired'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to validate domain ownership
CREATE OR REPLACE FUNCTION validate_domain_ownership(
  p_domain_id UUID,
  p_method TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_domain custom_domains%ROWTYPE;
  v_verified BOOLEAN := FALSE;
BEGIN
  -- Get domain details
  SELECT * INTO v_domain FROM custom_domains WHERE id = p_domain_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Log verification attempt
  UPDATE custom_domains 
  SET verification_attempts = verification_attempts + 1,
      last_verification_at = NOW()
  WHERE id = p_domain_id;
  
  -- Actual DNS/HTTP verification would happen here
  -- This is a placeholder that would integrate with external DNS lookup service
  
  -- For now, we'll simulate verification
  -- In production, this would call an external API to check DNS records
  
  RETURN v_verified;
END;
$$ LANGUAGE plpgsql;