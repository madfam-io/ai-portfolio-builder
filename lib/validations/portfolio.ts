/**
 * Portfolio validation schemas using Zod
 * Ensures data integrity and type safety for API requests
 */

import { z } from 'zod';
// Types are defined inline in the schemas below

// Template type validation
const templateTypeSchema = z.enum(['developer', 'designer', 'consultant', 'educator', 'creative', 'business']);

// Portfolio status validation
const portfolioStatusSchema = z.enum(['draft', 'published', 'archived']);

// Social links validation
const socialLinksSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  custom: z.array(z.object({
    label: z.string().min(1).max(50),
    url: z.string().url(),
    icon: z.string().optional(),
  })).optional(),
}).optional();

// Contact info validation
const contactInfoSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  availability: z.string().max(200).optional().or(z.literal('')),
}).optional();

// Experience validation
const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format').optional(),
  current: z.boolean(),
  description: z.string().min(1).max(1000),
  highlights: z.array(z.string().max(200)).optional(),
  technologies: z.array(z.string().max(50)).optional(),
});

// Education validation
const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1).max(100),
  degree: z.string().min(1).max(100),
  field: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format').optional(),
  current: z.boolean(),
  description: z.string().max(500).optional(),
  achievements: z.array(z.string().max(200)).optional(),
});

// Project validation
const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  projectUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  technologies: z.array(z.string().max(50)),
  highlights: z.array(z.string().max(200)),
  featured: z.boolean(),
  order: z.number().min(0),
});

// Skills validation
const skillSchema = z.object({
  name: z.string().min(1).max(50),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  category: z.string().max(50).optional(),
});

// Certifications validation
const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  issuer: z.string().min(1).max(100),
  issueDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format').optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().url().optional(),
});

// Template customization validation
const templateCustomizationSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  fontFamily: z.string().max(50).optional(),
  headerStyle: z.enum(['minimal', 'bold', 'creative']).optional(),
  sectionOrder: z.array(z.string()).optional(),
  hiddenSections: z.array(z.string()).optional(),
}).optional();

// AI enhancement settings validation
const aiEnhancementSettingsSchema = z.object({
  enhanceBio: z.boolean(),
  enhanceProjectDescriptions: z.boolean(),
  generateSkillsFromExperience: z.boolean(),
  tone: z.enum(['professional', 'casual', 'creative']),
  targetLength: z.enum(['concise', 'detailed', 'comprehensive']),
}).optional();

// Create portfolio DTO validation
export const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  tagline: z.string().max(200, 'Tagline must be less than 200 characters').optional(),
  template: templateTypeSchema,
  importSource: z.enum(['linkedin', 'github', 'manual', 'cv']).optional(),
  importData: z.any().optional(), // Raw import data to be processed
});

// Update portfolio DTO validation
export const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  tagline: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional(),
  contact: contactInfoSchema,
  social: socialLinksSchema,
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  template: templateTypeSchema.optional(),
  customization: templateCustomizationSchema,
  aiSettings: aiEnhancementSettingsSchema,
  status: portfolioStatusSchema.optional(),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens').optional(),
  customDomain: z.string().max(100).optional(),
});

// Full portfolio validation (for complete portfolio objects)
export const portfolioSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  bio: z.string().max(500),
  tagline: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional(),
  contact: contactInfoSchema.default({}),
  social: socialLinksSchema.default({}),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  skills: z.array(skillSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  template: templateTypeSchema,
  customization: templateCustomizationSchema.default({}),
  aiSettings: aiEnhancementSettingsSchema,
  status: portfolioStatusSchema,
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
  views: z.number().min(0).optional(),
  lastViewedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
});

// Query parameters validation
export const portfolioQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: portfolioStatusSchema.optional(),
  template: templateTypeSchema.optional(),
  search: z.string().max(100).optional(),
});

// Types derived from schemas
export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type PortfolioQueryInput = z.infer<typeof portfolioQuerySchema>;

// Utility functions for validation
export const validateCreatePortfolio = (data: unknown) => {
  return createPortfolioSchema.safeParse(data);
};

export const validateUpdatePortfolio = (data: unknown) => {
  return updatePortfolioSchema.safeParse(data);
};

export const validatePortfolioQuery = (data: unknown) => {
  return portfolioQuerySchema.safeParse(data);
};

// Data sanitization helpers
export const sanitizeString = (input: string): string => {
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizePortfolioData = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizePortfolioData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizePortfolioData(value);
    }
    return sanitized;
  }
  
  return data;
};