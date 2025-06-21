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

import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  ShoppingCart,
  Eye,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
} from 'lucide-react';
import type { PremiumTemplate } from '@/types/marketplace';
import { useApp } from '@/lib/contexts/AppContext';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: PremiumTemplate;
  onClick: () => void;
  featured?: boolean;
  compact?: boolean;
}

export function TemplateCard({
  template,
  onClick,
  featured,
  compact,
}: TemplateCardProps) {
  const { currency } = useApp();

  // Get price based on currency
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

  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(template.rating);
    const hasHalfStar = template.rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (compact) {
    return (
      <Card
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex">
          <div className="relative w-32 h-32 flex-shrink-0">
            {template.thumbnailUrl ? (
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4">
            <h3 className="font-semibold mb-1 line-clamp-1">{template.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderRating()}</div>
              <span className="text-sm text-muted-foreground">
                ({template.reviewsCount})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {template.discountPercentage > 0 && (
                  <span className="text-sm text-muted-foreground line-through mr-2">
                    {formatPrice(getPrice())}
                  </span>
                )}
                <span className="font-bold text-primary">
                  {formatPrice(getFinalPrice())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group',
        featured && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {template.thumbnailUrl ? (
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        )}

        {/* Overlay with preview button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
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

        {/* Discount badge */}
        {template.discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            -{template.discountPercentage}%
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">
              {template.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">{renderRating()}</div>
          <span className="text-sm text-muted-foreground">
            {template.rating.toFixed(1)} ({template.reviewsCount} reviews)
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{template.purchasesCount} sales</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div>
            {template.discountPercentage > 0 && (
              <span className="text-sm text-muted-foreground line-through mr-2">
                {formatPrice(getPrice())}
              </span>
            )}
            <span className="text-xl font-bold text-primary">
              {formatPrice(getFinalPrice())}
            </span>
          </div>
          <Button size="sm" variant="default">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Buy Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
