/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Template Marketplace Type Definitions
 */

export type TemplateStatus = 'draft' | 'pending_review' | 'active' | 'inactive';
export type LicenseType = 'single_use' | 'unlimited_use' | 'team';
export type PurchaseStatus = 'active' | 'expired' | 'refunded';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type Currency = 'USD' | 'MXN' | 'EUR';

export interface PremiumTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];

  // Pricing
  priceUsd: number;
  priceMxn: number;
  priceEur: number;
  discountPercentage: number;

  // Template details
  templateType: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  galleryImages: string[];
  demoPortfolioId?: string;

  // Features and specifications
  features: TemplateFeature[];
  industries: string[];
  bestFor: string[];
  customizationOptions: CustomizationOption[];

  // Stats
  purchasesCount: number;
  rating: number;
  reviewsCount: number;

  // Author info
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  revenueShare: number;

  // Status
  status: TemplateStatus;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface TemplateFeature {
  icon: string;
  title: string;
  description: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'color' | 'font' | 'layout' | 'component';
  options: string[];
  default: string;
}

export interface TemplatePurchase {
  id: string;
  userId: string;
  templateId: string;
  template?: PremiumTemplate;

  // Purchase details
  purchasePrice: number;
  currency: Currency;
  discountApplied: number;
  stripePaymentId?: string;

  // License info
  licenseKey: string;
  licenseType: LicenseType;

  // Usage tracking
  timesUsed: number;
  lastUsedAt?: Date;

  // Status
  status: PurchaseStatus;

  // Timestamps
  purchasedAt: Date;
  expiresAt?: Date;
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  purchaseId?: string;

  // Review content
  rating: number;
  title?: string;
  comment?: string;

  // User info (joined)
  userName?: string;
  userAvatar?: string;

  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;

  // Status
  status: ReviewStatus;
  featured: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateAnalytics {
  templateId: string;
  date: string;
  views: number;
  previewClicks: number;
  purchaseClicks: number;
  purchases: number;
  revenueUsd: number;
}

export interface TemplateFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  industries?: string[];
  sortBy?: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}

export interface TemplateSearchParams {
  query?: string;
  filters: TemplateFilters;
  page: number;
  limit: number;
}

export interface TemplateMarketplaceStats {
  totalTemplates: number;
  totalPurchases: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}
