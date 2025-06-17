'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Lock, Check, TrendingUp, Download, Eye } from 'lucide-react';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// import { useLanguage } from '@/lib/i18n/refactored-context';
import { useAuthStore } from '@/lib/store/auth-store';
import { useToast } from '@/hooks/use-toast';

interface PremiumTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  previewUrl: string;
  thumbnailUrl: string;
  downloads: number;
  rating: number;
  isNew?: boolean;
  isPremium: boolean;
  author?: string;
}

const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    description:
      'Premium template for C-level executives and senior leadership',
    price: 2900,
    category: 'business',
    features: [
      'Executive summary section',
      'Board positions tracker',
      'Speaking engagements',
      'Media mentions',
      'Achievement timeline',
    ],
    previewUrl: '/templates/preview/executive-suite',
    thumbnailUrl: '/images/templates/executive-suite.jpg',
    downloads: 1250,
    rating: 4.9,
    isNew: true,
    isPremium: true,
    author: 'PRISMA Elite',
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    description: 'Perfect for entrepreneurs and startup founders',
    price: 1900,
    category: 'business',
    features: [
      'Company showcase',
      'Pitch deck integration',
      'Investor relations',
      'Press kit section',
      'Team showcase',
    ],
    previewUrl: '/templates/preview/startup-founder',
    thumbnailUrl: '/images/templates/startup-founder.jpg',
    downloads: 890,
    rating: 4.8,
    isPremium: true,
    author: 'PRISMA Elite',
  },
  {
    id: 'creative-director',
    name: 'Creative Director',
    description: 'Stunning visual portfolio for creative professionals',
    price: 2400,
    category: 'creative',
    features: [
      'Full-screen galleries',
      'Video backgrounds',
      'Client testimonials',
      'Award showcase',
      'Process timeline',
    ],
    previewUrl: '/templates/preview/creative-director',
    thumbnailUrl: '/images/templates/creative-director.jpg',
    downloads: 2100,
    rating: 4.9,
    isPremium: true,
    author: 'PRISMA Elite',
  },
  {
    id: 'tech-innovator',
    name: 'Tech Innovator',
    description: 'Modern template for tech leaders and innovators',
    price: 1900,
    category: 'developer',
    features: [
      'GitHub activity feed',
      'Tech stack visualization',
      'Open source contributions',
      'Patents & publications',
      'Speaking timeline',
    ],
    previewUrl: '/templates/preview/tech-innovator',
    thumbnailUrl: '/images/templates/tech-innovator.jpg',
    downloads: 1560,
    rating: 4.7,
    isPremium: true,
    author: 'PRISMA Elite',
  },
  {
    id: 'agency-pro',
    name: 'Agency Pro',
    description: 'Professional template for agencies and consultants',
    price: 2900,
    category: 'consultant',
    features: [
      'Case studies section',
      'Client logos grid',
      'Service packages',
      'Team profiles',
      'Contact forms',
    ],
    previewUrl: '/templates/preview/agency-pro',
    thumbnailUrl: '/images/templates/agency-pro.jpg',
    downloads: 780,
    rating: 4.8,
    isNew: true,
    isPremium: true,
    author: 'PRISMA Elite',
  },
  {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    description: 'Comprehensive template for researchers and academics',
    price: 1900,
    category: 'educator',
    features: [
      'Publication list',
      'Research interests',
      'Course catalog',
      'Student testimonials',
      'CV download',
    ],
    previewUrl: '/templates/preview/academic-scholar',
    thumbnailUrl: '/images/templates/academic-scholar.jpg',
    downloads: 620,
    rating: 4.6,
    isPremium: true,
    author: 'PRISMA Elite',
  },
];

export default function TemplateMarketplacePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasingTemplate, setPurchasingTemplate] = useState<string | null>(
    null
  );

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business' },
    { id: 'creative', name: 'Creative' },
    { id: 'developer', name: 'Developer' },
    { id: 'consultant', name: 'Consultant' },
    { id: 'educator', name: 'Educator' },
  ];

  const filteredTemplates = PREMIUM_TEMPLATES.filter(
    template =>
      selectedCategory === 'all' || template.category === selectedCategory
  );

  const handlePurchaseTemplate = async (templateId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase premium templates',
        variant: 'default',
      });
      return;
    }

    setPurchasingTemplate(templateId);
    try {
      // TODO: Implement template purchase API
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Purchase initiated',
        description: 'You will be redirected to complete your purchase.',
      });
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPurchasingTemplate(null);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Premium Template Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Elevate your portfolio with professionally designed templates
              created by top designers
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Free Templates Notice */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    8 Free Templates Included
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All accounts include access to our core template collection.
                    Premium templates offer advanced features and unique
                    designs.
                  </p>
                </div>
                <Link href="/editor/new">
                  <Button variant="outline">Browse Free Templates</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Premium Templates Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted relative group">
                  {/* Thumbnail placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-6xl opacity-20">
                      {template.name[0]}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Link href={template.previewUrl}>
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {template.isNew && <Badge variant="destructive">New</Badge>}
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatPrice(template.price)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {template.features.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{template.features.length - 3} more features
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{template.downloads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    {template.author && (
                      <div className="text-xs">by {template.author}</div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchaseTemplate(template.id)}
                    disabled={purchasingTemplate === template.id}
                  >
                    {purchasingTemplate === template.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Purchase Template
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="mt-12 text-center">
            <Card className="inline-block">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">
                      More Templates Coming Soon
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;re adding new premium templates every month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
