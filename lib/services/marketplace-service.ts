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
 * Template Marketplace Service
 *
 * Handles all marketplace operations including browsing, purchasing, and managing premium templates
 */

import { prisma } from '@/lib/db/prisma';
import { generateLicenseKey } from '@/lib/utils/license';
import { track } from '@/lib/monitoring/unified/events';
import type {
  PremiumTemplate,
  TemplatePurchase,
  TemplateReview,
  TemplateSearchParams,
  Currency,
  LicenseType,
  TemplateFeature,
  CustomizationOption,
  TemplateStatus,
  PurchaseStatus,
  ReviewStatus,
} from '@/types/marketplace';

export class MarketplaceService {
  /**
   * Search and filter premium templates
   */
  static async searchTemplates(params: TemplateSearchParams): Promise<{
    templates: PremiumTemplate[];
    total: number;
    hasMore: boolean;
  }> {
    const { query, filters, page = 1, limit = 12 } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const where: any = {
      status: 'active',
    };

    // Apply search query
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ];
    }

    // Apply filters
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.priceRange) {
      where.priceUsd = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    if (filters.rating) {
      where.rating = {
        gte: filters.rating,
      };
    }

    if (filters.industries?.length) {
      where.industries = {
        hasEvery: filters.industries,
      };
    }

    if (filters.featured) {
      where.featured = true;
    }

    if (filters.bestSeller) {
      where.bestSeller = true;
    }

    if (filters.newArrival) {
      where.newArrival = true;
    }

    // Apply sorting
    let orderBy: any;
    switch (filters.sortBy) {
      case 'popular':
        orderBy = { purchasesCount: 'desc' };
        break;
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'price_low':
        orderBy = { priceUsd: 'asc' };
        break;
      case 'price_high':
        orderBy = { priceUsd: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = [{ featured: 'desc' }, { purchasesCount: 'desc' }];
    }

    // Get data and count
    const [data, count] = await Promise.all([
      prisma.premiumTemplate.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.premiumTemplate.count({ where }),
    ]);

    // Track search
    await track.marketplace.search({
      query,
      filters,
      results_count: count || 0,
    });

    return {
      templates: this.transformTemplates(data || []),
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  }

  /**
   * Get a single template by ID or slug
   */
  static async getTemplate(idOrSlug: string): Promise<PremiumTemplate | null> {
    const data = await prisma.premiumTemplate.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: 'active',
      },
    });

    if (!data) return null;

    // Track view
    await this.trackTemplateView(data.id);

    return this.transformTemplate(data);
  }

  /**
   * Get featured templates for homepage
   */
  static async getFeaturedTemplates(limit = 6): Promise<PremiumTemplate[]> {
    const data = await prisma.premiumTemplate.findMany({
      where: {
        status: 'active',
        featured: true,
      },
      orderBy: {
        purchasesCount: 'desc',
      },
      take: limit,
    });

    return this.transformTemplates(data || []);
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(
    category: string,
    limit = 12
  ): Promise<PremiumTemplate[]> {
    const data = await prisma.premiumTemplate.findMany({
      where: {
        status: 'active',
        category: category,
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
    });

    return this.transformTemplates(data || []);
  }

  /**
   * Purchase a template
   */
  static async purchaseTemplate(
    templateId: string,
    userId: string,
    paymentDetails: {
      stripePaymentId: string;
      currency: Currency;
      amount: number;
      discountApplied?: number;
    },
    licenseType: LicenseType = 'single_use'
  ): Promise<TemplatePurchase> {
    // Check if already purchased
    const existing = await prisma.templatePurchase.findFirst({
      where: {
        userId: userId,
        templateId: templateId,
      },
    });

    if (existing) {
      throw new Error('Template already purchased');
    }

    // Create purchase record
    const licenseKey = generateLicenseKey();

    const purchase = await prisma.templatePurchase.create({
      data: {
        userId: userId,
        templateId: templateId,
        purchasePrice: paymentDetails.amount,
        currency: paymentDetails.currency,
        discountApplied: paymentDetails.discountApplied || 0,
        stripePaymentId: paymentDetails.stripePaymentId,
        licenseKey: licenseKey,
        licenseType: licenseType,
      },
      include: {
        template: true,
      },
    });

    // Update template purchase count
    await prisma.premiumTemplate.update({
      where: { id: templateId },
      data: {
        purchasesCount: {
          increment: 1,
        },
      },
    });

    // Track purchase
    await track.marketplace.purchase({
      template_id: templateId,
      user_id: userId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      license_type: licenseType,
    });

    return this.transformPurchase(purchase);
  }

  /**
   * Get user's purchased templates
   */
  static async getUserPurchases(userId: string): Promise<TemplatePurchase[]> {
    const data = await prisma.templatePurchase.findMany({
      where: {
        userId: userId,
      },
      include: {
        template: true,
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    return (data || []).map(purchase =>
      MarketplaceService.transformPurchase(purchase as Record<string, unknown>)
    );
  }

  /**
   * Check if user has purchased a template
   */
  static async hasUserPurchased(
    userId: string,
    templateId: string
  ): Promise<boolean> {
    const data = await prisma.templatePurchase.findFirst({
      where: {
        userId: userId,
        templateId: templateId,
      },
      select: {
        id: true,
      },
    });

    return !!data;
  }

  /**
   * Use a purchased template
   */
  static async useTemplate(
    userId: string,
    templateId: string,
    portfolioName: string
  ): Promise<string> {
    // Verify purchase
    const purchase = await prisma.templatePurchase.findFirst({
      where: {
        userId: userId,
        templateId: templateId,
      },
      include: {
        template: true,
      },
    });

    if (!purchase) {
      throw new Error('Template not purchased');
    }

    if (purchase.status !== 'active') {
      throw new Error('Purchase is not active');
    }

    // Check license limits
    if (purchase.licenseType === 'single_use' && purchase.timesUsed > 0) {
      throw new Error('Single-use license already used');
    }

    // Create portfolio from template
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: userId,
        name: portfolioName,
        template: purchase.template.templateType,
        content: purchase.template.demoPortfolioId
          ? await this.getTemplateContent(purchase.template.demoPortfolioId)
          : {},
        settings: {
          template: purchase.template.templateType,
          premiumTemplateId: templateId,
        },
        isPublished: false,
      },
    });

    // Update usage count
    await prisma.templatePurchase.update({
      where: { id: purchase.id },
      data: {
        timesUsed: purchase.timesUsed + 1,
        lastUsedAt: new Date(),
      },
    });

    // Track usage
    await track.marketplace.useTemplate({
      template_id: templateId,
      user_id: userId,
      portfolio_id: portfolio.id,
      times_used: purchase.times_used + 1,
    });

    return portfolio.id;
  }

  /**
   * Create a review for a purchased template
   */
  static async createReview(
    userId: string,
    templateId: string,
    review: {
      rating: number;
      title?: string;
      comment?: string;
    }
  ): Promise<TemplateReview> {
    // Verify purchase
    const purchase = await prisma.templatePurchase.findFirst({
      where: {
        userId: userId,
        templateId: templateId,
      },
      select: {
        id: true,
      },
    });

    if (!purchase) {
      throw new Error('Cannot review unpurchased template');
    }

    // Check for existing review
    const existing = await prisma.templateReview.findFirst({
      where: {
        userId: userId,
        templateId: templateId,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      throw new Error('You have already reviewed this template');
    }

    // Create review
    const newReview = await prisma.templateReview.create({
      data: {
        userId: userId,
        templateId: templateId,
        purchaseId: purchase.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: 'pending', // Reviews go through moderation
      },
      include: {
        user: true,
      },
    });

    // Update template rating (will be recalculated by a trigger or scheduled job)
    await this.updateTemplateRating(templateId);

    // Track review
    await track.marketplace.review({
      template_id: templateId,
      user_id: userId,
      rating: review.rating,
    });

    return this.transformReview(
      newReview as unknown as Record<string, unknown>
    );
  }

  /**
   * Get reviews for a template
   */
  static async getTemplateReviews(
    templateId: string,
    page = 1,
    limit = 10
  ): Promise<{
    reviews: TemplateReview[];
    total: number;
    averageRating: number;
  }> {
    const offset = (page - 1) * limit;

    const [data, count, stats] = await Promise.all([
      prisma.templateReview.findMany({
        where: {
          templateId: templateId,
          status: 'approved',
        },
        include: {
          user: true,
        },
        orderBy: [{ featured: 'desc' }, { helpfulCount: 'desc' }],
        skip: offset,
        take: limit,
      }),
      prisma.templateReview.count({
        where: {
          templateId: templateId,
          status: 'approved',
        },
      }),
      prisma.templateReview.findMany({
        where: {
          templateId: templateId,
          status: 'approved',
        },
        select: {
          rating: true,
        },
      }),
    ]);

    const averageRating = stats?.length
      ? stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      : 0;

    return {
      reviews: data.map(review =>
        MarketplaceService.transformReview(
          review as unknown as Record<string, unknown>
        )
      ),
      total: count,
      averageRating,
    };
  }

  /**
   * Toggle wishlist item
   */
  static async toggleWishlist(
    userId: string,
    templateId: string
  ): Promise<boolean> {
    // Check if already in wishlist
    const existing = await prisma.templateWishlist.findFirst({
      where: {
        userId: userId,
        templateId: templateId,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.templateWishlist.delete({
        where: {
          id: existing.id,
        },
      });

      await track.marketplace.wishlist({
        action: 'remove',
        template_id: templateId,
        user_id: userId,
      });

      return false;
    } else {
      // Add to wishlist
      await prisma.templateWishlist.create({
        data: {
          userId: userId,
          templateId: templateId,
        },
      });

      await track.marketplace.wishlist({
        action: 'add',
        template_id: templateId,
        user_id: userId,
      });

      return true;
    }
  }

  /**
   * Get user's wishlist
   */
  static async getUserWishlist(userId: string): Promise<PremiumTemplate[]> {
    const data = await prisma.templateWishlist.findMany({
      where: {
        userId: userId,
      },
      include: {
        template: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return data
      .map(item => item.template)
      .filter(Boolean)
      .map(template =>
        MarketplaceService.transformTemplate(
          template as Record<string, unknown>
        )
      );
  }

  // Helper methods

  private static async trackTemplateView(templateId: string) {
    // Update analytics (could be done via edge function for better performance)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert template analytics (you'll need to implement this logic)
    await prisma.templateAnalytics.upsert({
      where: {
        templateId_date: {
          templateId: templateId,
          date: today,
        },
      },
      update: {
        views: {
          increment: 1,
        },
      },
      create: {
        templateId: templateId,
        date: today,
        views: 1,
      },
    });

    await track.marketplace.view({
      template_id: templateId,
    });
  }

  private static async updateTemplateRating(templateId: string) {
    const reviews = await prisma.templateReview.findMany({
      where: {
        templateId: templateId,
        status: 'approved',
      },
      select: {
        rating: true,
      },
    });

    if (!reviews || reviews.length === 0) return;

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.premiumTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        rating: averageRating,
        reviewsCount: reviews.length,
      },
    });
  }

  private static getTemplateContent(_demoPortfolioId: string) {
    // Get content from demo portfolio
    // This would fetch the actual content structure
    return {};
  }

  private static transformTemplate(
    data: Record<string, unknown>
  ): PremiumTemplate {
    return {
      id: data.id as string,
      name: data.name as string,
      slug: data.slug as string,
      description: data.description as string,
      longDescription: data.long_description as string | undefined,
      category: data.category as string,
      tags: (data.tags as string[]) || [],
      priceUsd: data.priceUsd as number,
      priceMxn: data.priceMxn as number,
      priceEur: data.priceEur as number,
      discountPercentage: (data.discountPercentage as number) || 0,
      templateType: data.templateType as string,
      previewUrl: data.previewUrl as string | undefined,
      thumbnailUrl: data.thumbnailUrl as string | undefined,
      galleryImages: (data.galleryImages as string[]) || [],
      demoPortfolioId: data.demoPortfolioId as string | undefined,
      features: (data.features as TemplateFeature[]) || [],
      industries: (data.industries as string[]) || [],
      bestFor: (data.bestFor as string[]) || [],
      customizationOptions:
        (data.customizationOptions as CustomizationOption[]) || [],
      purchasesCount: (data.purchasesCount as number) || 0,
      rating: (data.rating as number) || 0,
      reviewsCount: (data.reviewsCount as number) || 0,
      authorId: data.authorId as string,
      authorName: data.authorName as string,
      authorAvatar: data.authorAvatar as string | undefined,
      revenueShare: (data.revenueShare as number) || 0.7,
      status: data.status as TemplateStatus,
      featured: (data.featured as boolean) || false,
      newArrival: (data.newArrival as boolean) || false,
      bestSeller: (data.bestSeller as boolean) || false,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
      publishedAt: data.publishedAt as Date | undefined,
    };
  }

  private static transformTemplates(
    data: Array<Record<string, unknown>>
  ): PremiumTemplate[] {
    return data.map(item => MarketplaceService.transformTemplate(item));
  }

  private static transformPurchase(
    data: Record<string, unknown>
  ): TemplatePurchase {
    return {
      id: data.id as string,
      userId: data.userId as string,
      templateId: data.templateId as string,
      template: data.template
        ? this.transformTemplate(data.template as Record<string, unknown>)
        : undefined,
      purchasePrice: data.purchasePrice as number,
      currency: data.currency as Currency,
      discountApplied: (data.discountApplied as number) || 0,
      stripePaymentId: data.stripePaymentId as string | undefined,
      licenseKey: data.licenseKey as string,
      licenseType: data.licenseType as LicenseType,
      timesUsed: (data.timesUsed as number) || 0,
      lastUsedAt: data.lastUsedAt as Date | undefined,
      status: data.status as PurchaseStatus,
      purchasedAt: data.purchasedAt as Date,
      expiresAt: data.expiresAt as Date | undefined,
    };
  }

  private static transformReview(
    data: Record<string, unknown>
  ): TemplateReview {
    const user = data.user as Record<string, unknown> | undefined;

    return {
      id: data.id as string,
      templateId: data.templateId as string,
      userId: data.userId as string,
      purchaseId: data.purchaseId as string,
      rating: data.rating as number,
      title: data.title as string | undefined,
      comment: data.comment as string | undefined,
      userName:
        (user?.name as string) || (user?.email as string) || 'Anonymous',
      userAvatar: user?.image as string | undefined,
      helpfulCount: (data.helpfulCount as number) || 0,
      notHelpfulCount: (data.notHelpfulCount as number) || 0,
      status: data.status as ReviewStatus,
      featured: (data.featured as boolean) || false,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
