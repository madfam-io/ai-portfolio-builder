/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import {
  Portfolio,
  TemplateType,
  PortfolioStatus,
  Experience,
  Education,
  Project,
  Skill,
  Certification,
} from '@/types/portfolio';

/**
 * Portfolio transformation utilities
 * Handles conversion between database and API formats
 */

// Helper functions to validate and transform arrays
function validateAndTransformExperience(data: unknown): Experience[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Experience =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'company' in item &&
      'position' in item &&
      'startDate' in item
  );
}

function validateAndTransformEducation(data: unknown): Education[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Education =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'institution' in item &&
      'degree' in item &&
      'field' in item &&
      'startDate' in item
  );
}

function validateAndTransformProjects(data: unknown): Project[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Project =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'title' in item &&
      'description' in item &&
      'technologies' in item &&
      Array.isArray(item.technologies)
  );
}

function validateAndTransformSkills(data: unknown): Skill[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Skill =>
      typeof item === 'object' && item !== null && 'name' in item
  );
}

function validateAndTransformCertifications(data: unknown): Certification[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Certification =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      'issuer' in item &&
      'issueDate' in item
  );
}

/**
 * Database portfolio structure
 */
interface DatabasePortfolio {
  id: string;
  user_id: string;
  name: string;
  template: TemplateType;
  customization: Record<string, unknown>;
  ai_settings: Record<string, unknown>;
  status: PortfolioStatus;
  subdomain: string | null;
  custom_domain: string | null;
  views: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  data: {
    title?: string;
    bio?: string;
    tagline?: string;
    avatar_url?: string | null;
    contact?: Record<string, string>;
    social?: Record<string, string>;
    experience?: Array<Record<string, unknown>>;
    education?: Array<Record<string, unknown>>;
    projects?: Array<Record<string, unknown>>;
    skills?: Array<Record<string, unknown>>;
    certifications?: Array<Record<string, unknown>>;
  };
}

/**
 * Transforms database portfolio object to API format
 * Extracts data from JSONB field and converts snake_case to camelCase
 */
export function transformDbPortfolioToApi(
  dbPortfolio: DatabasePortfolio
): Portfolio {
  // Extract portfolio content from JSONB data field
  const data = dbPortfolio.data || {};

  return {
    id: dbPortfolio.id,
    userId: dbPortfolio.user_id,
    name: dbPortfolio.name,
    title: data.title || '',
    bio: data.bio || '',
    tagline: data.tagline || '',
    avatarUrl: data.avatar_url || undefined,
    contact: data.contact || {},
    social: data.social || {},
    experience: validateAndTransformExperience(data.experience),
    education: validateAndTransformEducation(data.education),
    projects: validateAndTransformProjects(data.projects),
    skills: validateAndTransformSkills(data.skills),
    certifications: validateAndTransformCertifications(data.certifications),
    template: dbPortfolio.template,
    customization: dbPortfolio.customization || {},
    aiSettings: dbPortfolio.ai_settings || {},
    status: dbPortfolio.status,
    subdomain: dbPortfolio.subdomain || undefined,
    customDomain: dbPortfolio.custom_domain || undefined,
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
interface DatabasePortfolioUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  slug?: string;
  template?: TemplateType;
  status?: PortfolioStatus;
  customization?: Record<string, unknown>;
  ai_settings?: Record<string, unknown>;
  subdomain?: string;
  custom_domain?: string;
  views?: number;
  last_viewed_at?: string;
  published_at?: string;
  updated_at?: string;
  data?: Record<string, unknown>;
}

export function transformApiPortfolioToDb(
  apiPortfolio: Partial<Portfolio>
): DatabasePortfolioUpdate {
  const dbData: DatabasePortfolioUpdate = {};

  // If data field is provided, use it directly; otherwise extract from fields
  const dataFields = apiPortfolio.data || {
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
  if (apiPortfolio.customization)
    dbData.customization = { ...apiPortfolio.customization };
  if (apiPortfolio.aiSettings)
    dbData.ai_settings = { ...apiPortfolio.aiSettings };
  if (apiPortfolio.subdomain) dbData.subdomain = apiPortfolio.subdomain;
  if (apiPortfolio.customDomain)
    dbData.custom_domain = apiPortfolio.customDomain;
  if (apiPortfolio.views !== undefined) dbData.views = apiPortfolio.views;

  // Date fields
  if (apiPortfolio.lastViewedAt) {
    dbData.last_viewed_at =
      apiPortfolio.lastViewedAt instanceof Date
        ? apiPortfolio.lastViewedAt.toISOString()
        : apiPortfolio.lastViewedAt;
  }
  if (apiPortfolio.publishedAt) {
    dbData.published_at =
      apiPortfolio.publishedAt instanceof Date
        ? apiPortfolio.publishedAt.toISOString()
        : apiPortfolio.publishedAt;
  }

  // Package content into data field, merging with existing data if updating
  if (apiPortfolio.data && typeof apiPortfolio.data === 'object') {
    // If raw data updates are provided, merge them
    dbData.data = { ...dataFields, ...apiPortfolio.data };
  } else {
    dbData.data = dataFields;
  }

  // Always update the updated_at timestamp
  dbData.updated_at = new Date().toISOString();

  return dbData;
}

/**
 * Batch transform database portfolios to API format
 */
export function transformDbPortfoliosToApi(
  dbPortfolios: DatabasePortfolio[]
): Portfolio[] {
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
      const key = field as keyof Portfolio;
      const value = data[key];
      if (value !== undefined) {
        (sanitized as Record<keyof Portfolio, unknown>)[key] = value;
      }
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
      (sanitized as Record<string, unknown>)[field] = [];
    }
  });

  // Ensure objects are objects
  const objectFields = ['contact', 'social', 'customization', 'aiSettings'];
  objectFields.forEach(field => {
    if (
      field in sanitized &&
      typeof sanitized[field as keyof Portfolio] !== 'object'
    ) {
      (sanitized as Record<string, unknown>)[field] = {};
    }
  });

  return sanitized;
}
