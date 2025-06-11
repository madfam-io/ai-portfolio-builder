/**
 * Portfolio transformation utilities
 * Handles conversion between database and API formats
 */

import { Portfolio } from '@/types/portfolio';

/**
 * Transforms database portfolio object to API format
 * Converts snake_case to camelCase and adjusts field names
 */
export function transformDbPortfolioToApi(dbPortfolio: any): Portfolio {
  return {
    id: dbPortfolio.id,
    userId: dbPortfolio.user_id,
    name: dbPortfolio.name,
    title: dbPortfolio.title,
    bio: dbPortfolio.bio,
    tagline: dbPortfolio.tagline,
    avatarUrl: dbPortfolio.avatar_url,
    contact: dbPortfolio.contact || {},
    social: dbPortfolio.social || {},
    experience: dbPortfolio.experience || [],
    education: dbPortfolio.education || [],
    projects: dbPortfolio.projects || [],
    skills: dbPortfolio.skills || [],
    certifications: dbPortfolio.certifications || [],
    template: dbPortfolio.template,
    customization: dbPortfolio.customization || {},
    aiSettings: dbPortfolio.ai_settings,
    status: dbPortfolio.status,
    subdomain: dbPortfolio.subdomain,
    customDomain: dbPortfolio.custom_domain,
    views: dbPortfolio.views,
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
 * Transforms API portfolio object to database format
 * Converts camelCase to snake_case and adjusts field names
 */
export function transformApiPortfolioToDb(
  apiPortfolio: Partial<Portfolio>
): any {
  const dbData: any = {};

  // Map API fields to database fields
  const fieldMapping: Record<string, string> = {
    userId: 'user_id',
    name: 'name',
    title: 'title',
    bio: 'bio',
    tagline: 'tagline',
    avatarUrl: 'avatar_url',
    contact: 'contact',
    social: 'social',
    experience: 'experience',
    education: 'education',
    projects: 'projects',
    skills: 'skills',
    certifications: 'certifications',
    template: 'template',
    customization: 'customization',
    aiSettings: 'ai_settings',
    status: 'status',
    subdomain: 'subdomain',
    customDomain: 'custom_domain',
    views: 'views',
    lastViewedAt: 'last_viewed_at',
    publishedAt: 'published_at',
  };

  // Transform fields using mapping
  Object.entries(apiPortfolio).forEach(([key, value]) => {
    if (key in fieldMapping && value !== undefined) {
      const dbKey = fieldMapping[key];

      // Convert dates to ISO strings
      if (value instanceof Date) {
        dbData[dbKey] = value.toISOString();
      } else {
        dbData[dbKey] = value;
      }
    }
  });

  return dbData;
}

/**
 * Batch transform database portfolios to API format
 */
export function transformDbPortfoliosToApi(dbPortfolios: any[]): Portfolio[] {
  return dbPortfolios.map(transformDbPortfolioToApi);
}

/**
 * Validate and sanitize portfolio data
 * Ensures required fields and proper data types
 */
export function sanitizePortfolioData(
  data: Partial<Portfolio>
): Partial<Portfolio> {
  const sanitized: Partial<Portfolio> = {};

  // Only include allowed fields
  const allowedFields = [
    'name',
    'title',
    'bio',
    'tagline',
    'avatarUrl',
    'contact',
    'social',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'template',
    'customization',
    'aiSettings',
    'status',
    'subdomain',
    'customDomain',
  ];

  allowedFields.forEach(field => {
    if (field in data) {
      sanitized[field as keyof Portfolio] = data[field as keyof Portfolio];
    }
  });

  // Ensure arrays are arrays
  const arrayFields = [
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
  ];
  arrayFields.forEach(field => {
    if (
      field in sanitized &&
      !Array.isArray(sanitized[field as keyof Portfolio])
    ) {
      sanitized[field as keyof Portfolio] = [] as any;
    }
  });

  // Ensure objects are objects
  const objectFields = ['contact', 'social', 'customization', 'aiSettings'];
  objectFields.forEach(field => {
    if (
      field in sanitized &&
      typeof sanitized[field as keyof Portfolio] !== 'object'
    ) {
      sanitized[field as keyof Portfolio] = {} as any;
    }
  });

  return sanitized;
}
