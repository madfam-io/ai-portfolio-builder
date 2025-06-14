/**
 * Portfolio-related type definitions for PRISMA
 * Enhanced with comprehensive types for the full SaaS implementation
 */

// Template types based on industry
export type TemplateType =
  | 'developer'
  | 'designer'
  | 'consultant'
  | 'educator'
  | 'creative'
  | 'business'
  | 'minimal'
  | 'modern';

// Portfolio status
export type PortfolioStatus = 'draft' | 'published' | 'archived';

// Section types for dynamic content
export type SectionType =
  | 'hero'
  | 'about'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'testimonials'
  | 'contact'
  | 'theme'
  | 'custom';

// Employment types
export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'internship';

// Skill categories
export type SkillCategory =
  | 'technical'
  | 'soft'
  | 'language'
  | 'tool'
  | 'framework';

// Layout types for sections
export type LayoutType = 'default' | 'grid' | 'timeline' | 'cards' | 'minimal';

// Social media links
export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  dribbble?: string;
  behance?: string;
  custom?: Array<{
    label: string;
    url: string;
    icon?: string;
  }>;
}

// Contact information
export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
}

// Professional experience
export interface Experience {
  id: string;
  company: string;
  companyLogo?: string;
  position: string;
  location?: string;
  employmentType?: EmploymentType;
  startDate: string;
  endDate?: string; // Optional for current positions
  current: boolean;
  description: string;
  highlights?: string[];
  technologies?: string[];
}

// Education
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

// Projects
export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  highlights?: string[];
  featured?: boolean;
  order?: number;
}

// Skills
export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

// Certifications
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
}

// Template customization
export interface TemplateCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'relaxed';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  headerStyle?: 'minimal' | 'bold' | 'creative' | 'classic' | 'modern';
  sectionOrder?: string[]; // Array of section IDs in custom order
  hiddenSections?: string[]; // Array of section IDs to hide
  darkMode?: boolean;
  customCSS?: string;
}

// AI enhancement settings
export interface AIEnhancementSettings {
  enhanceBio?: boolean;
  enhanceProjectDescriptions?: boolean;
  generateSkillsFromExperience?: boolean;
  tone?: 'professional' | 'casual' | 'creative' | 'academic';
  targetLength?: 'concise' | 'detailed' | 'comprehensive' | 'balanced';
}

// Main Portfolio interface
export interface Portfolio {
  id: string;
  userId: string;

  // Basic information
  name: string;
  title: string;
  bio: string;
  tagline?: string;
  location?: string;
  avatarUrl?: string;

  // Contact and social
  contact: ContactInfo;
  social: SocialLinks;

  // Professional content
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];

  // Template and customization
  template: TemplateType;
  customization: TemplateCustomization;

  // AI settings
  aiSettings?: AIEnhancementSettings;

  // Metadata
  status: PortfolioStatus;
  subdomain?: string;
  customDomain?: string;

  // Analytics
  views?: number;
  lastViewedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Editor state (not persisted)
  hasUnsavedChanges?: boolean;
  
  // Dynamic data storage
  data?: Record<string, any>;
}

