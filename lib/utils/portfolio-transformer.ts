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
  type Portfolio,
  type TemplateType,
  type PortfolioStatus,
  type Experience,
  type Education,
  type Project,
  type Skill,
  type Certification,
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
  userId: string;
  name: string;
  title: string;
  bio: string;
  tagline: string | null;
  avatarUrl: string | null;
  contact: any; // Prisma Json type
  social: any; // Prisma Json type
  experience: any; // Prisma Json type
  education: any; // Prisma Json type
  projects: any; // Prisma Json type
  skills: any; // Prisma Json type
  certifications: any; // Prisma Json type
  template: TemplateType;
  customization: any; // Prisma Json type
  aiSettings?: any; // Prisma Json type - optional
  status: PortfolioStatus;
  subdomain: string | null;
  customDomain: string | null;
  isPublic?: boolean; // optional
  views?: number; // optional
  lastViewedAt?: Date | null; // optional
  seoTitle?: string | null; // optional
  seoDescription?: string | null; // optional
  aiPersona?: string | null; // optional
  aiTone?: string | null; // optional
  aiLength?: string; // optional
  analytics?: any; // Prisma Json type - optional
  metadata?: any; // Prisma Json type - optional
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null; // optional
}

/**
 * Transforms database portfolio object to API format
 * Extracts data from JSONB field and converts snake_case to camelCase
 */
export function transformDbPortfolioToApi(
  dbPortfolio: DatabasePortfolio
): Portfolio {
  return {
    id: dbPortfolio.id,
    userId: dbPortfolio.userId,
    name: dbPortfolio.name,
    title: dbPortfolio.title,
    bio: dbPortfolio.bio,
    tagline: dbPortfolio.tagline || '',
    avatarUrl: dbPortfolio.avatarUrl || undefined,
    contact: dbPortfolio.contact || {},
    social: dbPortfolio.social || {},
    experience: validateAndTransformExperience(dbPortfolio.experience),
    education: validateAndTransformEducation(dbPortfolio.education),
    projects: validateAndTransformProjects(dbPortfolio.projects),
    skills: validateAndTransformSkills(dbPortfolio.skills),
    certifications: validateAndTransformCertifications(dbPortfolio.certifications),
    template: dbPortfolio.template,
    customization: dbPortfolio.customization || {},
    aiSettings: dbPortfolio.aiSettings || {},
    status: dbPortfolio.status,
    subdomain: dbPortfolio.subdomain || undefined,
    customDomain: dbPortfolio.customDomain || undefined,
    views: dbPortfolio.views || 0,
    lastViewedAt: dbPortfolio.lastViewedAt || undefined,
    createdAt: dbPortfolio.createdAt,
    updatedAt: dbPortfolio.updatedAt,
    publishedAt: dbPortfolio.publishedAt || undefined,
    data: {
      // Legacy data field for backward compatibility
      title: dbPortfolio.title,
      bio: dbPortfolio.bio,
      tagline: dbPortfolio.tagline,
      avatarUrl: dbPortfolio.avatarUrl,
      contact: dbPortfolio.contact,
      social: dbPortfolio.social,
      experience: dbPortfolio.experience,
      education: dbPortfolio.education,
      projects: dbPortfolio.projects,
      skills: dbPortfolio.skills,
      certifications: dbPortfolio.certifications,
    },
  };
}

/**
 * Transforms API portfolio object to database format
 * Packages portfolio content into JSONB data field
 */
interface DatabasePortfolioUpdate {
  // Note: id and userId are not updateable in Prisma updates
  name?: string;
  title?: string;
  bio?: string;
  tagline?: string | null;
  avatarUrl?: string | null;
  contact?: any;
  social?: any;
  experience?: any;
  education?: any;
  projects?: any;
  skills?: any;
  certifications?: any;
  template?: TemplateType;
  status?: PortfolioStatus;
  customization?: any;
  aiSettings?: any;
  subdomain?: string;
  customDomain?: string;
  isPublic?: boolean;
  views?: number;
  lastViewedAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  aiPersona?: string | null;
  aiTone?: string | null;
  aiLength?: string;
  analytics?: any;
  metadata?: any;
  publishedAt?: Date | null;
  updatedAt?: Date;
}

export function transformApiPortfolioToDb(
  apiPortfolio: Partial<Portfolio>
): DatabasePortfolioUpdate {
  const dbData: DatabasePortfolioUpdate = {};

  // Map direct fields from API to database
  if (apiPortfolio.name) dbData.name = apiPortfolio.name;
  if (apiPortfolio.title) dbData.title = apiPortfolio.title;
  if (apiPortfolio.bio) dbData.bio = apiPortfolio.bio;
  if (apiPortfolio.tagline !== undefined) dbData.tagline = apiPortfolio.tagline;
  if (apiPortfolio.avatarUrl !== undefined) dbData.avatarUrl = apiPortfolio.avatarUrl;
  if (apiPortfolio.contact) dbData.contact = apiPortfolio.contact;
  if (apiPortfolio.social) dbData.social = apiPortfolio.social;
  if (apiPortfolio.experience) dbData.experience = apiPortfolio.experience;
  if (apiPortfolio.education) dbData.education = apiPortfolio.education;
  if (apiPortfolio.projects) dbData.projects = apiPortfolio.projects;
  if (apiPortfolio.skills) dbData.skills = apiPortfolio.skills;
  if (apiPortfolio.certifications) dbData.certifications = apiPortfolio.certifications;
  
  if (apiPortfolio.template) dbData.template = apiPortfolio.template;
  if (apiPortfolio.status) dbData.status = apiPortfolio.status;
  if (apiPortfolio.customization) dbData.customization = apiPortfolio.customization;
  if (apiPortfolio.aiSettings) dbData.aiSettings = apiPortfolio.aiSettings;
  if (apiPortfolio.subdomain) dbData.subdomain = apiPortfolio.subdomain;
  if (apiPortfolio.customDomain) dbData.customDomain = apiPortfolio.customDomain;
  if (apiPortfolio.views !== undefined) dbData.views = apiPortfolio.views;

  // Date fields
  if (apiPortfolio.lastViewedAt) {
    dbData.lastViewedAt = apiPortfolio.lastViewedAt instanceof Date
      ? apiPortfolio.lastViewedAt
      : new Date(apiPortfolio.lastViewedAt);
  }
  if (apiPortfolio.publishedAt) {
    dbData.publishedAt = apiPortfolio.publishedAt instanceof Date
      ? apiPortfolio.publishedAt
      : new Date(apiPortfolio.publishedAt);
  }

  // Always update the updatedAt timestamp
  dbData.updatedAt = new Date();

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
