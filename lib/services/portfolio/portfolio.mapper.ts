import { Portfolio } from '@/types/portfolio';

/**
 * Maps between API and database formats for portfolio data
 */
export class PortfolioMapper {
  /**
   * Transform API format to database format
   * Converts camelCase to snake_case for database storage
   */
  static toDatabase(portfolio: Partial<Portfolio>): Record<string, any> {
    return {
      id: portfolio.id,
      user_id: portfolio.userId,
      name: portfolio.name,
      title: portfolio.title,
      bio: portfolio.bio,
      tagline: portfolio.tagline,
      avatar_url: portfolio.avatarUrl,
      contact: portfolio.contact ? JSON.stringify(portfolio.contact) : null,
      social: portfolio.social ? JSON.stringify(portfolio.social) : null,
      experience: portfolio.experience
        ? JSON.stringify(portfolio.experience)
        : null,
      education: portfolio.education
        ? JSON.stringify(portfolio.education)
        : null,
      projects: portfolio.projects ? JSON.stringify(portfolio.projects) : null,
      skills: portfolio.skills ? JSON.stringify(portfolio.skills) : null,
      certifications: portfolio.certifications
        ? JSON.stringify(portfolio.certifications)
        : null,
      template: portfolio.template,
      customization: portfolio.customization
        ? JSON.stringify(portfolio.customization)
        : null,
      ai_settings: portfolio.aiSettings
        ? JSON.stringify(portfolio.aiSettings)
        : null,
      status: portfolio.status,
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
   * Converts snake_case to camelCase for API responses
   */
  static fromDatabase(dbPortfolio: any): Portfolio {
    return {
      id: dbPortfolio.id,
      userId: dbPortfolio.user_id,
      name: dbPortfolio.name,
      title: dbPortfolio.title,
      bio: dbPortfolio.bio || '',
      tagline: dbPortfolio.tagline,
      avatarUrl: dbPortfolio.avatar_url,
      contact: dbPortfolio.contact
        ? JSON.parse(dbPortfolio.contact)
        : { email: '', location: '' },
      social: dbPortfolio.social ? JSON.parse(dbPortfolio.social) : {},
      experience: dbPortfolio.experience
        ? JSON.parse(dbPortfolio.experience)
        : [],
      education: dbPortfolio.education ? JSON.parse(dbPortfolio.education) : [],
      projects: dbPortfolio.projects ? JSON.parse(dbPortfolio.projects) : [],
      skills: dbPortfolio.skills ? JSON.parse(dbPortfolio.skills) : [],
      certifications: dbPortfolio.certifications
        ? JSON.parse(dbPortfolio.certifications)
        : [],
      template: dbPortfolio.template,
      customization: dbPortfolio.customization
        ? JSON.parse(dbPortfolio.customization)
        : getDefaultCustomization(),
      aiSettings: dbPortfolio.ai_settings
        ? JSON.parse(dbPortfolio.ai_settings)
        : getDefaultAiSettings(),
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
    const { userId, ...publicData } = portfolio;
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
