-- Referral System Database Schema
-- MADFAM World-Class Referral Program Implementation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core referrals tracking table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    campaign_id UUID,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'fraudulent')),
    
    -- Attribution data
    first_click_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Metadata for tracking and fraud detection
    metadata JSONB DEFAULT '{}',
    attribution_data JSONB DEFAULT '{}',
    
    -- Fraud detection fields
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    fraud_flags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral rewards tracking
CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    
    -- Reward details
    type TEXT NOT NULL CHECK (type IN ('cash', 'credit', 'discount', 'subscription_credit', 'feature_unlock')),
    amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    
    -- Status and processing
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'expired', 'cancelled')),
    payout_method TEXT CHECK (payout_method IN ('stripe', 'platform_credit', 'subscription_discount')),
    external_payout_id VARCHAR(255), -- Stripe payout ID or similar
    
    -- Expiration and limits
    expires_at TIMESTAMP WITH TIME ZONE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral campaigns configuration
CREATE TABLE referral_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Campaign type and configuration
    type TEXT NOT NULL CHECK (type IN ('double_sided', 'milestone', 'tiered', 'seasonal', 'product_specific')),
    config JSONB NOT NULL DEFAULT '{}', -- Flexible campaign configuration
    
    -- Targeting and eligibility
    target_segments TEXT[] DEFAULT '{}', -- User segments to target
    eligibility_rules JSONB DEFAULT '{}', -- Rules for eligibility
    
    -- Reward structure
    referrer_reward JSONB DEFAULT '{}', -- Reward for referrer
    referee_reward JSONB DEFAULT '{}', -- Reward for referee
    
    -- Campaign timing
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Budget and limits
    budget DECIMAL(10,2),
    spent DECIMAL(10,2) DEFAULT 0,
    max_referrals_per_user INTEGER,
    
    -- Status and performance
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    
    -- A/B testing
    experiment_id VARCHAR(255),
    experiment_variant VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral events for detailed analytics
CREATE TABLE referral_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES referral_campaigns(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'click', 'signup', 'conversion', 'reward_earned', etc.
    event_source VARCHAR(50), -- 'email', 'social', 'direct', etc.
    
    -- User and session data
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    
    -- Technical tracking
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    
    -- Event properties
    properties JSONB DEFAULT '{}',
    
    -- Device and location data
    device_fingerprint VARCHAR(255),
    country VARCHAR(2),
    city VARCHAR(100),
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User referral stats (materialized view for performance)
CREATE TABLE user_referral_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Referral counts
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    pending_referrals INTEGER DEFAULT 0,
    
    -- Rewards
    total_rewards_earned DECIMAL(10,2) DEFAULT 0,
    total_rewards_paid DECIMAL(10,2) DEFAULT 0,
    pending_rewards DECIMAL(10,2) DEFAULT 0,
    
    -- Performance metrics
    conversion_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
    average_reward_per_referral DECIMAL(10,2) DEFAULT 0,
    
    -- Gamification
    referral_rank INTEGER,
    achievement_badges TEXT[] DEFAULT '{}',
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    
    -- Timestamps
    first_referral_at TIMESTAMP WITH TIME ZONE,
    last_referral_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(code);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_campaign_id ON referrals(campaign_id);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);

CREATE INDEX idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_referral_id ON referral_rewards(referral_id);
CREATE INDEX idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX idx_referral_rewards_type ON referral_rewards(type);

CREATE INDEX idx_referral_campaigns_status ON referral_campaigns(status);
CREATE INDEX idx_referral_campaigns_type ON referral_campaigns(type);
CREATE INDEX idx_referral_campaigns_start_date ON referral_campaigns(start_date);
CREATE INDEX idx_referral_campaigns_end_date ON referral_campaigns(end_date);

CREATE INDEX idx_referral_events_referral_id ON referral_events(referral_id);
CREATE INDEX idx_referral_events_event_type ON referral_events(event_type);
CREATE INDEX idx_referral_events_timestamp ON referral_events(timestamp);
CREATE INDEX idx_referral_events_user_id ON referral_events(user_id);
CREATE INDEX idx_referral_events_session_id ON referral_events(session_id);