// Import data interfaces
export interface LinkedInImportData {
  profile?: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    summary?: string;
    profilePicture?: string;
    location?: string;
  };
  positions?: Array<{
    title: string;
    companyName: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  educations?: Array<{
    schoolName: string;
    degreeName?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: Array<{
    name: string;
  }>;
}

export interface GitHubImportData {
  user?: {
    login: string;
    name?: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    blog?: string;
    company?: string;
  };
  repositories?: Array<{
    name: string;
    description?: string;
    html_url: string;
    language?: string;
    topics?: string[];
    stargazers_count: number;
    updated_at: string;
  }>;
}

export interface CVImportData {
  text?: string;
  sections?: {
    contact?: Record<string, string>;
    experience?: Array<Record<string, string>>;
    education?: Array<Record<string, string>>;
    skills?: string[];
    projects?: Array<Record<string, string>>;
  };
}

export type ImportData =
  | LinkedInImportData
  | GitHubImportData
  | CVImportData
  | Record<string, unknown>;

// Portfolio creation DTO
export interface CreatePortfolioDTO {
  name: string;
  title: string;
  bio?: string;
  template: TemplateType;
  importSource?: 'linkedin' | 'github' | 'manual' | 'cv';
  importData?: ImportData; // Properly typed import data
}

// Portfolio update DTO
export interface UpdatePortfolioDTO {
  name?: string;
  title?: string;
  bio?: string;
  tagline?: string;
  avatarUrl?: string;
  contact?: ContactInfo;
  social?: SocialLinks;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  skills?: Skill[];
  certifications?: Certification[];
  template?: TemplateType;
  customization?: TemplateCustomization;
  aiSettings?: AIEnhancementSettings;
  status?: PortfolioStatus;
  subdomain?: string;
  publishedAt?: Date;
}

// AI enhancement request/response types
export interface EnhanceBioRequest {
  originalBio: string;
  targetTone: AIEnhancementSettings['tone'];
  targetLength: AIEnhancementSettings['targetLength'];
  professionalContext?: {
    title: string;
    skills: string[];
    experience: number; // years
  };
}

export interface EnhanceBioResponse {
  enhancedBio: string;
  confidence: number; // 0-1
  suggestions?: string[];
}

export interface EnhanceProjectRequest {
  project: {
    title: string;
    description: string;
    technologies: string[];
  };
  targetTone: AIEnhancementSettings['tone'];
}

export interface EnhanceProjectResponse {
  enhancedDescription: string;
  suggestedHighlights: string[];
  extractedSkills: string[];
}

// Template recommendation types
export interface TemplateRecommendationRequest {
  userProfile: {
    title: string;
    skills: string[];
    projectCount: number;
    hasDesignWork: boolean;
    industry?: string;
  };
}

export interface TemplateRecommendationResponse {
  recommendedTemplate: TemplateType;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    template: TemplateType;
    score: number;
  }>;
}

// Portfolio Section - for dynamic content management
export interface PortfolioSection {
  id: string;
  portfolioId: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  content: Record<string, any>;
  isVisible: boolean;
  orderIndex: number;
  layout?: LayoutType;
  styles?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Project interface with more details
export interface EnhancedProject extends Project {
  shortDescription?: string;
  role?: string;
  demoUrl?: string;
  images?: string[];
  challenges?: string;
  solutions?: string;
  impact?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
  aiEnhanced?: boolean;
  aiEnhancementDate?: Date;
}

// Enhanced Experience interface
export interface EnhancedExperience extends Experience {
  location?: string;
  employmentType?: EmploymentType;
  responsibilities?: string[];
  achievements?: string[];
  aiEnhanced?: boolean;
  aiEnhancementDate?: Date;
}

// Portfolio Analytics
export interface PortfolioAnalytics {
  id: string;
  portfolioId: string;
  date: Date;
  views: number;
  uniqueVisitors: number;
  averageTimeOnPage?: number;
  bounceRate?: number;
  referrers?: Record<string, number>;
  devices?: Record<string, number>;
  browsers?: Record<string, number>;
  countries?: Record<string, number>;
  clicks?: Record<string, number>;
  createdAt: Date;
}

// Editor State Management
export interface PortfolioEditorState {
  portfolio: Portfolio;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  activeSection?: string;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  errors?: Record<string, string>;
  history: PortfolioHistoryEntry[];
  historyIndex: number;
}

export interface PortfolioHistoryEntry {
  timestamp: Date;
  action: string;
  state: Partial<Portfolio>;
}

// Publishing Options
export interface PublishOptions {
  subdomain?: string;
  customDomain?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
}

// Template Configuration
export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  thumbnail: string;
  features: string[];
  sections: SectionType[];
  defaultTheme: TemplateCustomization;
  industries: string[];
  premium?: boolean;
}

// Section Content Types
export interface AboutSectionContent {
  heading?: string;
  content: string;
  image?: string;
  highlights?: string[];
}

export interface ContactSectionContent {
  heading?: string;
  subheading?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showSocialLinks?: boolean;
  contactForm?: boolean;
}

export interface CustomSectionContent {
  heading?: string;
  content: string;
  layout?: 'text' | 'html' | 'markdown';
  media?: {
    type: 'image' | 'video' | 'embed';
    url: string;
    caption?: string;
  }[];
}

// Form validation schemas (for use with Zod)
export interface PortfolioValidationRules {
  name: { min: 1; max: 100 };
  title: { min: 1; max: 200 };
  bio: { min: 0; max: 2000 };
  subdomain: { pattern: RegExp; min: 3; max: 63 };
  skills: { max: 50 };
  projects: { max: 50 };
  experiences: { max: 20 };
}

// SEO Metadata
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterCreator?: string;
  canonicalUrl?: string;
  robots?: string;
}
