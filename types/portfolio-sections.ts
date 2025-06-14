/**
 * Portfolio Section Type Definitions
 * Comprehensive types for all portfolio sections
 */

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description: string;
  highlights?: string[];
  technologies?: string[];
  logoUrl?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  gpa?: string;
  honors?: string[];
  activities?: string[];
  coursework?: string[];
  logoUrl?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  highlights?: string[];
  links?: {
    demo?: string;
    github?: string;
    website?: string;
    documentation?: string;
  };
  imageUrl?: string;
  featured?: boolean;
  metrics?: {
    users?: string;
    performance?: string;
    impact?: string;
    [key: string]: string | undefined;
  };
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  featured?: boolean;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills?: string[];
  imageUrl?: string;
}

export interface TemplateCustomization {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    [key: string]: string | undefined;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: {
    spacing?: 'compact' | 'normal' | 'relaxed';
    style?: 'modern' | 'classic' | 'minimal';
  };
  sections?: {
    order?: string[];
    visibility?: Record<string, boolean>;
  };
  custom?: Record<string, unknown>;
}