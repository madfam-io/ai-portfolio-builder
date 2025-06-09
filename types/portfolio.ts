/**
 * Portfolio-related type definitions for PRISMA
 */

// Template types based on industry
export type TemplateType =
  | 'developer'
  | 'designer'
  | 'consultant'
  | 'educator'
  | 'creative'
  | 'business';

// Portfolio status
export type PortfolioStatus = 'draft' | 'published' | 'archived';

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
  position: string;
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
  current: boolean;
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
  githubUrl?: string;
  technologies: string[];
  highlights: string[];
  featured: boolean;
  order: number;
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
}

// Template customization
export interface TemplateCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerStyle?: 'minimal' | 'bold' | 'creative';
  sectionOrder?: string[]; // Array of section IDs in custom order
  hiddenSections?: string[]; // Array of section IDs to hide
}

// AI enhancement settings
export interface AIEnhancementSettings {
  enhanceBio: boolean;
  enhanceProjectDescriptions: boolean;
  generateSkillsFromExperience: boolean;
  tone: 'professional' | 'casual' | 'creative';
  targetLength: 'concise' | 'detailed' | 'comprehensive';
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
}

// Portfolio creation DTO
export interface CreatePortfolioDTO {
  name: string;
  title: string;
  bio?: string;
  template: TemplateType;
  importSource?: 'linkedin' | 'github' | 'manual' | 'cv';
  importData?: any; // Raw import data to be processed
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
