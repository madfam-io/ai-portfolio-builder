-- GitHub Integration Tables
-- This migration creates tables for GitHub OAuth integration

-- Create github_integrations table for storing GitHub OAuth tokens
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_user_id TEXT NOT NULL,
  github_username TEXT NOT NULL,
  github_email TEXT,
  avatar_url TEXT,
  
  -- Encrypted token storage
  encrypted_access_token TEXT NOT NULL,
  access_token_iv TEXT NOT NULL,
  access_token_tag TEXT NOT NULL,
  encrypted_refresh_token TEXT,
  refresh_token_iv TEXT,
  refresh_token_tag TEXT,
  
  -- Integration metadata
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  permissions JSONB DEFAULT '{}',
  scope TEXT,
  
  -- Rate limiting
  rate_limit_remaining INTEGER DEFAULT 5000,
  rate_limit_reset_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  
  -- Security
  encryption_version INTEGER NOT NULL DEFAULT 1,
  
  -- Ensure one active integration per user
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- Create OAuth states table for CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'linkedin')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Index for cleanup of expired states
  CHECK (expires_at > created_at)
);

-- Create repositories table for caching GitHub repo data
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  homepage TEXT,
  language TEXT,
  
  -- Repository stats
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  watchers_count INTEGER DEFAULT 0,
  
  -- Repository metadata
  is_private BOOLEAN DEFAULT false,
  is_fork BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  topics TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pushed_at TIMESTAMPTZ,
  
  -- Ensure unique repo per user
  UNIQUE(user_id, github_id)
);

-- Create indexes for performance
CREATE INDEX idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX idx_github_integrations_status ON github_integrations(status);
CREATE INDEX idx_oauth_states_expires_at ON oauth_states(expires_at) WHERE used_at IS NULL;
CREATE INDEX idx_oauth_states_user_provider ON oauth_states(user_id, provider);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_language ON repositories(language) WHERE language IS NOT NULL;

-- Row Level Security
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for github_integrations
CREATE POLICY "Users can view their own GitHub integrations"
  ON github_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub integrations"
  ON github_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub integrations"
  ON github_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub integrations"
  ON github_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for oauth_states
CREATE POLICY "Users can view their own OAuth states"
  ON oauth_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OAuth states"
  ON oauth_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth states"
  ON oauth_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth states"
  ON oauth_states FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for repositories
CREATE POLICY "Users can view their own repositories"
  ON repositories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repositories"
  ON repositories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repositories"
  ON repositories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repositories"
  ON repositories FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_github_integrations_updated_at
  BEFORE UPDATE ON github_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add cleanup function for expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM oauth_states
  WHERE expires_at < NOW() OR used_at IS NOT NULL
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment documentation
COMMENT ON TABLE github_integrations IS 'Stores GitHub OAuth tokens and integration status for users';
COMMENT ON TABLE oauth_states IS 'Temporary storage for OAuth state parameters to prevent CSRF attacks';
COMMENT ON TABLE repositories IS 'Cached GitHub repository data for analytics and portfolio display';
COMMENT ON COLUMN github_integrations.encryption_version IS 'Version of encryption used, for future key rotation';
COMMENT ON FUNCTION cleanup_expired_oauth_states() IS 'Removes expired or used OAuth state entries. Should be called periodically.';