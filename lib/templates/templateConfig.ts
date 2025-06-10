/**
 * @fileoverview Template Configuration System
 * 
 * Defines template-specific layouts, section ordering, and styling preferences
 * for the PRISMA portfolio builder. Each template targets specific professional
 * industries and provides optimized layouts.
 */

import { TemplateType, SectionType } from '@/types/portfolio';

export interface TemplateSection {
  id: SectionType;
  label: string;
  required: boolean;
  defaultVisible: boolean;
  description: string;
  icon: string;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  industry: string[];
  sections: TemplateSection[];
  defaultOrder: SectionType[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: {
    headerStyle: 'minimal' | 'bold' | 'creative';
    sectionSpacing: 'compact' | 'normal' | 'relaxed';
    typography: 'modern' | 'classic' | 'creative';
  };
  features: {
    showcaseProjects: boolean;
    emphasizeSkills: boolean;
    includeTestimonials: boolean;
    socialLinksStyle: 'icons' | 'buttons' | 'minimal';
  };
}

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    required: true,
    defaultVisible: true,
    description: 'Main introduction with name, title, and bio',
    icon: '👋',
  },
  {
    id: 'about',
    label: 'About',
    required: false,
    defaultVisible: true,
    description: 'Detailed professional summary and personal story',
    icon: '👤',
  },
  {
    id: 'experience',
    label: 'Experience',
    required: false,
    defaultVisible: true,
    description: 'Work history and professional experience',
    icon: '💼',
  },
  {
    id: 'projects',
    label: 'Projects',
    required: false,
    defaultVisible: true,
    description: 'Portfolio of work, case studies, and achievements',
    icon: '🚀',
  },
  {
    id: 'skills',
    label: 'Skills',
    required: false,
    defaultVisible: true,
    description: 'Technical and professional competencies',
    icon: '⚡',
  },
  {
    id: 'education',
    label: 'Education',
    required: false,
    defaultVisible: true,
    description: 'Academic background and qualifications',
    icon: '🎓',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    required: false,
    defaultVisible: false,
    description: 'Client and colleague recommendations',
    icon: '💬',
  },
  {
    id: 'contact',
    label: 'Contact',
    required: true,
    defaultVisible: true,
    description: 'Contact information and social links',
    icon: '📞',
  },
];

