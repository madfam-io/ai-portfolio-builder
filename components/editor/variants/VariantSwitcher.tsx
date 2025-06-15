'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioVariantsStore } from '@/lib/store/portfolio-variants-store';
import { cn } from '@/lib/utils';
import { CreateVariantDialog } from './CreateVariantDialog';

interface VariantSwitcherProps {
  portfolioId: string;
  className?: string;
  onVariantChange?: (variantId: string) => void;
}

export function VariantSwitcher({
  portfolioId,
  className,
  onVariantChange,
}: VariantSwitcherProps) {
  const { t } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { variants, currentVariantId, switchVariant, isSwitching } =
    usePortfolioVariantsStore();

  const currentVariant = variants.find(v => v.id === currentVariantId);

  const handleVariantSwitch = async (variantId: string) => {
    await switchVariant(variantId);
    onVariantChange?.(variantId);
  };

  const getAudienceEmoji = (type: string) => {
    switch (type) {
      case 'recruiter':
        return '👔';
      case 'hiring-manager':
        return '💼';
      case 'client':
        return '💰';
      case 'investor':
        return '💸';
      case 'conference-organizer':
        return '🎤';
      case 'peer':
        return '🤝';
      default:
        return '👥';
    }
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('min-w-[200px] justify-between', className)}
            disabled={isSwitching}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="truncate">
                {currentVariant
                  ? currentVariant.name
                  : t.selectVariant || 'Select variant'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>
            {t.portfolioVariants || 'Portfolio Variants'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {variants.map(variant => {
            const isActive = variant.id === currentVariantId;
            return (
              <DropdownMenuItem
                key={variant.id}
                onClick={() => handleVariantSwitch(variant.id)}
                className={cn('cursor-pointer', isActive && 'bg-accent')}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getAudienceEmoji(variant.audienceProfile.type)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {variant.audienceProfile.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {variant.isDefault && (
                      <Badge variant="secondary" className="text-xs px-1">
                        {t.default || 'Default'}
                      </Badge>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.createNewVariant || 'Create new variant'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateVariantDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        portfolioId={portfolioId}
        onCreated={variant => {
          setShowCreateDialog(false);
          handleVariantSwitch(variant.id);
        }}
      />
    </>
  );
}
