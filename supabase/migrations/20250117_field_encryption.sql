-- Field-level encryption migration
-- Adds encrypted columns for sensitive data

-- Add encrypted columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_encrypted TEXT,
ADD COLUMN IF NOT EXISTS email_hash TEXT, -- For lookups
ADD COLUMN IF NOT EXISTS phone_encrypted TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id_encrypted TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id_encrypted TEXT;

-- Create index on email hash for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users(email_hash);

-- Add encrypted columns to linkedin_connections
ALTER TABLE linkedin_connections
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- Add encrypted columns to repositories (webhook secrets)
ALTER TABLE repositories
ADD COLUMN IF NOT EXISTS webhook_secret_encrypted TEXT;

-- Add encrypted columns to portfolio_analytics
ALTER TABLE portfolio_analytics
ADD COLUMN IF NOT EXISTS ip_address_hash TEXT; -- Hash IPs for privacy

-- Create index on IP hash for analytics
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_ip_hash ON portfolio_analytics(ip_address_hash);

-- Add encrypted columns to ai_enhancement_logs
ALTER TABLE ai_enhancement_logs
ADD COLUMN IF NOT EXISTS input_text_encrypted TEXT,
ADD COLUMN IF NOT EXISTS output_text_encrypted TEXT;

-- Add encrypted columns to file_uploads
ALTER TABLE file_uploads
ADD COLUMN IF NOT EXISTS extracted_data_encrypted TEXT;

-- Add encrypted columns to contributors
ALTER TABLE contributors
ADD COLUMN IF NOT EXISTS email_encrypted TEXT,
ADD COLUMN IF NOT EXISTS email_hash TEXT;

-- Create index on contributor email hash
CREATE INDEX IF NOT EXISTS idx_contributors_email_hash ON contributors(email_hash);

-- Create a function to handle portfolio contact encryption
-- This will be called when updating portfolio JSONB data
CREATE OR REPLACE FUNCTION encrypt_portfolio_contact(contact_data JSONB)
RETURNS JSONB AS $$
BEGIN
  -- This function will be implemented in the application layer
  -- as PostgreSQL doesn't have access to our encryption keys
  -- Return the original data for now
  RETURN contact_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit table for encryption migration status
CREATE TABLE IF NOT EXISTS encryption_migration_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  total_records INTEGER NOT NULL,
  encrypted_records INTEGER DEFAULT 0,
  migration_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  migration_completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert migration tracking records
INSERT INTO encryption_migration_status (table_name, total_records)
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'linkedin_connections', COUNT(*) FROM linkedin_connections
UNION ALL
SELECT 'github_integrations', COUNT(*) FROM github_integrations
UNION ALL
SELECT 'repositories', COUNT(*) FROM repositories
UNION ALL
SELECT 'portfolio_analytics', COUNT(*) FROM portfolio_analytics
UNION ALL
SELECT 'ai_enhancement_logs', COUNT(*) FROM ai_enhancement_logs
UNION ALL
SELECT 'file_uploads', COUNT(*) FROM file_uploads
UNION ALL
SELECT 'contributors', COUNT(*) FROM contributors;

-- Create RLS policies for encryption migration status
ALTER TABLE encryption_migration_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view encryption status" ON encryption_migration_status
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add trigger to ensure encrypted fields are kept in sync
CREATE OR REPLACE FUNCTION sync_encrypted_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger ensures that when plaintext fields are updated,
  -- the application layer is notified to update encrypted fields
  -- The actual encryption happens in the application layer
  
  -- For users table
  IF TG_TABLE_NAME = 'users' THEN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      NEW.email_encrypted = NULL; -- Force re-encryption
      NEW.email_hash = NULL;
    END IF;
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
      NEW.phone_encrypted = NULL;
    END IF;
    IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
      NEW.stripe_customer_id_encrypted = NULL;
    END IF;
    IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id THEN
      NEW.stripe_subscription_id_encrypted = NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add sync triggers
CREATE TRIGGER sync_users_encrypted_fields
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_encrypted_fields();

-- Add comments for documentation
COMMENT ON COLUMN users.email_encrypted IS 'AES-256-GCM encrypted email address';
COMMENT ON COLUMN users.email_hash IS 'SHA-256 hash of email for lookups';
COMMENT ON COLUMN users.phone_encrypted IS 'AES-256-GCM encrypted phone number';
COMMENT ON COLUMN users.stripe_customer_id_encrypted IS 'AES-256-GCM encrypted Stripe customer ID';
COMMENT ON COLUMN users.stripe_subscription_id_encrypted IS 'AES-256-GCM encrypted Stripe subscription ID';

COMMENT ON COLUMN linkedin_connections.access_token_encrypted IS 'AES-256-GCM encrypted OAuth access token';
COMMENT ON COLUMN linkedin_connections.refresh_token_encrypted IS 'AES-256-GCM encrypted OAuth refresh token';

COMMENT ON COLUMN repositories.webhook_secret_encrypted IS 'AES-256-GCM encrypted webhook secret';

COMMENT ON COLUMN portfolio_analytics.ip_address_hash IS 'SHA-256 hash of IP address for privacy';

COMMENT ON COLUMN ai_enhancement_logs.input_text_encrypted IS 'AES-256-GCM encrypted user input';
COMMENT ON COLUMN ai_enhancement_logs.output_text_encrypted IS 'AES-256-GCM encrypted AI output';

COMMENT ON COLUMN file_uploads.extracted_data_encrypted IS 'AES-256-GCM encrypted extracted CV data';

COMMENT ON COLUMN contributors.email_encrypted IS 'AES-256-GCM encrypted contributor email';
COMMENT ON COLUMN contributors.email_hash IS 'SHA-256 hash of email for lookups';