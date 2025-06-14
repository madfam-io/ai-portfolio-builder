import { Portfolio } from '@/types/portfolio';

/**
 * Portfolio transformation utilities
 * Handles conversion between database and API formats
 */

/**
 * Transforms database portfolio object to API format
 * Extracts data from JSONB field and converts snake_case to camelCase
 */
export function transformDbPortfolioToApi(dbPortfolio: any): Portfolio {
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
    contact: data.contact || {},
    social: data.social || {},
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
    skills: data.skills || [],
    certifications: data.certifications || [],
    template: dbPortfolio.template,
    customization: dbPortfolio.customization || {},
    aiSettings: dbPortfolio.ai_settings || {},
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
 * Transforms API portfolio object to database format
 * Packages portfolio content into JSONB data field
 */
export function transformApiPortfolioToDb(
  apiPortfolio: Partial<Portfolio>
): any {
  const dbData: any = {};

  // Extract content fields for JSONB data field
  const dataFields = {
    title: apiPortfolio.title,
    bio: apiPortfolio.bio,
    tagline: apiPortfolio.tagline,
    avatar_url: apiPortfolio.avatarUrl,
    contact: apiPortfolio.contact,
    social: apiPortfolio.social,
    experience: apiPortfolio.experience,
    education: apiPortfolio.education,
    projects: apiPortfolio.projects,
    skills: apiPortfolio.skills,
    certifications: apiPortfolio.certifications,
  };

  // Root-level fields
  if (apiPortfolio.id) dbData.id = apiPortfolio.id;
  if (apiPortfolio.userId) dbData.user_id = apiPortfolio.userId;
  if (apiPortfolio.name) dbData.name = apiPortfolio.name;
  if (apiPortfolio.subdomain) dbData.slug = apiPortfolio.subdomain;
  if (apiPortfolio.template) dbData.template = apiPortfolio.template;
  if (apiPortfolio.status) dbData.status = apiPortfolio.status;
  if (apiPortfolio.customization) dbData.customization = apiPortfolio.customization;
  if (apiPortfolio.aiSettings) dbData.ai_settings = apiPortfolio.aiSettings;
  if (apiPortfolio.subdomain) dbData.subdomain = apiPortfolio.subdomain;
  if (apiPortfolio.customDomain) dbData.custom_domain = apiPortfolio.customDomain;
  if (apiPortfolio.views !== undefined) dbData.views = apiPortfolio.views;
  
  // Date fields
  if (apiPortfolio.lastViewedAt) {
    dbData.last_viewed_at = apiPortfolio.lastViewedAt instanceof Date 
      ? apiPortfolio.lastViewedAt.toISOString() 
      : apiPortfolio.lastViewedAt;
  }
  if (apiPortfolio.publishedAt) {
    dbData.published_at = apiPortfolio.publishedAt instanceof Date 
      ? apiPortfolio.publishedAt.toISOString() 
      : apiPortfolio.publishedAt;
  }

  // Package content into data field
  dbData.data = dataFields;

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
      (sanitized as any)[field] = (data as any)[field];
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
