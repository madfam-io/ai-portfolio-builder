/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { Portfolio } from '@/types/portfolio';

/**
 * Maps between API and database formats for portfolio data
 */
export class PortfolioMapper {
  /**
   * Transform API format to database format
   * Maps to Supabase schema with JSONB data field
   */
  static toDatabase(portfolio: Partial<Portfolio>): Record<string, any> {
    // Extract portfolio content for JSONB data field
    const data = {
      title: portfolio.title,
      bio: portfolio.bio,
      tagline: portfolio.tagline,
      avatar_url: portfolio.avatarUrl,
      contact: portfolio.contact || {},
      social: portfolio.social || {},
      experience: portfolio.experience || [],
      education: portfolio.education || [],
      projects: portfolio.projects || [],
      skills: portfolio.skills || [],
      certifications: portfolio.certifications || [],
    };

    return {
      id: portfolio.id,
      user_id: portfolio.userId,
      name: portfolio.name,
      slug: portfolio.subdomain, // Use subdomain as slug for now
      template: portfolio.template,
      status: portfolio.status,
      data, // JSONB field containing all portfolio content
      customization: portfolio.customization || getDefaultCustomization(),
      ai_settings: portfolio.aiSettings || getDefaultAiSettings(),
      subdomain: portfolio.subdomain,
      custom_domain: portfolio.customDomain,
      views: portfolio.views,
      last_viewed_at: portfolio.lastViewedAt,
      created_at: portfolio.createdAt,
      updated_at: portfolio.updatedAt,
      published_at: portfolio.publishedAt,
    };
  }

  /**
   * Transform database format to API format
   * Extracts data from JSONB field and converts to camelCase
   */
  static fromDatabase(dbPortfolio: any): Portfolio {
    // Extract portfolio content from JSONB data field
    const data = dbPortfolio.data || {};

    return {
      id: dbPortfolio.id,
      userId: dbPortfolio.user_id,
      name: dbPortfolio.name,
      title: data.title || '',
      bio: data.bio || '',
      tagline: data.tagline || '',
      avatarUrl: data.avatar_url || null,
      contact: data.contact || { email: '', location: '' },
      social: data.social || {},
      experience: data.experience || [],
      education: data.education || [],
      projects: data.projects || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      template: dbPortfolio.template,
      customization: dbPortfolio.customization || getDefaultCustomization(),
      aiSettings: dbPortfolio.ai_settings || getDefaultAiSettings(),
      status: dbPortfolio.status,
      subdomain: dbPortfolio.subdomain,
      customDomain: dbPortfolio.custom_domain,
      views: dbPortfolio.views || 0,
      lastViewedAt: dbPortfolio.last_viewed_at
        ? new Date(dbPortfolio.last_viewed_at)
        : undefined,
      createdAt: new Date(dbPortfolio.created_at),
      updatedAt: new Date(dbPortfolio.updated_at),
      publishedAt: dbPortfolio.published_at
        ? new Date(dbPortfolio.published_at)
        : undefined,
    };
  }

  /**
   * Prepare portfolio data for public viewing
   * Removes sensitive information
   */
  static toPublic(portfolio: Portfolio): Partial<Portfolio> {
    const { userId: _userId, ...publicData } = portfolio;
    return publicData;
  }
}

/**
 * Get default customization settings
 */
function getDefaultCustomization() {
  return {
    primaryColor: '#1a73e8',
    secondaryColor: '#34a853',
    accentColor: '#ea4335',
    fontFamily: 'Inter',
    headerStyle: 'minimal',
    sectionOrder: [
      'about',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
    ],
    hiddenSections: [],
  };
}

/**
 * Get default AI settings
 */
function getDefaultAiSettings() {
  return {
    enhanceBio: true,
    enhanceProjectDescriptions: true,
    generateSkillsFromExperience: false,
    tone: 'professional',
    targetLength: 'detailed',
  };
}
