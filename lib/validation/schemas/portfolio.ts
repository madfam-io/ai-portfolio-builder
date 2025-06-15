import { z } from 'zod';

/**
 * Portfolio validation schemas using Zod
 * Provides type-safe validation for all portfolio-related operations
 */

// Base schemas for reusable fields
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Name contains invalid characters');

const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase();

const urlSchema = z
  .string()
  .url('Invalid URL format')
  .or(z.literal(''));

const bioSchema = z
  .string()
  .min(10, 'Bio must be at least 10 characters')
  .max(500, 'Bio must be less than 500 characters');

const taglineSchema = z
  .string()
  .max(100, 'Tagline must be less than 100 characters');

// Template enum
const templateSchema = z.enum(['developer', 'designer', 'consultant']);

// Social links schema
const socialLinksSchema = z.object({
  linkedin: urlSchema.optional(),
  github: urlSchema.optional(),
  twitter: urlSchema.optional(),
  instagram: urlSchema.optional(),
  youtube: urlSchema.optional(),
  website: urlSchema.optional(),
  dribbble: urlSchema.optional(),
  behance: urlSchema.optional(),
  custom: z.array(z.object({
    name: z.string(),
    url: urlSchema,
  })).optional(),
});

// Project schema
const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  imageUrl: urlSchema.optional(),
  liveUrl: urlSchema.optional(),
  githubUrl: urlSchema.optional(),
  tags: z.array(z.string()).max(10).optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

// Skill schema
const skillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  level: z.number().int().min(0).max(100).optional(),
  category: z.string().optional(),
});

// Settings schema
const settingsSchema = z.object({
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(false),
  showLocation: z.boolean().default(true),
  showSocial: z.boolean().default(true),
  customColors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    background: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    text: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  }).optional(),
  customFonts: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
  }).optional(),
});

/**
 * Schema for creating a new portfolio
 */
export const createPortfolioSchema = z.object({
  name: nameSchema,
  tagline: taglineSchema.optional(),
  bio: bioSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  location: z.string().max(100).optional(),
  template: templateSchema,
  socialLinks: socialLinksSchema.optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
  settings: settingsSchema.optional(),
});

/**
 * Schema for updating an existing portfolio
 */
export const updatePortfolioSchema = z.object({
  name: nameSchema.optional(),
  tagline: taglineSchema.optional(),
  bio: bioSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  location: z.string().max(100).optional(),
  template: templateSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
  settings: settingsSchema.optional(),
  isPublished: z.boolean().optional(),
});

/**
 * Schema for portfolio query parameters
 */
export const portfolioQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['all', 'published', 'draft']).optional(),
  template: templateSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'views']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for portfolio subdomain check
 */
export const subdomainCheckSchema = z.object({
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number'),
});

/**
 * Schema for portfolio publish request
 */
export const publishPortfolioSchema = z.object({
  subdomain: subdomainCheckSchema.shape.subdomain.optional(),
  customDomain: z.string().optional(),
});

// Export types
export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type PortfolioQueryInput = z.infer<typeof portfolioQuerySchema>;
export type SubdomainCheckInput = z.infer<typeof subdomainCheckSchema>;
export type PublishPortfolioInput = z.infer<typeof publishPortfolioSchema>;