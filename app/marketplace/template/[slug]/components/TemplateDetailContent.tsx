/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Eye,
  Star,
  Check,
  Sparkles,
  Users,
  Shield,
  RefreshCw,
  Heart,
  Share2,
  Download,
  Clock,
  TrendingUp,
  Award,
  Code,
  Palette,
  Layout,
  Zap,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useApp } from '@/lib/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceService } from '@/lib/services/marketplace-service';
import { logger } from '@/lib/utils/logger';
import { loadStripe } from '@stripe/stripe-js';
import type { PremiumTemplate, TemplateReview } from '@/types/marketplace';

interface TemplateDetailContentProps {
  template: PremiumTemplate;
}

export function TemplateDetailContent({
  template,
}: TemplateDetailContentProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currency } = useApp();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<TemplateReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const checkPurchaseStatus = useCallback(async () => {
    try {
      if (!user) return;
      const purchased = await MarketplaceService.hasUserPurchased(
        user.id,
        template.id
      );
      setIsPurchased(purchased);
    } catch (error) {
      logger.error('Failed to check purchase status', error as Error);
    }
  }, [user, template.id]);

  const loadReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const result = await MarketplaceService.getTemplateReviews(template.id);
      setReviews(result.reviews);
    } catch (error) {
      logger.error('Failed to load reviews', error as Error);
    } finally {
      setReviewsLoading(false);
    }
  }, [template.id]);

  useEffect(() => {
    if (user) {
      checkPurchaseStatus();
      loadReviews();
    }
  }, [user, checkPurchaseStatus, loadReviews]);

  const getPrice = () => {
    const prices = {
      USD: template.priceUsd,
      MXN: template.priceMxn,
      EUR: template.priceEur,
    };
    return prices[currency] || template.priceUsd;
  };

  const getFinalPrice = () => {
    const price = getPrice();
    if (template.discountPercentage > 0) {
      return price * (1 - template.discountPercentage / 100);
    }
    return price;
  };

  const formatPrice = (price: number) => {
    const symbols = {
      USD: '$',
      MXN: '$',
      EUR: '€',
    };
    return `${symbols[currency]}${price.toFixed(2)} ${currency}`;
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push(
        '/auth/signin?redirect=/marketplace/template/' + template.slug
      );
      return;
    }

    if (isPurchased) {
      toast({
        title: 'Already Purchased',
        description:
          'You already own this template. Check your dashboard to use it.',
      });
      return;
    }

    setLoading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'template',
          templateId: template.id,
          currency: currency.toLowerCase(),
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe checkout
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey)
        throw new Error('Stripe publishable key not configured');
      const stripe = await loadStripe(publishableKey);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      logger.error('Purchase failed', error as Error);
      toast({
        title: 'Purchase Failed',
        description: 'Unable to process your purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (template.previewUrl) {
      window.open(template.previewUrl, '_blank');
    } else if (template.demoPortfolioId) {
      window.open(`/demo/preview/${template.demoPortfolioId}`, '_blank');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push(
        '/auth/signin?redirect=/marketplace/template/' + template.slug
      );
      return;
    }

    try {
      const newStatus = await MarketplaceService.toggleWishlist(
        user.id,
        template.id
      );
      setIsWishlisted(newStatus);
      toast({
        title: newStatus ? 'Added to Wishlist' : 'Removed from Wishlist',
        description: newStatus
          ? 'Template added to your wishlist.'
          : 'Template removed from your wishlist.',
      });
    } catch (error) {
      logger.error('Failed to toggle wishlist', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: template.name,
        text: template.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Template link copied to clipboard.',
      });
    }
  };

  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(template.rating);
    const hasHalfStar = template.rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-5 h-5 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const galleryImages = [
    template.thumbnailUrl,
    ...template.galleryImages,
  ].filter(Boolean);

  return (
    <BaseLayout>
      <div className="min-h-screen pt-20">
        {/* Header */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <button
                onClick={() => router.push('/marketplace')}
                className="hover:text-primary transition-colors"
              >
                Marketplace
              </button>
              <span>/</span>
              <button
                onClick={() =>
                  router.push(`/marketplace?category=${template.category}`)
                }
                className="hover:text-primary transition-colors"
              >
                {template.category}
              </button>
              <span>/</span>
              <span>{template.name}</span>
            </div>

            <div className="flex flex-wrap items-start gap-2 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold flex-1">
                {template.name}
              </h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">{renderRating()}</div>
                <span className="text-muted-foreground">
                  {template.rating.toFixed(1)} ({template.reviewsCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{template.purchasesCount} sales</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>by {template.authorName}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {template.featured && (
                  <Badge variant="default">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {template.bestSeller && (
                  <Badge variant="secondary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Best Seller
                  </Badge>
                )}
                {template.newArrival && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Images and Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Gallery */}
                <div className="space-y-4">
                  <div className="aspect-[16/10] relative overflow-hidden rounded-lg">
                    {galleryImages[selectedImage] ? (
                      <Image
                        src={galleryImages[selectedImage]}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-primary" />
                      </div>
                    )}
                  </div>

                  {galleryImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {galleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`relative w-24 h-16 rounded overflow-hidden flex-shrink-0 ${
                            selectedImage === idx ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          {img ? (
                            <Image
                              src={img}
                              alt={`${template.name} ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-lg">{template.description}</p>
                      {template.longDescription && (
                        <div className="mt-4">
                          {template.longDescription
                            .split('\n')
                            .map((paragraph, idx) => (
                              <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Best For</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {template.bestFor.map(item => (
                              <Badge key={item} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Industries
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {template.industries.map(industry => (
                              <Badge key={industry} variant="outline">
                                {industry}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4">
                    <div className="grid gap-4">
                      {template.features.map((feature, idx) => (
                        <Card key={idx}>
                          <CardContent className="flex items-start gap-4 pt-6">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {feature.icon === 'code' && (
                                <Code className="w-5 h-5 text-primary" />
                              )}
                              {feature.icon === 'palette' && (
                                <Palette className="w-5 h-5 text-primary" />
                              )}
                              {feature.icon === 'layout' && (
                                <Layout className="w-5 h-5 text-primary" />
                              )}
                              {feature.icon === 'zap' && (
                                <Zap className="w-5 h-5 text-primary" />
                              )}
                              {!feature.icon && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {template.customizationOptions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Customization Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {template.customizationOptions.map(option => (
                              <div key={option.id}>
                                <h5 className="font-medium mb-1">
                                  {option.name}
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {option.options.map(opt => (
                                    <Badge
                                      key={opt}
                                      variant={
                                        opt === option.default
                                          ? 'default'
                                          : 'outline'
                                      }
                                    >
                                      {opt}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    {reviewsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading reviews...
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No reviews yet. Be the first to review this template!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <Card key={review.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold">
                                      {review.userName}
                                    </h5>
                                    {review.featured && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Featured
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {review.title && (
                                <h6 className="font-medium mb-2">
                                  {review.title}
                                </h6>
                              )}
                              {review.comment && (
                                <p className="text-sm text-muted-foreground">
                                  {review.comment}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Purchase Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <div className="space-y-4">
                      <div>
                        {template.discountPercentage > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl text-muted-foreground line-through">
                              {formatPrice(getPrice())}
                            </span>
                            <Badge variant="destructive">
                              -{template.discountPercentage}%
                            </Badge>
                          </div>
                        )}
                        <div className="text-3xl font-bold text-primary">
                          {formatPrice(getFinalPrice())}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handlePurchase}
                          disabled={loading || isPurchased}
                        >
                          {isPurchased ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Already Purchased
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Buy Now
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handlePreview}
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Preview Template
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Secure payment via Stripe</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Download className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span>Instant access after purchase</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Zap className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <span>Free updates & support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Author Card */}
                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Template Author</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {template.authorAvatar ? (
                        <Image
                          src={template.authorAvatar}
                          alt={template.authorName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h5 className="font-semibold">{template.authorName}</h5>
                        <p className="text-sm text-muted-foreground">
                          Professional Designer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
