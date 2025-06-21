import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Portfolio validation schemas using Zod
 * Ensures data integrity and type safety for API requests
 */

// Regular expressions
const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;
const DATE_REGEX = /^\d{4}-\d{2}$/; // YYYY-MM format

// Template type validation - matches TemplateType from @/types/portfolio.ts
const templateTypeSchema = z.enum([
  'developer',
  'designer',
  'consultant',
  'educator',
  'creative',
  'business',
  'minimal',
  'modern',
]);

// Portfolio status validation
const portfolioStatusSchema = z.enum(['draft', 'published', 'archived']);

// Skill level validation
const skillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

// Social links validation
const socialLinksSchema = z
  .object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    dribbble: z.string().url().optional().or(z.literal('')),
    behance: z.string().url().optional().or(z.literal('')),
    custom: z
      .array(
        z.object({
          label: z.string().min(1).max(50),
          url: z.string().url(),
          icon: z.string().optional(),
        })
      )
      .optional(),
  })
  .optional();

// Contact info validation
const contactInfoSchema = z
  .object({
    email: z
      .string()
      .regex(EMAIL_REGEX, 'Invalid email format')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(PHONE_REGEX, 'Invalid phone format')
      .optional()
      .or(z.literal('')),
    location: z.string().max(100).optional().or(z.literal('')),
    availability: z.string().max(200).optional().or(z.literal('')),
  })
  .optional();

// Experience validation
const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  startDate: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(DATE_REGEX, 'Date must be in YYYY-MM format')
    .optional(),
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
  startDate: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM format'),
  endDate: z
    .string()
    .regex(DATE_REGEX, 'Date must be in YYYY-MM format')
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(500).optional(),
  achievements: z.array(z.string().max(200)).optional(),
});

// Project validation
const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
  projectUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  technologies: z.array(z.string().max(50)),
  highlights: z.array(z.string().max(200)).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
});

// Skill validation
const skillSchema = z.object({
  name: z.string().min(1).max(50),
  level: skillLevelSchema.optional(),
  category: z.string().max(50).optional(),
});

// Certification validation
const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  issuer: z.string().min(1).max(100),
  issueDate: z.string().regex(DATE_REGEX, 'Date must be in YYYY-MM format'),
  expiryDate: z
    .string()
    .regex(DATE_REGEX, 'Date must be in YYYY-MM format')
    .optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().url().optional(),
});

// Template customization validation
const templateCustomizationSchema = z
  .object({
    primaryColor: z.string().regex(HEX_COLOR_REGEX).optional(),
    secondaryColor: z.string().regex(HEX_COLOR_REGEX).optional(),
    accentColor: z.string().regex(HEX_COLOR_REGEX).optional(),
    fontFamily: z.string().max(50).optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    darkMode: z.boolean().optional(),
    headerStyle: z.enum(['minimal', 'classic', 'modern', 'bold']).optional(),
    sectionOrder: z.array(z.string()).optional(),
    hiddenSections: z.array(z.string()).optional(),
    customCSS: z.string().max(5000).optional(),
  })
  .optional();

// AI settings validation
const aiSettingsSchema = z
  .object({
    enhanceBio: z.boolean().optional(),
    enhanceProjectDescriptions: z.boolean().optional(),
    generateSkillsFromExperience: z.boolean().optional(),
    tone: z.enum(['professional', 'casual', 'creative', 'academic']).optional(),
    targetLength: z.enum(['concise', 'balanced', 'detailed']).optional(),
  })
  .optional();

/**
 * Portfolio validation schema for complete portfolio object
 */
export const portfolioSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional(),
  contact: contactInfoSchema,
  social: socialLinksSchema,
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  template: templateTypeSchema,
  customization: templateCustomizationSchema,
  aiSettings: aiSettingsSchema,
  status: portfolioStatusSchema,
  subdomain: z
    .string()
    .regex(SUBDOMAIN_REGEX, 'Invalid subdomain format')
    .optional(),
  customDomain: z.string().optional(),
  views: z.number().min(0).optional(),
  lastViewedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
});

/**
 * Schema for creating a new portfolio
 */
export const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().min(1, 'Title is required').max(100),
  bio: z.string().max(1000).optional(),
  template: templateTypeSchema,
});

/**
 * Schema for updating an existing portfolio
 */
export const updatePortfolioSchema = portfolioSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for portfolio query parameters
 */
export const portfolioQuerySchema = z.object({
  status: portfolioStatusSchema.optional(),
  template: templateTypeSchema.optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name', 'views']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
});

/**
 * Validate create portfolio data
 */
export function validateCreatePortfolio(data: unknown) {
  return createPortfolioSchema.safeParse(data);
}

/**
 * Validate update portfolio data
 */
export function validateUpdatePortfolio(data: unknown) {
  return updatePortfolioSchema.safeParse(data);
}

/**
 * Validate portfolio query parameters
 */
export function validatePortfolioQuery(data: unknown) {
  return portfolioQuerySchema.safeParse(data);
}

/**
 * Sanitize portfolio data to prevent XSS attacks
 */
export function sanitizePortfolioData<T extends Record<string, unknown>>(
  data: T
): T {
  const sanitized = { ...data } as Record<string, unknown>;

  // List of fields that should be sanitized
  const textFields = ['name', 'title', 'bio', 'tagline', 'description'];
  const arrayTextFields = ['highlights', 'achievements'];

  // Sanitize text fields
  for (const field of textFields) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      (sanitized as Record<string, unknown>)[field] = DOMPurify.sanitize(
        sanitized[field] as string,
        {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        }
      );
    }
  }

  // Sanitize array text fields
  for (const field of arrayTextFields) {
    if (field in sanitized && Array.isArray(sanitized[field])) {
      (sanitized as Record<string, unknown>)[field] = (
        sanitized[field] as unknown[]
      ).map((item: unknown) =>
        typeof item === 'string'
          ? DOMPurify.sanitize(item, {
              ALLOWED_TAGS: [],
              ALLOWED_ATTR: [],
            })
          : item
      );
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (
      sanitized[key] &&
      typeof sanitized[key] === 'object' &&
      !Array.isArray(sanitized[key]) &&
      key !== 'createdAt' &&
      key !== 'updatedAt' &&
      key !== 'publishedAt' &&
      key !== 'lastViewedAt'
    ) {
      (sanitized as Record<string, unknown>)[key] = sanitizePortfolioData(
        sanitized[key] as Record<string, unknown>
      );
    }
  }

  return sanitized as T;
}

// Re-export types from schemas
export type Portfolio = z.infer<typeof portfolioSchema>;
export type CreatePortfolioDTO = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioDTO = z.infer<typeof updatePortfolioSchema>;
export type PortfolioQuery = z.infer<typeof portfolioQuerySchema>;
