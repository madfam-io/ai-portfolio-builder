-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- Portfolio Tables Migration
-- This migration creates the core tables for the portfolio system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    title VARCHAR(255),
    subtitle VARCHAR(500),
    bio TEXT,
    
    -- Template and Theme
    template VARCHAR(50) NOT NULL DEFAULT 'developer',
    theme JSONB DEFAULT '{}',
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    
    -- Social Links
    social_links JSONB DEFAULT '{}',
    
    -- Settings
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    custom_domain VARCHAR(255),
    subdomain VARCHAR(255) UNIQUE,
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    og_image VARCHAR(500),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Sections table
CREATE TABLE portfolio_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Section Information
    type VARCHAR(50) NOT NULL, -- 'about', 'experience', 'education', 'projects', 'skills', 'testimonials', 'contact'
    title VARCHAR(255),
    subtitle VARCHAR(500),
    content JSONB NOT NULL DEFAULT '{}',
    
    -- Display Settings
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    layout VARCHAR(50) DEFAULT 'default',
    styles JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Projects table
CREATE TABLE portfolio_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Project Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    role VARCHAR(255),
    
    -- Links
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    
    -- Media
    thumbnail_url VARCHAR(500),
    images JSONB DEFAULT '[]',
    
    -- Technical Details
    technologies TEXT[],
    features TEXT[],
    challenges TEXT,
    solutions TEXT,
    impact TEXT,
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    
    -- Display Settings
    is_featured BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- AI Enhancement
    ai_enhanced BOOLEAN DEFAULT false,
    ai_enhancement_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Experience table
CREATE TABLE portfolio_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Experience Information
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    employment_type VARCHAR(50), -- 'full-time', 'part-time', 'contract', 'freelance', 'internship'
    
    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    
    -- Details
    responsibilities TEXT[],
    achievements TEXT[],
    technologies TEXT[],
    
    -- Display Settings
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- AI Enhancement
    ai_enhanced BOOLEAN DEFAULT false,
    ai_enhancement_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Education table
CREATE TABLE portfolio_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Education Information
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    
    -- Details
    gpa VARCHAR(10),
    honors TEXT[],
    coursework TEXT[],
    activities TEXT[],
    
    -- Display Settings
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Skills table
CREATE TABLE portfolio_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Skill Information
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100), -- 'technical', 'soft', 'language', 'tool', 'framework'
    proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
    years_of_experience DECIMAL(3,1),
    
    -- Display Settings
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Analytics table
CREATE TABLE portfolio_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Analytics Data
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    average_time_on_page INTEGER DEFAULT 0, -- in seconds
    bounce_rate DECIMAL(5,2),
    
    -- Traffic Sources
    referrers JSONB DEFAULT '{}',
    devices JSONB DEFAULT '{}',
    browsers JSONB DEFAULT '{}',
    countries JSONB DEFAULT '{}',
    
    -- Engagement
    clicks JSONB DEFAULT '{}', -- track clicks on various elements
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for one record per portfolio per day
    CONSTRAINT unique_portfolio_date UNIQUE (portfolio_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_subdomain ON portfolios(subdomain);
CREATE INDEX idx_portfolios_is_published ON portfolios(is_published);
CREATE INDEX idx_portfolio_sections_portfolio_id ON portfolio_sections(portfolio_id);
CREATE INDEX idx_portfolio_projects_portfolio_id ON portfolio_projects(portfolio_id);
CREATE INDEX idx_portfolio_experiences_portfolio_id ON portfolio_experiences(portfolio_id);
CREATE INDEX idx_portfolio_education_portfolio_id ON portfolio_education(portfolio_id);
CREATE INDEX idx_portfolio_skills_portfolio_id ON portfolio_skills(portfolio_id);
CREATE INDEX idx_portfolio_analytics_portfolio_date ON portfolio_analytics(portfolio_id, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_sections_updated_at BEFORE UPDATE ON portfolio_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_experiences_updated_at BEFORE UPDATE ON portfolio_experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_education_updated_at BEFORE UPDATE ON portfolio_education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_skills_updated_at BEFORE UPDATE ON portfolio_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Portfolios policies
CREATE POLICY "Users can view their own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view published portfolios" ON portfolios
    FOR SELECT USING (is_published = true);

-- Similar policies for related tables (simplified for brevity)
CREATE POLICY "Users can manage their portfolio sections" ON portfolio_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM portfolios 
            WHERE portfolios.id = portfolio_sections.portfolio_id 
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view sections of published portfolios" ON portfolio_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM portfolios 
            WHERE portfolios.id = portfolio_sections.portfolio_id 
            AND portfolios.is_published = true
        )
    );

-- Apply similar policies to other tables
CREATE POLICY "Users can manage their portfolio projects" ON portfolio_projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM portfolios 
            WHERE portfolios.id = portfolio_projects.portfolio_id 
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view projects of published portfolios" ON portfolio_projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM portfolios 
            WHERE portfolios.id = portfolio_projects.portfolio_id 
            AND portfolios.is_published = true
        )
    );

-- Repeat for experiences, education, skills, and analytics tables...