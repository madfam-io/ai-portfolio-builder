export type Language = 'es' | 'en';

export interface TranslationKeys {
  // Navigation
  features: string;
  howItWorks: string;
  templates: string;
  pricing: string;
  getStarted: string;

  // Hero Section
  heroTitle: string;
  heroTitle2: string;
  heroTitle3: string;
  heroDesc: string;
  watchDemo: string;
  startFreeTrial: string;

  // Social Proof
  trustedBy: string;

  // Features
  featuresTitle: string;
  featuresSubtitle: string;
  aiContentTitle: string;
  aiContentDesc: string;
  oneClickTitle: string;
  oneClickDesc: string;
  templatesTitle: string;
  templatesDesc: string;
  customDomainTitle: string;
  customDomainDesc: string;
  analyticsTitle: string;
  analyticsDesc: string;
  mobileTitle: string;
  mobileDesc: string;

  // How It Works
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Templates Section
  templatesSecTitle: string;
  templatesSecSubtitle: string;
  useTemplate: string;
  minimalDev: string;
  minimalDevDesc: string;
  creativeDesigner: string;
  creativeDesignerDesc: string;
  businessPro: string;
  businessProDesc: string;

  // Pricing
  pricingTitle: string;
  pricingSubtitle: string;
  free: string;
  pro: string;
  business: string;
  mostPopular: string;
  month: string;
  portfolio: string;
  portfolios: string;
  basicTemplates: string;
  allTemplates: string;
  subdomain: string;
  customDomain: string;
  aiRewrites: string;
  unlimitedAI: string;
  analytics: string;
  unlimitedPortfolios: string;
  whiteLabel: string;
  apiAccess: string;
  teamCollaboration: string;
  prioritySupport: string;
  startFree: string;
  startProTrial: string;
  contactSales: string;

  // CTA
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  ctaFooter: string;

  // Footer
  footerTagline: string;
  product: string;
  company: string;
  legal: string;
  about: string;
  blog: string;
  careers: string;
  contact: string;
  privacy: string;
  terms: string;
  gdpr: string;
  api: string;
  rightsReserved: string;

  // Common
  noCreditCard: string;
  joinProfessionals: string;
  rating: string;
}

export type Translations = {
  [K in Language]: TranslationKeys;
};
