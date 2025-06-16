import { getTemplateConfig } from '@/lib/templates/templateConfig';

import { SAMPLE_DATA_BY_TEMPLATE } from './sample-data';

import type { Portfolio, TemplateType } from '@/types/portfolio';

/**
 * @fileoverview Sample Data Generator
 *
 * Generates realistic sample portfolio data for demos and testing.
 * Includes template-specific content and industry-appropriate examples.
 */

export function generateSamplePortfolio(template: TemplateType): Portfolio {
  const sampleData = SAMPLE_DATA_BY_TEMPLATE[template];
  const templateConfig = getTemplateConfig(template);

  if (!sampleData) {
    throw new Error(`No sample data available for template: ${template}`);
  }

  return {
    id: 'sample-portfolio',
    userId: 'demo-user',
    subdomain: 'demo',
    customDomain: undefined,
    template,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: sampleData.name,
    title: sampleData.title,
    bio: sampleData.bio,
    tagline: sampleData.tagline,
    avatarUrl: '/api/placeholder/150/150',
    contact: {
      email: sampleData.email,
      phone: sampleData.phone,
      location: sampleData.location,
    },
    experience: sampleData.experience,
    projects: sampleData.projects,
    education: sampleData.education,
    skills: sampleData.skills,
    certifications: sampleData.certifications,
    social: sampleData.social,
    customization: {
      primaryColor: templateConfig.colorScheme?.primary,
      secondaryColor: templateConfig.colorScheme?.secondary,
      accentColor: templateConfig.colorScheme?.accent,
      backgroundColor: templateConfig.colorScheme?.background,
      textColor: templateConfig.colorScheme?.text,
      fontFamily: 'system-ui',
      fontSize: 'medium',
      spacing: 'normal',
      borderRadius: 'medium',
      headerStyle: templateConfig.layout?.headerStyle || 'minimal',
    },
    status: 'published' as const,
  };
}

/**
 * Get sample projects for a specific template
 */
function getSampleProjects(template: TemplateType) {
  const sampleData = SAMPLE_DATA_BY_TEMPLATE[template];
  return sampleData?.projects || [];
}

/**
 * Get sample experience for a specific template
 */
function getSampleExperience(template: TemplateType) {
  const sampleData = SAMPLE_DATA_BY_TEMPLATE[template];
  return sampleData?.experience || [];
}

/**
 * Get sample skills for a specific template
 */
function getSampleSkills(template: TemplateType) {
  const sampleData = SAMPLE_DATA_BY_TEMPLATE[template];
  return sampleData?.skills || [];
}

/**
 * Generate random avatars for demo purposes
 */
function getRandomAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

/**
 * Generate placeholder images for projects
 */
function getProjectPlaceholder(index: number): string {
  return `https://picsum.photos/seed/project${index}/800/600`;
}
