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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Rocket,
  Eye,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Users,
  Briefcase,
  Palette,
  GraduationCap,
  Code,
  Search,
} from 'lucide-react';
import {
  DemoPortfolioService,
  type DemoPortfolio,
} from '@/lib/services/demo-portfolio-service';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { track } from '@/lib/monitoring/unified/events';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/refactored-context';

interface QuickStartGalleryProps {
  onSelect?: (demoId: string) => void;
  showTitle?: boolean;
  maxItems?: number;
  userProfile?: {
    industry?: string;
    experience?: string;
    goals?: string[];
  };
}

const industryIcons: Record<string, React.ReactNode> = {
  Technology: <Code className="w-4 h-4" />,
  Design: <Palette className="w-4 h-4" />,
  Business: <Briefcase className="w-4 h-4" />,
  Consulting: <Users className="w-4 h-4" />,
  Creative: <Sparkles className="w-4 h-4" />,
  Education: <GraduationCap className="w-4 h-4" />,
  Marketing: <TrendingUp className="w-4 h-4" />,
  General: <Zap className="w-4 h-4" />,
};

export function QuickStartGallery({
  onSelect,
  showTitle = true,
  maxItems,
  userProfile,
}: QuickStartGalleryProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t: _t } = useLanguage();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [demos, setDemos] = useState<DemoPortfolio[]>([]);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [copiedDemo, setCopiedDemo] = useState<string | null>(null);

  // Get demos based on filters
  useEffect(() => {
    let filteredDemos = DemoPortfolioService.getAvailableDemos(
      selectedIndustry === 'all' ? undefined : selectedIndustry
    );

    // Apply search filter
    if (searchQuery) {
      filteredDemos = filteredDemos.filter(
        demo =>
          demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          demo.features.some(f =>
            f.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Limit results if specified
    if (maxItems) {
      filteredDemos = filteredDemos.slice(0, maxItems);
    }

    setDemos(filteredDemos);
  }, [selectedIndustry, searchQuery, maxItems]);

  // Get recommended demos
  const recommendedDemos = userProfile
    ? DemoPortfolioService.getRecommendedDemos(userProfile)
    : [];

  const handleQuickStart = async (demoId: string) => {
    setLoadingDemo(demoId);

    try {
      // Track selection
      await track.user.action(
        'quick_start_selected',
        user?.id || 'anonymous',
        async () => {},
        {
          demo_id: demoId,
          has_account: !!user,
        }
      );

      if (onSelect) {
        onSelect(demoId);
        return;
      }

      // Create portfolio from demo
      const result = await DemoPortfolioService.createFromDemo({
        userId: user?.id,
        demoId,
        aiEnhance: true,
      });

      // Redirect to editor
      if (result.isTemporary) {
        router.push(`/editor/demo/${result.portfolioId}`);
      } else {
        router.push(`/editor/${result.portfolioId}`);
      }
    } catch (_error) {
      // Failed to create demo portfolio
    } finally {
      setLoadingDemo(null);
    }
  };

  const handlePreview = (demoId: string) => {
    track.user.action(
      'demo_preview_clicked',
      user?.id || 'anonymous',
      async () => {},
      { demo_id: demoId }
    );

    // Open in new tab
    window.open(`/demo/preview/${demoId}`, '_blank');
  };

  const handleClone = async (demoId: string) => {
    if (!user) {
      router.push('/auth/signup');
      return;
    }

    setCopiedDemo(demoId);

    try {
      const portfolioId = await DemoPortfolioService.cloneDemo(
        demoId,
        user.id,
        `Copy of ${demos.find(d => d.id === demoId)?.name}`
      );

      await track.user.action('demo_cloned', user.id, async () => {}, {
        demo_id: demoId,
        portfolio_id: portfolioId,
      });

      setTimeout(() => setCopiedDemo(null), 2000);
    } catch (_error) {
      // Failed to clone demo
      setCopiedDemo(null);
    }
  };

  const industries = [
    'all',
    ...new Set(DemoPortfolioService.getAvailableDemos().map(d => d.industry)),
  ];

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Quick Start Templates</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a professionally designed template and customize it to make
            it your own. All templates include sample content to get you started
            instantly.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <TabsList className="grid grid-cols-4 sm:grid-cols-9 h-auto">
            {industries.map(industry => (
              <TabsTrigger key={industry} value={industry} className="text-xs">
                {industry === 'all' ? (
                  'All'
                ) : (
                  <span className="flex items-center gap-1">
                    {industryIcons[industry]}
                    <span className="hidden sm:inline">{industry}</span>
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Recommended Section */}
      {recommendedDemos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended for You
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedDemos.map(demo => (
              <DemoCard
                key={demo.id}
                demo={demo}
                onQuickStart={handleQuickStart}
                onPreview={handlePreview}
                onClone={handleClone}
                isLoading={loadingDemo === demo.id}
                isCopied={copiedDemo === demo.id}
                isRecommended
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo, index) => (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <DemoCard
              demo={demo}
              onQuickStart={handleQuickStart}
              onPreview={handlePreview}
              onClone={handleClone}
              isLoading={loadingDemo === demo.id}
              isCopied={copiedDemo === demo.id}
            />
          </motion.div>
        ))}
      </div>

      {demos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No templates found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}

interface DemoCardProps {
  demo: DemoPortfolio;
  onQuickStart: (demoId: string) => void;
  onPreview: (demoId: string) => void;
  onClone: (demoId: string) => void;
  isLoading?: boolean;
  isCopied?: boolean;
  isRecommended?: boolean;
}

function DemoCard({
  demo,
  onQuickStart,
  onPreview,
  onClone,
  isLoading,
  isCopied,
  isRecommended,
}: DemoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-all duration-300',
        isRecommended && 'ring-2 ring-primary'
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] bg-muted">
        {!imageError ? (
          <Image
            src={demo.thumbnail}
            alt={demo.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                {industryIcons[demo.industry] || (
                  <Zap className="w-8 h-8 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {demo.template} template
              </p>
            </div>
          </div>
        )}

        {/* Preview button overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPreview(demo.id)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>

        {/* Popularity badge */}
        <Badge
          className="absolute top-2 right-2"
          variant={demo.popularity > 90 ? 'default' : 'secondary'}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {demo.popularity}% popular
        </Badge>

        {isRecommended && (
          <Badge className="absolute top-2 left-2" variant="default">
            <Sparkles className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{demo.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {demo.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {industryIcons[demo.industry]}
            <span className="ml-1">{demo.industry}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1">
          {demo.features.slice(0, 3).map(feature => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1"
            onClick={() => onQuickStart(demo.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-1" />
                Quick Start
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onClone(demo.id)}
            disabled={isCopied}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
