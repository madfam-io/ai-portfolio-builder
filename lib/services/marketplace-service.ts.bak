/**
 * Template Marketplace Service
 *
 * Handles all marketplace operations including browsing, purchasing, and managing premium templates
 */

import { createClient } from '@/lib/supabase/client';
import { generateLicenseKey } from '@/lib/utils/license';
import { track } from '@/lib/monitoring/unified/events';
import type {
  PremiumTemplate,
  TemplatePurchase,
  TemplateReview,
  TemplateSearchParams,
  Currency,
  LicenseType,
  TemplateFilters,
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
    const supabase = createClient();
    const { query, filters, page = 1, limit = 12 } = params;
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('premium_templates')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Apply search query
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
      );
    }

    // Apply filters
    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters.priceRange) {
      queryBuilder = queryBuilder
        .gte('price_usd', filters.priceRange.min)
        .lte('price_usd', filters.priceRange.max);
    }

    if (filters.rating) {
      queryBuilder = queryBuilder.gte('rating', filters.rating);
    }

    if (filters.industries?.length) {
      queryBuilder = queryBuilder.contains('industries', filters.industries);
    }

    if (filters.featured) {
      queryBuilder = queryBuilder.eq('featured', true);
    }

    if (filters.bestSeller) {
      queryBuilder = queryBuilder.eq('best_seller', true);
    }

    if (filters.newArrival) {
      queryBuilder = queryBuilder.eq('new_arrival', true);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        queryBuilder = queryBuilder.order('purchases_count', {
          ascending: false,
        });
        break;
      case 'newest':
        queryBuilder = queryBuilder.order('published_at', { ascending: false });
        break;
      case 'price_low':
        queryBuilder = queryBuilder.order('price_usd', { ascending: true });
        break;
      case 'price_high':
        queryBuilder = queryBuilder.order('price_usd', { ascending: false });
        break;
      case 'rating':
        queryBuilder = queryBuilder.order('rating', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder
          .order('featured', { ascending: false })
          .order('purchases_count', { ascending: false });
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

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
    const supabase = createClient();

    const { data, error } = await supabase
      .from('premium_templates')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    // Track view
    await this.trackTemplateView(data.id);

    return this.transformTemplate(data);
  }

  /**
   * Get featured templates for homepage
   */
  static async getFeaturedTemplates(limit = 6): Promise<PremiumTemplate[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('premium_templates')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('purchases_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return this.transformTemplates(data || []);
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(
    category: string,
    limit = 12
  ): Promise<PremiumTemplate[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('premium_templates')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

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
    const supabase = createClient();

    // Check if already purchased
    const { data: existing } = await supabase
      .from('template_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (existing) {
      throw new Error('Template already purchased');
    }

    // Create purchase record
    const licenseKey = generateLicenseKey();

    const { data: purchase, error } = await supabase
      .from('template_purchases')
      .insert({
        user_id: userId,
        template_id: templateId,
        purchase_price: paymentDetails.amount,
        currency: paymentDetails.currency,
        discount_applied: paymentDetails.discountApplied || 0,
        stripe_payment_id: paymentDetails.stripePaymentId,
        license_key: licenseKey,
        license_type: licenseType,
      })
      .select('*, template:premium_templates(*)')
      .single();

    if (error) throw error;

    // Update template purchase count
    await supabase.rpc('increment', {
      table_name: 'premium_templates',
      column_name: 'purchases_count',
      row_id: templateId,
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
    const supabase = createClient();

    const { data, error } = await supabase
      .from('template_purchases')
      .select('*, template:premium_templates(*)')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.transformPurchase);
  }

  /**
   * Check if user has purchased a template
   */
  static async hasUserPurchased(
    userId: string,
    templateId: string
  ): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('template_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    return !error && !!data;
  }

  /**
   * Use a purchased template
   */
  static async useTemplate(
    userId: string,
    templateId: string,
    portfolioName: string
  ): Promise<string> {
    const supabase = createClient();

    // Verify purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('template_purchases')
      .select('*, template:premium_templates(*)')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error('Template not purchased');
    }

    if (purchase.status !== 'active') {
      throw new Error('Purchase is not active');
    }

    // Check license limits
    if (purchase.license_type === 'single_use' && purchase.times_used > 0) {
      throw new Error('Single-use license already used');
    }

    // Create portfolio from template
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        name: portfolioName,
        template: purchase.template.template_type,
        content: purchase.template.demo_portfolio_id
          ? await this.getTemplateContent(purchase.template.demo_portfolio_id)
          : {},
        settings: {
          template: purchase.template.template_type,
          premium_template_id: templateId,
        },
        is_published: false,
      })
      .select()
      .single();

    if (portfolioError) throw portfolioError;

    // Update usage count
    await supabase
      .from('template_purchases')
      .update({
        times_used: purchase.times_used + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', purchase.id);

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
    const supabase = createClient();

    // Verify purchase
    const { data: purchase } = await supabase
      .from('template_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (!purchase) {
      throw new Error('Cannot review unpurchased template');
    }

    // Check for existing review
    const { data: existing } = await supabase
      .from('template_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (existing) {
      throw new Error('You have already reviewed this template');
    }

    // Create review
    const { data: newReview, error } = await supabase
      .from('template_reviews')
      .insert({
        user_id: userId,
        template_id: templateId,
        purchase_id: purchase.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: 'pending', // Reviews go through moderation
      })
      .select('*, user:auth.users(email, raw_user_meta_data)')
      .single();

    if (error) throw error;

    // Update template rating (will be recalculated by a trigger or scheduled job)
    await this.updateTemplateRating(templateId);

    // Track review
    await track.marketplace.review({
      template_id: templateId,
      user_id: userId,
      rating: review.rating,
    });

    return this.transformReview(newReview);
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
    const supabase = createClient();
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('template_reviews')
      .select('*, user:auth.users(email, raw_user_meta_data)', {
        count: 'exact',
      })
      .eq('template_id', templateId)
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('helpful_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get average rating
    const { data: stats } = await supabase
      .from('template_reviews')
      .select('rating')
      .eq('template_id', templateId)
      .eq('status', 'approved');

    const averageRating = stats?.length
      ? stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      : 0;

    return {
      reviews: (data || []).map(this.transformReview),
      total: count || 0,
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
    const supabase = createClient();

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('template_wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (existing) {
      // Remove from wishlist
      await supabase.from('template_wishlist').delete().eq('id', existing.id);

      await track.marketplace.wishlist({
        action: 'remove',
        template_id: templateId,
        user_id: userId,
      });

      return false;
    } else {
      // Add to wishlist
      await supabase.from('template_wishlist').insert({
        user_id: userId,
        template_id: templateId,
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
    const supabase = createClient();

    const { data, error } = await supabase
      .from('template_wishlist')
      .select('template:premium_templates(*)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return (data || [])
      .map(item => item.template)
      .filter(Boolean)
      .map(this.transformTemplate);
  }

  // Helper methods

  private static async trackTemplateView(templateId: string) {
    // Update analytics (could be done via edge function for better performance)
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    await supabase.rpc('upsert_template_analytics', {
      p_template_id: templateId,
      p_date: today,
      p_views: 1,
    });

    await track.marketplace.view({
      template_id: templateId,
    });
  }

  private static async updateTemplateRating(templateId: string) {
    const supabase = createClient();

    const { data: reviews } = await supabase
      .from('template_reviews')
      .select('rating')
      .eq('template_id', templateId)
      .eq('status', 'approved');

    if (!reviews || reviews.length === 0) return;

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await supabase
      .from('premium_templates')
      .update({
        rating: averageRating,
        reviews_count: reviews.length,
      })
      .eq('id', templateId);
  }

  private static async getTemplateContent(demoPortfolioId: string) {
    // Get content from demo portfolio
    // This would fetch the actual content structure
    return {};
  }

  private static transformTemplate(data: any): PremiumTemplate {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      longDescription: data.long_description,
      category: data.category,
      tags: data.tags || [],
      priceUsd: parseFloat(data.price_usd),
      priceMxn: parseFloat(data.price_mxn),
      priceEur: parseFloat(data.price_eur),
      discountPercentage: data.discount_percentage || 0,
      templateType: data.template_type,
      previewUrl: data.preview_url,
      thumbnailUrl: data.thumbnail_url,
      galleryImages: data.gallery_images || [],
      demoPortfolioId: data.demo_portfolio_id,
      features: data.features || [],
      industries: data.industries || [],
      bestFor: data.best_for || [],
      customizationOptions: data.customization_options || [],
      purchasesCount: data.purchases_count || 0,
      rating: parseFloat(data.rating) || 0,
      reviewsCount: data.reviews_count || 0,
      authorId: data.author_id,
      authorName: data.author_name,
      authorAvatar: data.author_avatar,
      revenueShare: parseFloat(data.revenue_share) || 0.7,
      status: data.status,
      featured: data.featured || false,
      newArrival: data.new_arrival || false,
      bestSeller: data.best_seller || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
    };
  }

  private static transformTemplates(data: any[]): PremiumTemplate[] {
    return data.map(this.transformTemplate);
  }

  private static transformPurchase(data: any): TemplatePurchase {
    return {
      id: data.id,
      userId: data.user_id,
      templateId: data.template_id,
      template: data.template
        ? this.transformTemplate(data.template)
        : undefined,
      purchasePrice: parseFloat(data.purchase_price),
      currency: data.currency,
      discountApplied: parseFloat(data.discount_applied) || 0,
      stripePaymentId: data.stripe_payment_id,
      licenseKey: data.license_key,
      licenseType: data.license_type,
      timesUsed: data.times_used || 0,
      lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : undefined,
      status: data.status,
      purchasedAt: new Date(data.purchased_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }

  private static transformReview(data: any): TemplateReview {
    return {
      id: data.id,
      templateId: data.template_id,
      userId: data.user_id,
      purchaseId: data.purchase_id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      userName:
        data.user?.raw_user_meta_data?.name || data.user?.email?.split('@')[0],
      userAvatar: data.user?.raw_user_meta_data?.avatar_url,
      helpfulCount: data.helpful_count || 0,
      notHelpfulCount: data.not_helpful_count || 0,
      status: data.status,
      featured: data.featured || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
