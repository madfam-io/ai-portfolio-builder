-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- LinkedIn Integration Tables

-- OAuth state management for CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  redirect_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Indexes
  INDEX idx_oauth_states_state (state),
  INDEX idx_oauth_states_expires_at (expires_at)
);

-- LinkedIn connections table
CREATE TABLE IF NOT EXISTS linkedin_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  profile_data JSONB,
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(user_id),
  UNIQUE(linkedin_id),
  
  -- Indexes
  INDEX idx_linkedin_connections_user_id (user_id),
  INDEX idx_linkedin_connections_expires_at (expires_at)
);

-- Add LinkedIn import tracking to portfolios
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS linkedin_imported_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS linkedin_import_data JSONB;

-- Row Level Security (RLS) Policies

-- OAuth states policies
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own OAuth states" ON oauth_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OAuth states" ON oauth_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth states" ON oauth_states
  FOR DELETE USING (auth.uid() = user_id);

-- LinkedIn connections policies
ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own LinkedIn connections" ON linkedin_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own LinkedIn connections" ON linkedin_connections
  FOR ALL USING (auth.uid() = user_id);

-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-oauth-states', '0 * * * *', 'SELECT cleanup_expired_oauth_states();');

-- Comments
COMMENT ON TABLE oauth_states IS 'Temporary storage for OAuth state parameters to prevent CSRF attacks';
COMMENT ON TABLE linkedin_connections IS 'Stores LinkedIn OAuth connections and tokens for users';
COMMENT ON COLUMN portfolios.linkedin_imported_at IS 'Timestamp of last LinkedIn import';
COMMENT ON COLUMN portfolios.linkedin_import_data IS 'Metadata about what was imported from LinkedIn';