export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  developer: {
    id: 'developer',
    name: 'Developer',
    description: 'Perfect for software engineers, developers, and technical professionals',
    industry: ['Software Engineering', 'Web Development', 'DevOps', 'Data Science'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'about', 'projects', 'experience', 'skills', 'education', 'contact'],
    colorScheme: {
      primary: '#3B82F6', // Blue
      secondary: '#1E40AF',
      accent: '#06B6D4', // Cyan
      background: '#F8FAFC',
      text: '#1E293B',
    },
    layout: {
      headerStyle: 'minimal',
      sectionSpacing: 'normal',
      typography: 'modern',
    },
    features: {
      showcaseProjects: true,
      emphasizeSkills: true,
      includeTestimonials: false,
      socialLinksStyle: 'icons',
    },
  },
  designer: {
    id: 'designer',
    name: 'Designer',
    description: 'Ideal for UI/UX designers, graphic designers, and creative professionals',
    industry: ['UI/UX Design', 'Graphic Design', 'Product Design', 'Brand Design'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'projects', 'about', 'experience', 'skills', 'education', 'contact'],
    colorScheme: {
      primary: '#EC4899', // Pink
      secondary: '#BE185D',
      accent: '#F59E0B', // Amber
      background: '#FEFBFB',
      text: '#1F2937',
    },
    layout: {
      headerStyle: 'creative',
      sectionSpacing: 'relaxed',
      typography: 'creative',
    },
    features: {
      showcaseProjects: true,
      emphasizeSkills: false,
      includeTestimonials: true,
      socialLinksStyle: 'buttons',
    },
  },
  consultant: {
    id: 'consultant',
    name: 'Consultant',
    description: 'Professional template for consultants and business advisors',
    industry: ['Management Consulting', 'Business Strategy', 'Operations', 'Finance'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'about', 'experience', 'projects', 'skills', 'testimonials', 'education', 'contact'],
    colorScheme: {
      primary: '#059669', // Emerald
      secondary: '#047857',
      accent: '#0891B2', // Cyan
      background: '#F9FAFB',
      text: '#111827',
    },
    layout: {
      headerStyle: 'bold',
      sectionSpacing: 'normal',
      typography: 'classic',
    },
    features: {
      showcaseProjects: false,
      emphasizeSkills: false,
      includeTestimonials: true,
      socialLinksStyle: 'minimal',
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Corporate template for executives and business professionals',
    industry: ['Executive Leadership', 'Business Development', 'Sales', 'Marketing'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'about', 'experience', 'education', 'skills', 'projects', 'contact'],
    colorScheme: {
      primary: '#1F2937', // Gray
      secondary: '#374151',
      accent: '#DC2626', // Red
      background: '#FFFFFF',
      text: '#111827',
    },
    layout: {
      headerStyle: 'bold',
      sectionSpacing: 'compact',
      typography: 'classic',
    },
    features: {
      showcaseProjects: false,
      emphasizeSkills: false,
      includeTestimonials: true,
      socialLinksStyle: 'minimal',
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Dynamic template for artists, writers, and creative professionals',
    industry: ['Art & Design', 'Writing', 'Photography', 'Film & Media'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'projects', 'about', 'experience', 'skills', 'education', 'contact'],
    colorScheme: {
      primary: '#7C3AED', // Violet
      secondary: '#5B21B6',
      accent: '#F59E0B', // Amber
      background: '#FDFCFC',
      text: '#1E1B4B',
    },
    layout: {
      headerStyle: 'creative',
      sectionSpacing: 'relaxed',
      typography: 'creative',
    },
    features: {
      showcaseProjects: true,
      emphasizeSkills: false,
      includeTestimonials: true,
      socialLinksStyle: 'buttons',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and minimal design for any professional field',
    industry: ['Any Industry', 'Academia', 'Research', 'Non-Profit'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'about', 'experience', 'education', 'skills', 'contact'],
    colorScheme: {
      primary: '#000000', // Black
      secondary: '#404040',
      accent: '#666666', // Gray
      background: '#FFFFFF',
      text: '#000000',
    },
    layout: {
      headerStyle: 'minimal',
      sectionSpacing: 'normal',
      typography: 'modern',
    },
    features: {
      showcaseProjects: false,
      emphasizeSkills: false,
      includeTestimonials: false,
      socialLinksStyle: 'minimal',
    },
  },
  educator: {
    id: 'educator',
    name: 'Educator',
    description: 'Academic-focused template for teachers, professors, and educational professionals',
    industry: ['Education', 'Academia', 'Training', 'Research'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'about', 'education', 'experience', 'projects', 'skills', 'contact'],
    colorScheme: {
      primary: '#2563EB', // Blue
      secondary: '#1D4ED8',
      accent: '#059669', // Green
      background: '#F8FAFC',
      text: '#1E293B',
    },
    layout: {
      headerStyle: 'bold',
      sectionSpacing: 'normal',
      typography: 'classic',
    },
    features: {
      showcaseProjects: true,
      emphasizeSkills: false,
      includeTestimonials: true,
      socialLinksStyle: 'minimal',
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with clean lines and modern aesthetics',
    industry: ['Any Industry', 'Technology', 'Startups', 'Digital'],
    sections: TEMPLATE_SECTIONS,
    defaultOrder: ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact'],
    colorScheme: {
      primary: '#6366F1', // Indigo
      secondary: '#4F46E5',
      accent: '#EC4899', // Pink
      background: '#FFFFFF',
      text: '#111827',
    },
    layout: {
      headerStyle: 'minimal',
      sectionSpacing: 'relaxed',
      typography: 'modern',
    },
    features: {
      showcaseProjects: true,
      emphasizeSkills: true,
      includeTestimonials: false,
      socialLinksStyle: 'icons',
    },
  },
};

/**
 * Get template configuration by template type
 */
export function getTemplateConfig(template: TemplateType): TemplateConfig {
  return TEMPLATE_CONFIGS[template];
}

/**
 * Get default section order for a template
 */
export function getDefaultSectionOrder(template: TemplateType): SectionType[] {
  return TEMPLATE_CONFIGS[template].defaultOrder;
}

/**
 * Get template-specific color scheme
 */
export function getTemplateColors(template: TemplateType) {
  return TEMPLATE_CONFIGS[template].colorScheme;
}

/**
 * Check if a section should be visible by default for a template
 */
export function isSectionDefaultVisible(template: TemplateType, section: SectionType): boolean {
  const config = TEMPLATE_CONFIGS[template];
  const sectionConfig = config.sections.find(s => s.id === section);
  return sectionConfig?.defaultVisible ?? false;
}

/**
 * Get template features configuration
 */
export function getTemplateFeatures(template: TemplateType) {
  return TEMPLATE_CONFIGS[template].features;
}

/**
 * Get all available templates with their basic info
 */
export function getAvailableTemplates() {
  return Object.values(TEMPLATE_CONFIGS).map(config => ({
    id: config.id,
    name: config.name,
    description: config.description,
    industry: config.industry,
    colorScheme: config.colorScheme,
  }));
}