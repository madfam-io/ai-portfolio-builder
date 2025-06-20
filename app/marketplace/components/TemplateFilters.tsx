'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TemplateFilters as ITemplateFilters } from '@/types/marketplace';

interface TemplateFiltersProps {
  filters: ITemplateFilters;
  onChange: (filters: ITemplateFilters) => void;
}

export function TemplateFilters({ filters, onChange }: TemplateFiltersProps) {
  const priceRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: 9999 },
    { id: 'budget', label: 'Under $50', min: 0, max: 50 },
    { id: 'mid', label: '$50 - $100', min: 50, max: 100 },
    { id: 'premium', label: '$100 - $200', min: 100, max: 200 },
    { id: 'luxury', label: 'Over $200', min: 200, max: 9999 },
  ];

  const industries = [
    'Technology',
    'Design',
    'Business',
    'Marketing',
    'Education',
    'Healthcare',
    'Finance',
    'Creative',
    'Consulting',
    'Engineering',
  ];

  const handlePriceChange = (rangeId: string) => {
    const range = priceRanges.find(r => r.id === rangeId);
    if (range) {
      onChange({
        ...filters,
        priceRange:
          rangeId === 'all' ? undefined : { min: range.min, max: range.max },
      });
    }
  };

  const handleIndustryToggle = (industry: string) => {
    const current = filters.industries || [];
    const updated = current.includes(industry)
      ? current.filter(i => i !== industry)
      : [...current, industry];

    onChange({
      ...filters,
      industries: updated.length > 0 ? updated : undefined,
    });
  };

  const handleSortChange = (sortBy: string) => {
    onChange({
      ...filters,
      sortBy: sortBy as ITemplateFilters['sortBy'],
    });
  };

  const handleRatingChange = (rating: string) => {
    onChange({
      ...filters,
      rating: rating === 'all' ? undefined : parseInt(rating),
    });
  };

  const clearFilters = () => {
    onChange({
      sortBy: 'popular',
    });
  };

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Sort By</Label>
        <RadioGroup
          value={filters.sortBy || 'popular'}
          onValueChange={handleSortChange}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="popular" id="sort-popular" />
              <Label htmlFor="sort-popular" className="cursor-pointer">
                Most Popular
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="sort-newest" />
              <Label htmlFor="sort-newest" className="cursor-pointer">
                Newest First
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price_low" id="sort-price-low" />
              <Label htmlFor="sort-price-low" className="cursor-pointer">
                Price: Low to High
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price_high" id="sort-price-high" />
              <Label htmlFor="sort-price-high" className="cursor-pointer">
                Price: High to Low
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rating" id="sort-rating" />
              <Label htmlFor="sort-rating" className="cursor-pointer">
                Highest Rated
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Price Range
        </Label>
        <RadioGroup
          value={
            filters.priceRange
              ? priceRanges.find(
                  r =>
                    r.min === filters.priceRange?.min &&
                    r.max === filters.priceRange?.max
                )?.id || 'all'
              : 'all'
          }
          onValueChange={handlePriceChange}
        >
          <div className="space-y-2">
            {priceRanges.map(range => (
              <div key={range.id} className="flex items-center space-x-2">
                <RadioGroupItem value={range.id} id={`price-${range.id}`} />
                <Label htmlFor={`price-${range.id}`} className="cursor-pointer">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Minimum Rating */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Minimum Rating
        </Label>
        <RadioGroup
          value={filters.rating?.toString() || 'all'}
          onValueChange={handleRatingChange}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="rating-all" />
              <Label htmlFor="rating-all" className="cursor-pointer">
                All Ratings
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="rating-4" />
              <Label htmlFor="rating-4" className="cursor-pointer">
                4+ Stars
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="rating-3" />
              <Label htmlFor="rating-3" className="cursor-pointer">
                3+ Stars
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Industries */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Industries</Label>
        <div className="space-y-2">
          {industries.map(industry => (
            <Badge
              key={industry}
              variant={
                filters.industries?.includes(industry) ? 'default' : 'outline'
              }
              className="cursor-pointer mr-2 mb-2"
              onClick={() => handleIndustryToggle(industry)}
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );
}
