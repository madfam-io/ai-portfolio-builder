-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Migration: Encrypt GitHub Tokens
-- Date: 2025-06-10
-- Purpose: Add columns for encrypted token storage and migrate existing tokens

-- Add new columns for encrypted token storage
ALTER TABLE github_integrations 
ADD COLUMN IF NOT EXISTS encrypted_access_token TEXT,
ADD COLUMN IF NOT EXISTS access_token_iv TEXT,
ADD COLUMN IF NOT EXISTS access_token_tag TEXT,
ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_iv TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_tag TEXT;

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_github_integrations_user_id 
ON github_integrations(user_id);

-- Add a comment to remind about manual token migration
COMMENT ON TABLE github_integrations IS 
'GitHub OAuth integrations. Tokens are now encrypted. Legacy access_token column should be migrated and removed.';

-- Create a migration status table to track token encryption
CREATE TABLE IF NOT EXISTS token_migration_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  migration_status TEXT NOT NULL CHECK (migration_status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for the migration status table (admin only)
ALTER TABLE token_migration_status ENABLE ROW LEVEL SECURITY;

-- Only service role can access migration status
CREATE POLICY "Service role only" ON token_migration_status
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to mark legacy tokens for migration
CREATE OR REPLACE FUNCTION mark_tokens_for_migration()
RETURNS void AS $$
BEGIN
  INSERT INTO token_migration_status (table_name, record_id, migration_status)
  SELECT 
    'github_integrations',
    id,
    'pending'
  FROM github_integrations
  WHERE access_token IS NOT NULL 
    AND encrypted_access_token IS NULL
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Mark existing tokens for migration
SELECT mark_tokens_for_migration();

-- Note: The actual encryption of existing tokens must be done by a secure script
-- that has access to the encryption key. This migration only sets up the schema.

-- Future migration after all tokens are encrypted:
-- ALTER TABLE github_integrations DROP COLUMN access_token;
-- ALTER TABLE github_integrations DROP COLUMN refresh_token;