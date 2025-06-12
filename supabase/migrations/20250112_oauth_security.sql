-- OAuth Security Improvements
-- Adds table for secure OAuth state management

-- Create oauth_states table for CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_provider CHECK (provider IN ('github', 'linkedin'))
);

-- Add indexes
CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Enable RLS
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Users can only see their own OAuth states
CREATE POLICY "Users can view own oauth states" ON oauth_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the system can insert OAuth states (via service role)
CREATE POLICY "System can manage oauth states" ON oauth_states
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states 
  WHERE expires_at < CURRENT_TIMESTAMP 
     OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired states (if pg_cron is available)
-- This would need to be set up separately in production
-- SELECT cron.schedule('cleanup-oauth-states', '*/15 * * * *', 'SELECT cleanup_expired_oauth_states();');

-- Add column to store encrypted tokens more securely
ALTER TABLE github_tokens 
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_rotated_at TIMESTAMP WITH TIME ZONE;

-- Add index for token rotation tracking
CREATE INDEX IF NOT EXISTS idx_github_tokens_last_rotated ON github_tokens(last_rotated_at);