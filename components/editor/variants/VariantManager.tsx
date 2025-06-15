'use client';

import { useState } from 'react';
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Sparkles,
  BarChart,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioVariantsStore } from '@/lib/store/portfolio-variants-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreateVariantDialog } from './CreateVariantDialog';
import { VariantAnalyticsDialog } from './VariantAnalyticsDialog';
import type { PortfolioVariant } from '@/types/portfolio-variants';

interface VariantManagerProps {
  portfolioId: string;
  onVariantChange?: (variant: PortfolioVariant) => void;
}

export function VariantManager({
  portfolioId,
  onVariantChange,
}: VariantManagerProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  const [duplicatingVariant, setDuplicatingVariant] = useState<string | null>(
    null
  );

  const {
    variants,
    currentVariantId,
    isLoading,
    switchVariant,
    updateVariant,
    deleteVariant,
    generateOptimizationSuggestions,
  } = usePortfolioVariantsStore();

  const handleVariantSwitch = async (variantId: string) => {
    await switchVariant(variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant && onVariantChange) {
      onVariantChange(variant);
    }
  };

  const handleTogglePublish = async (variant: PortfolioVariant) => {
    try {
      await updateVariant(variant.id, { isPublished: !variant.isPublished });
      toast({
        title: variant.isPublished
          ? t.variantUnpublished || 'Variant unpublished'
          : t.variantPublished || 'Variant published',
        description: variant.isPublished
          ? t.variantUnpublishedDesc || 'Variant is now unpublished'
          : t.variantPublishedDesc || 'Variant is now live',
      });
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToUpdateVariant || 'Failed to update variant',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (variant: PortfolioVariant) => {
    setDuplicatingVariant(variant.id);
    setShowCreateDialog(true);
  };

  const handleDelete = async (variantId: string) => {
    if (
      !confirm(
        t.confirmDeleteVariant ||
          'Are you sure you want to delete this variant?'
      )
    )
      return;

    try {
      await deleteVariant(variantId);
      toast({
        title: t.variantDeleted || 'Variant deleted',
        description: t.variantDeletedDesc || 'The variant has been removed',
      });
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToDeleteVariant || 'Failed to delete variant',
        variant: 'destructive',
      });
    }
  };

  const handleOptimize = async (variantId: string) => {
    try {
      const suggestions = await generateOptimizationSuggestions(variantId);
      toast({
        title: t.optimizationSuggestions || 'Optimization suggestions',
        description: `${suggestions.length} ${t.suggestionsGenerated || 'suggestions generated'}`,
      });
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description:
          t.failedToGenerateSuggestions || 'Failed to generate suggestions',
        variant: 'destructive',
      });
    }
  };

  const getAudienceIcon = (type: string) => {
    switch (type) {
      case 'recruiter':
      case 'hiring-manager':
        return '👔';
      case 'client':
        return '💼';
      case 'investor':
        return '💰';
      case 'conference-organizer':
        return '🎤';
      case 'peer':
        return '🤝';
      default:
        return '👥';
    }
  };

  const getPerformanceTrend = (variant: PortfolioVariant) => {
    const views = variant.analytics?.views || 0;
    const conversion = variant.analytics?.conversionRate || 0;

    if (views < 10) return 'neutral';
    if (conversion > 0.15) return 'excellent';
    if (conversion > 0.1) return 'good';
    if (conversion > 0.05) return 'average';
    return 'poor';
  };

  const performanceColors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    average: 'text-yellow-600',
    poor: 'text-red-600',
    neutral: 'text-gray-600',
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t.portfolioVariants || 'Portfolio Variants'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.variantsDescription ||
              'Create different versions for different audiences'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t.createVariant || 'Create Variant'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {variants.map(variant => {
          const isActive = variant.id === currentVariantId;
          const performance = getPerformanceTrend(variant);

          return (
            <Card
              key={variant.id}
              className={cn(
                'relative cursor-pointer transition-all hover:shadow-md',
                isActive && 'ring-2 ring-primary'
              )}
              onClick={() => handleVariantSwitch(variant.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getAudienceIcon(variant.audienceProfile.type)}
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        {variant.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {variant.audienceProfile.name}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setShowAnalytics(variant.id);
                        }}
                      >
                        <BarChart className="h-4 w-4 mr-2" />
                        {t.viewAnalytics || 'View Analytics'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleOptimize(variant.id);
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t.optimizeContent || 'Optimize Content'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleTogglePublish(variant);
                        }}
                      >
                        {variant.isPublished ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />{' '}
                            {t.unpublish || 'Unpublish'}
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />{' '}
                            {t.publish || 'Publish'}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDuplicate(variant);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t.duplicate || 'Duplicate'}
                      </DropdownMenuItem>
                      {!variant.isDefault && (
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDelete(variant.id);
                          }}
                          className="text-destructive"
                        >
                          {t.delete || 'Delete'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {variant.isDefault && (
                      <Badge variant="secondary">
                        {t.default || 'Default'}
                      </Badge>
                    )}
                    {variant.isPublished ? (
                      <Badge variant="default">
                        {t.published || 'Published'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t.draft || 'Draft'}</Badge>
                    )}
                    {isActive && (
                      <Badge variant="default" className="bg-primary">
                        {t.editing || 'Editing'}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.views || 'Views'}
                      </span>
                      <span className="font-medium">
                        {variant.analytics?.views || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.conversion || 'Conversion'}
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          performanceColors[performance]
                        )}
                      >
                        {(
                          (variant.analytics?.conversionRate || 0) * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>

                  {variant.aiOptimization?.lastOptimized && (
                    <p className="text-xs text-muted-foreground">
                      {t.lastOptimized || 'Last optimized'}:{' '}
                      {new Date(
                        variant.aiOptimization.lastOptimized
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add variant card */}
        <Card
          className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowCreateDialog(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
            <Plus className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">
              {t.addVariant || 'Add Variant'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateVariantDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        portfolioId={portfolioId}
        basedOnVariantId={duplicatingVariant}
        onCreated={variant => {
          setShowCreateDialog(false);
          setDuplicatingVariant(null);
          handleVariantSwitch(variant.id);
        }}
      />

      {showAnalytics && (
        <VariantAnalyticsDialog
          variantId={showAnalytics}
          open={true}
          onOpenChange={() => setShowAnalytics(null)}
        />
      )}
    </div>
  );
}
