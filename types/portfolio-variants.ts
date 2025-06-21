/**
 * Portfolio Variants Types
 *
 * Enables professionals to create multiple versions of their portfolio
 * tailored to different audiences and use cases
 */

export type AudienceType =
  | 'recruiter'
  | 'hiring-manager'
  | 'client'
  | 'investor'
  | 'conference-organizer'
  | 'peer'
  | 'general'
  | 'custom';

export type IndustryCategory =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'consulting'
  | 'creative'
  | 'nonprofit'
  | 'government'
  | 'startup'
  | 'enterprise'
  | 'other';

export type ExperienceLevel =
  | 'entry'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'director'
  | 'executive';

export interface AudienceProfile {
  id: string;
  type: AudienceType;
  name: string;
  description?: string;

  // Target characteristics
  industry?: IndustryCategory;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  experienceLevel?: ExperienceLevel;

  // Geographic and cultural
  location?: string;
  language?: string;
  culturalContext?: string;

  // Decision factors
  keyPriorities?: string[];
  painPoints?: string[];
  decisionCriteria?: string[];

  // Keywords and phrases
  importantKeywords?: string[];
  avoidKeywords?: string[];

  // Tone and style preferences
  communicationStyle?: 'formal' | 'casual' | 'technical' | 'creative';
  preferredLength?: 'concise' | 'detailed' | 'comprehensive';
}

export interface PortfolioVariant {
  id: string;
  portfolioId: string;
  name: string;
  slug: string; // URL-friendly identifier

  // Audience targeting
  audienceProfile: AudienceProfile;

  // Variant settings
  isDefault: boolean;
  isPublished: boolean;

  // Content overrides (partial updates to base portfolio)
  contentOverrides: {
    title?: string;
    tagline?: string;
    bio?: string;
    headline?: string;

    // Section visibility
    hiddenSections?: string[];
    sectionOrder?: string[];

    // Project selection and ordering
    featuredProjects?: string[];
    projectOrder?: string[];
    projectOverrides?: Record<
      string,
      {
        description?: string;
        highlights?: string[];
        hidden?: boolean;
      }
    >;

    // Experience emphasis
    experienceOverrides?: Record<
      string,
      {
        description?: string;
        highlights?: string[];
        emphasis?: 'high' | 'normal' | 'low';
      }
    >;

    // Skill prioritization
    primarySkills?: string[];
    secondarySkills?: string[];
    hiddenSkills?: string[];
  };

  // AI optimization settings
  aiOptimization?: {
    autoOptimize: boolean;
    optimizationGoals?: string[];
    lastOptimized?: Date;
    performanceScore?: number;
  };

  // Analytics
  analytics?: {
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    conversionRate: number;
    lastViewed?: Date;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Commented out - currently unused
// interface VariantComparison {
//   variantA: string;
//   variantB: string;
//   metrics: {
//     views: { a: number; b: number };
//     engagement: { a: number; b: number };
//     conversion: { a: number; b: number };
//   };
//   winner?: string;
//   confidence?: number;
// }

export interface ContentOptimizationSuggestion {
  variantId: string;
  section: string;
  field: string;
  currentContent: string;
  suggestedContent: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface VariantAnalytics {
  variantId: string;
  period: 'day' | 'week' | 'month' | 'all-time';
  metrics: {
    totalViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    scrollDepth: number;
    clickThroughRate: number;
    conversionEvents: Array<{
      type:
        | 'contact_click'
        | 'download_resume'
        | 'social_click'
        | 'project_view';
      count: number;
    }>;
  };
  visitorInsights: {
    topCompanies: Array<{ name: string; count: number }>;
    topLocations: Array<{ location: string; count: number }>;
    topReferrers: Array<{ source: string; count: number }>;
    deviceTypes: Record<string, number>;
  };
}

// Helper type for variant creation
export interface CreateVariantInput {
  portfolioId: string;
  name: string;
  audienceType: AudienceType;
  audienceDetails?: Partial<AudienceProfile>;
  basedOnVariant?: string; // Copy from existing variant
}

// Type for variant preview/comparison
// Commented out - currently unused
// interface VariantPreview {
//   id: string;
//   name: string;
//   audienceType: AudienceType;
//   thumbnailUrl?: string;
//   lastUpdated: Date;
//   performance: {
//     views: number;
//     conversion: number;
//     trend: 'up' | 'down' | 'stable';
//   };
// }
