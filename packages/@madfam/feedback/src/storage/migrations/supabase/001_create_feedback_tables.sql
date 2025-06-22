-- @madfam/feedback
-- Supabase Migration: Create Feedback Tables
-- Version: 1.0.0
-- 
-- This migration creates the necessary tables for the feedback system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE feedback_type AS ENUM ('bug', 'feature_request', 'improvement', 'general', 'usability');
CREATE TYPE feedback_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE feedback_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE nps_category AS ENUM ('promoter', 'passive', 'detractor');

-- Create feedback entries table
CREATE TABLE IF NOT EXISTS feedback_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    type feedback_type NOT NULL,
    severity feedback_severity NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    url TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status feedback_status NOT NULL DEFAULT 'open',
    attachments TEXT[] DEFAULT '{}',
    reproduction_steps TEXT[] DEFAULT '{}',
    expected_behavior TEXT,
    actual_behavior TEXT,
    tags TEXT[] DEFAULT '{}',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    user_context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create satisfaction surveys table
CREATE TABLE IF NOT EXISTS feedback_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    overall_satisfaction INTEGER NOT NULL CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 10),
    ease_of_use INTEGER NOT NULL CHECK (ease_of_use >= 1 AND ease_of_use <= 10),
    performance INTEGER NOT NULL CHECK (performance >= 1 AND performance <= 10),
    features INTEGER NOT NULL CHECK (features >= 1 AND features <= 10),
    design INTEGER NOT NULL CHECK (design >= 1 AND design <= 10),
    likelihood_to_recommend INTEGER NOT NULL CHECK (likelihood_to_recommend >= 1 AND likelihood_to_recommend <= 10),
    nps_category nps_category NOT NULL,
    most_useful_feature TEXT NOT NULL,
    least_useful_feature TEXT NOT NULL,
    missing_features TEXT[] DEFAULT '{}',
    additional_comments TEXT,
    completion_context TEXT NOT NULL,
    completed_in INTEGER NOT NULL, -- seconds
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table for analytics
CREATE TABLE IF NOT EXISTS feedback_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id TEXT NOT NULL, -- feedback or survey ID
    event_type TEXT NOT NULL,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    properties JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_feedback_entries_user_id ON feedback_entries(user_id);
CREATE INDEX idx_feedback_entries_type ON feedback_entries(type);
CREATE INDEX idx_feedback_entries_severity ON feedback_entries(severity);
CREATE INDEX idx_feedback_entries_status ON feedback_entries(status);
CREATE INDEX idx_feedback_entries_timestamp ON feedback_entries(timestamp);
CREATE INDEX idx_feedback_entries_tags ON feedback_entries USING GIN(tags);

CREATE INDEX idx_feedback_surveys_user_id ON feedback_surveys(user_id);
CREATE INDEX idx_feedback_surveys_timestamp ON feedback_surveys(timestamp);
CREATE INDEX idx_feedback_surveys_nps_category ON feedback_surveys(nps_category);

CREATE INDEX idx_feedback_events_reference_id ON feedback_events(reference_id);
CREATE INDEX idx_feedback_events_event_type ON feedback_events(event_type);
CREATE INDEX idx_feedback_events_user_id ON feedback_events(user_id);
CREATE INDEX idx_feedback_events_timestamp ON feedback_events(timestamp);

-- Create updated_at trigger for feedback_entries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_entries_updated_at BEFORE UPDATE
    ON feedback_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW feedback_metrics AS
SELECT
    COUNT(DISTINCT fe.user_id) as total_users,
    COUNT(fe.id) as total_feedback,
    COUNT(fs.id) as total_surveys,
    AVG(fs.likelihood_to_recommend) as avg_nps_score,
    COUNT(CASE WHEN fe.type = 'bug' AND fe.severity = 'critical' THEN 1 END) as critical_bugs,
    COUNT(CASE WHEN fe.type = 'feature_request' THEN 1 END) as feature_requests
FROM feedback_entries fe
FULL OUTER JOIN feedback_surveys fs ON fe.user_id = fs.user_id;

-- Create view for NPS calculation
CREATE OR REPLACE VIEW nps_scores AS
SELECT
    COUNT(CASE WHEN nps_category = 'promoter' THEN 1 END) as promoters,
    COUNT(CASE WHEN nps_category = 'passive' THEN 1 END) as passives,
    COUNT(CASE WHEN nps_category = 'detractor' THEN 1 END) as detractors,
    COUNT(*) as total,
    ROUND(
        ((COUNT(CASE WHEN nps_category = 'promoter' THEN 1 END)::NUMERIC - 
          COUNT(CASE WHEN nps_category = 'detractor' THEN 1 END)::NUMERIC) / 
         COUNT(*)::NUMERIC) * 100
    ) as nps_score
FROM feedback_surveys;

-- Create function to get feedback trends
CREATE OR REPLACE FUNCTION get_feedback_trends(days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    bugs INTEGER,
    features INTEGER,
    improvements INTEGER,
    total INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(fe.timestamp) as date,
        COUNT(CASE WHEN fe.type = 'bug' THEN 1 END)::INTEGER as bugs,
        COUNT(CASE WHEN fe.type = 'feature_request' THEN 1 END)::INTEGER as features,
        COUNT(CASE WHEN fe.type = 'improvement' THEN 1 END)::INTEGER as improvements,
        COUNT(*)::INTEGER as total
    FROM feedback_entries fe
    WHERE fe.timestamp >= CURRENT_DATE - INTERVAL '1 day' * days
    GROUP BY DATE(fe.timestamp)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies (if RLS is enabled)
-- Uncomment these if you want to enable Row Level Security

-- ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can create their own feedback" ON feedback_entries
--     FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- CREATE POLICY "Users can view their own feedback" ON feedback_entries
--     FOR SELECT USING (auth.uid()::TEXT = user_id);

-- CREATE POLICY "Admins can view all feedback" ON feedback_entries
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON feedback_entries TO authenticated;
GRANT ALL ON feedback_surveys TO authenticated;
GRANT ALL ON feedback_events TO authenticated;
GRANT SELECT ON feedback_metrics TO authenticated;
GRANT SELECT ON nps_scores TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_trends TO authenticated;