-- Composite indexes for common queries
CREATE INDEX idx_referrals_referrer_status ON referrals(referrer_id, status);
CREATE INDEX idx_referral_rewards_user_status ON referral_rewards(user_id, status);
CREATE INDEX idx_referral_events_type_timestamp ON referral_events(event_type, timestamp);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_referrals_updated_at 
    BEFORE UPDATE ON referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_rewards_updated_at 
    BEFORE UPDATE ON referral_rewards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_campaigns_updated_at 
    BEFORE UPDATE ON referral_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referral_stats_updated_at 
    BEFORE UPDATE ON user_referral_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a user-friendly code (avoiding confusing characters)
        code := array_to_string(
            ARRAY(
                SELECT substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', floor(random() * 31 + 1)::int, 1) 
                FROM generate_series(1, 8)
            ), 
            ''
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM referrals WHERE code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update user referral stats
CREATE OR REPLACE FUNCTION update_user_referral_stats(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_referral_stats (user_id)
    VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE user_referral_stats 
    SET 
        total_referrals = (
            SELECT COUNT(*) 
            FROM referrals 
            WHERE referrer_id = user_uuid
        ),
        successful_referrals = (
            SELECT COUNT(*) 
            FROM referrals 
            WHERE referrer_id = user_uuid AND status = 'converted'
        ),
        pending_referrals = (
            SELECT COUNT(*) 
            FROM referrals 
            WHERE referrer_id = user_uuid AND status = 'pending'
        ),
        total_rewards_earned = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM referral_rewards 
            WHERE user_id = user_uuid AND status IN ('approved', 'paid')
        ),
        total_rewards_paid = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM referral_rewards 
            WHERE user_id = user_uuid AND status = 'paid'
        ),
        pending_rewards = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM referral_rewards 
            WHERE user_id = user_uuid AND status IN ('pending', 'approved')
        ),
        first_referral_at = (
            SELECT MIN(created_at) 
            FROM referrals 
            WHERE referrer_id = user_uuid
        ),
        last_referral_at = (
            SELECT MAX(created_at) 
            FROM referrals 
            WHERE referrer_id = user_uuid
        )
    WHERE user_id = user_uuid;
    
    -- Update conversion rate
    UPDATE user_referral_stats 
    SET conversion_rate = CASE 
        WHEN total_referrals > 0 THEN (successful_referrals::DECIMAL / total_referrals::DECIMAL) * 100
        ELSE 0
    END,
    average_reward_per_referral = CASE 
        WHEN successful_referrals > 0 THEN total_rewards_earned / successful_referrals
        ELSE 0
    END
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats when referrals change
CREATE OR REPLACE FUNCTION trigger_update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for referrer
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_referral_stats(NEW.referrer_id);
    END IF;
    
    -- Update stats for old referrer if referrer changed
    IF TG_OP = 'UPDATE' AND OLD.referrer_id != NEW.referrer_id THEN
        PERFORM update_user_referral_stats(OLD.referrer_id);
    END IF;
    
    -- Update stats for old referrer if deleted
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_referral_stats(OLD.referrer_id);
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referrals_stats 
    AFTER INSERT OR UPDATE OR DELETE ON referrals 
    FOR EACH ROW EXECUTE FUNCTION trigger_update_referral_stats();

-- Trigger to update stats when rewards change
CREATE OR REPLACE FUNCTION trigger_update_reward_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_referral_stats(NEW.user_id);
    END IF;
    
    IF TG_OP = 'UPDATE' AND OLD.user_id != NEW.user_id THEN
        PERFORM update_user_referral_stats(OLD.user_id);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_referral_stats(OLD.user_id);
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referral_rewards_stats 
    AFTER INSERT OR UPDATE OR DELETE ON referral_rewards 
    FOR EACH ROW EXECUTE FUNCTION trigger_update_reward_stats();

-- Row Level Security (RLS) policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referral_stats ENABLE ROW LEVEL SECURITY;

-- Policies for referrals table
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can insert referrals as referrer" ON referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can update their own referrals" ON referrals
    FOR UPDATE USING (referrer_id = auth.uid());

-- Policies for referral_rewards table
CREATE POLICY "Users can view their own rewards" ON referral_rewards
    FOR SELECT USING (user_id = auth.uid());

-- Policies for referral_campaigns table (read-only for users)
CREATE POLICY "Users can view active campaigns" ON referral_campaigns
    FOR SELECT USING (status = 'active');

-- Policies for referral_events table
CREATE POLICY "Users can view their own events" ON referral_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert events" ON referral_events
    FOR INSERT WITH CHECK (true);

-- Policies for user_referral_stats table
CREATE POLICY "Users can view their own stats" ON user_referral_stats
    FOR SELECT USING (user_id = auth.uid());

-- Admin policies (to be applied to admin role)
CREATE POLICY "Admins can manage all referrals" ON referrals
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all rewards" ON referral_rewards
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all campaigns" ON referral_campaigns
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view all events" ON referral_events
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view all stats" ON user_referral_stats
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default campaigns
INSERT INTO referral_campaigns (id, name, description, type, config, referrer_reward, referee_reward, status) 
VALUES 
(
    uuid_generate_v4(),
    'Launch Campaign',
    'Our flagship double-sided referral campaign',
    'double_sided',
    '{
        "max_referrals_per_user": 100,
        "conversion_window_days": 30,
        "fraud_detection_enabled": true,
        "auto_approve_rewards": false
    }',
    '{
        "type": "credit",
        "amount": 25,
        "currency": "USD",
        "description": "Account credit for successful referral"
    }',
    '{
        "type": "discount",
        "amount": 50,
        "currency": "USD", 
        "description": "50% off first month subscription",
        "discount_percentage": 50
    }',
    'active'
),
(
    uuid_generate_v4(),
    'Professional Milestone Campaign',
    'Escalating rewards for Professional tier users',
    'milestone',
    '{
        "milestones": [
            {"referrals": 1, "bonus_multiplier": 1.0},
            {"referrals": 5, "bonus_multiplier": 1.5},
            {"referrals": 10, "bonus_multiplier": 2.0},
            {"referrals": 25, "bonus_multiplier": 3.0}
        ],
        "target_tiers": ["professional", "business"]
    }',
    '{
        "type": "credit",
        "base_amount": 30,
        "currency": "USD",
        "description": "Professional referral reward with milestone bonuses"
    }',
    '{
        "type": "subscription_credit",
        "amount": 29,
        "currency": "USD",
        "description": "Free month of Professional plan"
    }',
    'active'
);

-- Comments for documentation
COMMENT ON TABLE referrals IS 'Core referral tracking with attribution and fraud detection';
COMMENT ON TABLE referral_rewards IS 'Reward management and payout tracking';
COMMENT ON TABLE referral_campaigns IS 'Flexible campaign configuration system';
COMMENT ON TABLE referral_events IS 'Detailed event tracking for analytics';
COMMENT ON TABLE user_referral_stats IS 'Aggregated user statistics for performance';

COMMENT ON FUNCTION generate_referral_code() IS 'Generates unique, user-friendly referral codes';
COMMENT ON FUNCTION update_user_referral_stats(UUID) IS 'Updates aggregated statistics for a user';