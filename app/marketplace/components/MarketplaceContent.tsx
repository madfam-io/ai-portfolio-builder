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
import { useRouter, useSearchParams } from 'next/navigation';
import BaseLayout from '@/components/layouts/BaseLayout';
import { MarketplaceService } from '@/lib/services/marketplace-service';
import { logger } from '@/lib/utils/logger';
import { TemplateCard } from './TemplateCard';
import { TemplateFilters } from './TemplateFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Loader2,
  TrendingUp,
  Sparkles,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import type {
  PremiumTemplate,
  TemplateFilters as ITemplateFilters,
} from '@/types/marketplace';

export function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t: _t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [templates, setTemplates] = useState<PremiumTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<ITemplateFilters>({
    category: searchParams.get('category') || undefined,
    sortBy: 'popular',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Featured sections
  const [featuredTemplates, setFeaturedTemplates] = useState<PremiumTemplate[]>(
    []
  );
  const [newArrivals, setNewArrivals] = useState<PremiumTemplate[]>([]);
  const [bestSellers, setBestSellers] = useState<PremiumTemplate[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const result = await MarketplaceService.searchTemplates({
        query: searchQuery,
        filters,
        page,
        limit: 12,
      });

      if (page === 1) {
        setTemplates(result.templates);
      } else {
        setTemplates(prev => [...prev, ...result.templates]);
      }

      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error('Failed to load templates', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page, toast]);

  const loadFeaturedSections = useCallback(async () => {
    try {
      // Load featured templates
      const featured = await MarketplaceService.getFeaturedTemplates(3);
      setFeaturedTemplates(featured);

      // Load new arrivals
      const newArrivalsResult = await MarketplaceService.searchTemplates({
        filters: { newArrival: true, sortBy: 'newest' },
        page: 1,
        limit: 4,
      });
      setNewArrivals(newArrivalsResult.templates);

      // Load best sellers
      const bestSellersResult = await MarketplaceService.searchTemplates({
        filters: { bestSeller: true, sortBy: 'popular' },
        page: 1,
        limit: 4,
      });
      setBestSellers(bestSellersResult.templates);
    } catch (error) {
      logger.error('Failed to load featured sections', error as Error);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    loadFeaturedSections();
  }, [loadTemplates, loadFeaturedSections]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTemplates();
  };

  const handleFilterChange = (newFilters: ITemplateFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleTemplateClick = (template: PremiumTemplate) => {
    router.push(`/marketplace/template/${template.slug}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: '✨' },
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'minimal', name: 'Minimal', icon: '⚡' },
    { id: 'technical', name: 'Technical', icon: '💻' },
    { id: 'academic', name: 'Academic', icon: '🎓' },
    { id: 'portfolio', name: 'Portfolio', icon: '📁' },
  ];

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium Templates
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Portfolio Templates
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Stand out with expertly designed templates crafted by
              professionals. Perfect for developers, designers, consultants, and
              creators.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={
                    filters.category === category.id ||
                    (category.id === 'all' && !filters.category)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      category: category.id === 'all' ? undefined : category.id,
                    })
                  }
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Templates */}
        {featuredTemplates.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Featured Templates
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => handleTemplateClick(template)}
                    featured
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">All Templates</h2>
                <p className="text-muted-foreground">
                  {total} templates available
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mb-8 p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <TemplateFilters
                  filters={filters}
                  onChange={handleFilterChange}
                />
              </div>
            )}

            {/* Templates Grid */}
            {loading && page === 1 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* New Arrivals & Best Sellers */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* New Arrivals */}
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-primary" />
                  New Arrivals
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {newArrivals.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                      compact
                    />
                  ))}
                </div>
              </div>

              {/* Best Sellers */}
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Best Sellers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bestSellers.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-16 px-4 bg-primary/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Create Your Professional Portfolio?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Sign up now and get access to premium templates and advanced
                features.
              </p>
              <Button size="lg" onClick={() => router.push('/auth/signup')}>
                Get Started Free
              </Button>
            </div>
          </section>
        )}
      </div>
    </BaseLayout>
  );
}
