/**
 * Portfolio Validation Schemas
 *
 * Zod schemas for validating portfolio data
 */

import { z } from 'zod';

// Regular expressions
const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;

// Social Links Schema
export const socialLinksSchema = z.object({
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
  youtube: z.string().url().optional(),
  website: z.string().url().optional(),
  dribbble: z.string().url().optional(),
  behance: z.string().url().optional(),
  custom: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        url: z.string().url(),
        icon: z.string().optional(),
      })
    )
    .optional(),
});

// Contact Info Schema
export const contactInfoSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Invalid email format').optional(),
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone format').optional(),
  location: z.string().max(100).optional(),
  availability: z.string().max(100).optional(),
});

// Template Customization Schema
export const templateCustomizationSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  textColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  fontFamily: z.string().max(50).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
  borderRadius: z.enum(['none', 'small', 'medium', 'large']).optional(),
  headerStyle: z.enum(['minimal', 'bold', 'creative']).optional(),
  sectionOrder: z.array(z.string()).optional(),
  hiddenSections: z.array(z.string()).optional(),
  darkMode: z.boolean().optional(),
  customCSS: z.string().max(10000).optional(),
});

// Experience Schema
export const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(2000),
  location: z.string().max(100).optional(),
  employmentType: z
    .enum([
      'full-time',
      'part-time',
      'contract',
      'freelance',
      'internship',
    ] as const)
    .optional(),
  highlights: z.array(z.string().max(500)).max(10).optional(),
  technologies: z.array(z.string().max(50)).max(20).optional(),
  responsibilities: z.array(z.string().max(500)).max(10).optional(),
  achievements: z.array(z.string().max(500)).max(10).optional(),
});

// Education Schema
export const educationSchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1).max(200),
  degree: z.string().max(200),
  field: z.string().max(200),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional(),
  achievements: z.array(z.string().max(500)).max(10).optional(),
});

// Project Schema
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  shortDescription: z.string().max(500).optional(),
  role: z.string().max(100).optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  projectUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  technologies: z.array(z.string().max(50)).max(20),
  highlights: z.array(z.string().max(500)).max(10),
  challenges: z.string().max(1000).optional(),
  solutions: z.string().max(1000).optional(),
  impact: z.string().max(1000).optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isCurrent: z.boolean().optional(),
});

// Skill Schema
export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  category: z.string().max(50).optional(),
});

// Certification Schema
export const certificationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().url().optional(),
});

// AI Enhancement Settings Schema
export const aiEnhancementSettingsSchema = z.object({
  enhanceBio: z.boolean().default(true),
  enhanceProjectDescriptions: z.boolean().default(true),
  generateSkillsFromExperience: z.boolean().default(true),
  tone: z.enum(['professional', 'casual', 'creative']).default('professional'),
  targetLength: z
    .enum(['concise', 'detailed', 'comprehensive'])
    .default('detailed'),
});

// Portfolio Section Schema
export const portfolioSectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum([
    'hero',
    'about',
    'experience',
    'education',
    'projects',
    'skills',
    'testimonials',
    'contact',
    'custom',
  ] as const),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  content: z.record(z.any()),
  isVisible: z.boolean().default(true),
  orderIndex: z.number().int().min(0),
  layout: z
    .enum(['default', 'grid', 'timeline', 'cards', 'minimal'] as const)
    .optional(),
  styles: z.record(z.any()).optional(),
});

// Create Portfolio Schema
export const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  bio: z.string().max(2000).optional(),
  template: z.enum([
    'developer',
    'designer',
    'consultant',
    'educator',
    'creative',
    'business',
    'minimal',
    'modern',
  ] as const),
  importSource: z.enum(['linkedin', 'github', 'manual', 'cv']).optional(),
  importData: z.any().optional(),
});

// Update Portfolio Schema
export const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  bio: z.string().max(2000).optional(),
  tagline: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  contact: contactInfoSchema.optional(),
  social: socialLinksSchema.optional(),
  experience: z.array(experienceSchema).max(20).optional(),
  education: z.array(educationSchema).max(10).optional(),
  projects: z.array(projectSchema).max(50).optional(),
  skills: z.array(skillSchema).max(50).optional(),
  certifications: z.array(certificationSchema).max(20).optional(),
  template: z
    .enum([
      'developer',
      'designer',
      'consultant',
      'educator',
      'creative',
      'business',
      'minimal',
      'modern',
    ] as const)
    .optional(),
  customization: templateCustomizationSchema.optional(),
  aiSettings: aiEnhancementSettingsSchema.optional(),
  status: z.enum(['draft', 'published', 'archived'] as const).optional(),
});

// Publish Options Schema
export const publishOptionsSchema = z.object({
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(SUBDOMAIN_REGEX, 'Invalid subdomain format')
    .optional(),
  customDomain: z.string().max(255).optional(),
  seo: z
    .object({
      title: z.string().max(60).optional(),
      description: z.string().max(160).optional(),
      keywords: z.array(z.string()).max(10).optional(),
      ogImage: z.string().url().optional(),
    })
    .optional(),
  analytics: z
    .object({
      googleAnalyticsId: z.string().optional(),
      facebookPixelId: z.string().optional(),
    })
    .optional(),
});

// Section Content Schemas
export const aboutSectionContentSchema = z.object({
  heading: z.string().max(200).optional(),
  content: z.string().max(5000),
  image: z.string().url().optional(),
  highlights: z.array(z.string().max(200)).max(10).optional(),
});

export const contactSectionContentSchema = z.object({
  heading: z.string().max(200).optional(),
  subheading: z.string().max(500).optional(),
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  showLocation: z.boolean().default(true),
  showSocialLinks: z.boolean().default(true),
  contactForm: z.boolean().default(false),
});

export const customSectionContentSchema = z.object({
  heading: z.string().max(200).optional(),
  content: z.string().max(10000),
  layout: z.enum(['text', 'html', 'markdown']).default('text'),
  media: z
    .array(
      z.object({
        type: z.enum(['image', 'video', 'embed']),
        url: z.string().url(),
        caption: z.string().max(500).optional(),
      })
    )
    .max(10)
    .optional(),
});

// Validation helpers
export const validatePortfolioName = (name: string): boolean => {
  try {
    createPortfolioSchema.shape.name.parse(name);
    return true;
  } catch {
    return false;
  }
};

export const validateSubdomain = (subdomain: string): boolean => {
  return SUBDOMAIN_REGEX.test(subdomain);
};

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Export all schemas
export const portfolioValidations = {
  createPortfolio: createPortfolioSchema,
  updatePortfolio: updatePortfolioSchema,
  publishOptions: publishOptionsSchema,
  experience: experienceSchema,
  education: educationSchema,
  project: projectSchema,
  skill: skillSchema,
  certification: certificationSchema,
  section: portfolioSectionSchema,
  socialLinks: socialLinksSchema,
  contactInfo: contactInfoSchema,
  templateCustomization: templateCustomizationSchema,
  aiSettings: aiEnhancementSettingsSchema,
  sectionContent: {
    about: aboutSectionContentSchema,
    contact: contactSectionContentSchema,
    custom: customSectionContentSchema,
  },
};
