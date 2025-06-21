'use client';

import { useState } from 'react';
import { Palette, Type, Layout, Sparkles, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { TemplateCustomization } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface ThemeCustomizerProps {
  customization: TemplateCustomization | undefined;
  onUpdate: (customization: TemplateCustomization) => void;
  template: string;
}

const DEFAULT_MINIMAL_THEME: TemplateCustomization = {
  primaryColor: '#000000',
  secondaryColor: '#6b7280',
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  fontFamily: 'Inter',
  fontSize: 'small',
  spacing: 'compact',
  borderRadius: 'none',
  headerStyle: 'minimal',
  darkMode: false,
};

type ThemeKey = 'developer' | 'designer' | 'consultant' | 'minimal';

const DEFAULT_THEMES: Record<ThemeKey, TemplateCustomization> = {
  developer: {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    fontSize: 'medium',
    spacing: 'normal',
    borderRadius: 'medium',
    headerStyle: 'modern',
    darkMode: false,
  },
  designer: {
    primaryColor: '#ec4899',
    secondaryColor: '#f59e0b',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Poppins',
    fontSize: 'medium',
    spacing: 'relaxed',
    borderRadius: 'large',
    headerStyle: 'creative',
    darkMode: false,
  },
  consultant: {
    primaryColor: '#1f2937',
    secondaryColor: '#3b82f6',
    accentColor: '#059669',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Roboto',
    fontSize: 'medium',
    spacing: 'normal',
    borderRadius: 'small',
    headerStyle: 'classic',
    darkMode: false,
  },
  minimal: DEFAULT_MINIMAL_THEME,
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', className: 'font-sans' },
  { value: 'Roboto', label: 'Roboto', className: 'font-sans' },
  { value: 'Poppins', label: 'Poppins', className: 'font-sans' },
  {
    value: 'Playfair Display',
    label: 'Playfair Display',
    className: 'font-serif',
  },
  { value: 'Montserrat', label: 'Montserrat', className: 'font-sans' },
  { value: 'Open Sans', label: 'Open Sans', className: 'font-sans' },
  { value: 'Lato', label: 'Lato', className: 'font-sans' },
  { value: 'Raleway', label: 'Raleway', className: 'font-sans' },
];

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#a855f7', // Violet
];

// eslint-disable-next-line complexity
export function ThemeCustomizer({
  customization,
  onUpdate,
  template,
}: ThemeCustomizerProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'colors' | 'typography' | 'layout'
  >('colors');

  // Use default theme if customization is undefined
  const getDefaultTheme = (): TemplateCustomization => {
    // Type guard to ensure template is a valid key
    const isValidTemplateKey = (key: string): key is ThemeKey => {
      return key in DEFAULT_THEMES;
    };

    if (isValidTemplateKey(template)) {
      return DEFAULT_THEMES[template];
    }

    // Fallback to minimal theme
    return DEFAULT_MINIMAL_THEME;
  };

  const currentCustomization: TemplateCustomization =
    customization || getDefaultTheme();

  const handleColorChange = (
    field: keyof TemplateCustomization,
    value: string
  ) => {
    onUpdate({
      ...currentCustomization,
      [field]: value,
    });
  };

  const handleResetToDefault = () => {
    onUpdate(getDefaultTheme());
  };

  const renderColorPicker = (
    label: string,
    field: keyof TemplateCustomization,
    description?: string
  ) => {
    const currentValue = (currentCustomization?.[field] || '') as string;

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={currentValue || '#000000'}
            onChange={e => handleColorChange(field, e.target.value)}
            className="w-16 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={currentValue || ''}
            onChange={e => handleColorChange(field, e.target.value)}
            placeholder="#000000"
            className="flex-1 font-mono text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              className={cn(
                'w-6 h-6 rounded border-2 transition-all',
                currentValue === color ? 'border-primary' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(field, color)}
              title={color}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t.themeCustomization || 'Theme Customization'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.themeDescription ||
              'Customize the look and feel of your portfolio'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetToDefault}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t.resetToDefault || 'Reset'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <button
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            activeTab === 'colors'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('colors')}
        >
          <Palette className="h-4 w-4 inline mr-2" />
          {t.colors || 'Colors'}
        </button>
        <button
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            activeTab === 'typography'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('typography')}
        >
          <Type className="h-4 w-4 inline mr-2" />
          {t.typography || 'Typography'}
        </button>
        <button
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            activeTab === 'layout'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('layout')}
        >
          <Layout className="h-4 w-4 inline mr-2" />
          {t.layout || 'Layout'}
        </button>
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent className="pt-6">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {renderColorPicker(
                t.primaryColor || 'Primary Color',
                'primaryColor',
                t.primaryColorDesc || 'Main brand color for buttons and links'
              )}
              {renderColorPicker(
                t.secondaryColor || 'Secondary Color',
                'secondaryColor',
                t.secondaryColorDesc || 'Complementary color for accents'
              )}
              {renderColorPicker(
                t.accentColor || 'Accent Color',
                'accentColor',
                t.accentColorDesc || 'Highlight color for special elements'
              )}
              {renderColorPicker(
                t.backgroundColor || 'Background Color',
                'backgroundColor',
                t.backgroundColorDesc || 'Main background color'
              )}
              {renderColorPicker(
                t.textColor || 'Text Color',
                'textColor',
                t.textColorDesc || 'Primary text color'
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">
                      {t.darkMode || 'Dark Mode'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t.darkModeDesc || 'Enable dark theme variant'}
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={currentCustomization.darkMode || false}
                    onCheckedChange={checked =>
                      onUpdate({
                        ...currentCustomization,
                        darkMode: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="fontFamily">
                  {t.fontFamily || 'Font Family'}
                </Label>
                <RadioGroup
                  value={currentCustomization.fontFamily || 'Inter'}
                  onValueChange={(value: string) =>
                    onUpdate({
                      ...currentCustomization,
                      fontFamily: value,
                    })
                  }
                  className="mt-2 space-y-2"
                >
                  {FONT_OPTIONS.map(font => (
                    <div
                      key={font.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={font.value} id={font.value} />
                      <Label
                        htmlFor={font.value}
                        className={cn('cursor-pointer', font.className)}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>{t.fontSize || 'Font Size'}</Label>
                <RadioGroup
                  value={currentCustomization.fontSize || 'medium'}
                  onValueChange={(value: string) =>
                    onUpdate({
                      ...currentCustomization,
                      fontSize: value as 'small' | 'medium' | 'large',
                    })
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small" className="cursor-pointer text-sm">
                      {t.small || 'Small'} (14px base)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">
                      {t.medium || 'Medium'} (16px base)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large" className="cursor-pointer text-lg">
                      {t.large || 'Large'} (18px base)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <Label>{t.spacing || 'Spacing'}</Label>
                <RadioGroup
                  value={currentCustomization.spacing || 'normal'}
                  onValueChange={(value: string) =>
                    onUpdate({
                      ...currentCustomization,
                      spacing: value as 'compact' | 'normal' | 'relaxed',
                    })
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="compact" />
                    <Label htmlFor="compact" className="cursor-pointer">
                      {t.compact || 'Compact'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer">
                      {t.normal || 'Normal'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relaxed" id="relaxed" />
                    <Label htmlFor="relaxed" className="cursor-pointer">
                      {t.relaxed || 'Relaxed'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>{t.borderRadius || 'Border Radius'}</Label>
                <RadioGroup
                  value={currentCustomization.borderRadius || 'medium'}
                  onValueChange={(value: string) =>
                    onUpdate({
                      ...currentCustomization,
                      borderRadius: value as
                        | 'none'
                        | 'small'
                        | 'medium'
                        | 'large',
                    })
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="cursor-pointer">
                      {t.none || 'None'} (0px)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small-radius" />
                    <Label htmlFor="small-radius" className="cursor-pointer">
                      {t.small || 'Small'} (4px)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium-radius" />
                    <Label htmlFor="medium-radius" className="cursor-pointer">
                      {t.medium || 'Medium'} (8px)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large-radius" />
                    <Label htmlFor="large-radius" className="cursor-pointer">
                      {t.large || 'Large'} (16px)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>{t.headerStyle || 'Header Style'}</Label>
                <RadioGroup
                  value={currentCustomization.headerStyle || 'modern'}
                  onValueChange={(value: string) =>
                    onUpdate({
                      ...currentCustomization,
                      headerStyle: value as
                        | 'minimal'
                        | 'bold'
                        | 'creative'
                        | 'classic'
                        | 'modern',
                    })
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal-header" />
                    <Label htmlFor="minimal-header" className="cursor-pointer">
                      {t.minimal || 'Minimal'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modern" id="modern-header" />
                    <Label htmlFor="modern-header" className="cursor-pointer">
                      {t.modern || 'Modern'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bold" id="bold-header" />
                    <Label htmlFor="bold-header" className="cursor-pointer">
                      {t.bold || 'Bold'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creative" id="creative-header" />
                    <Label htmlFor="creative-header" className="cursor-pointer">
                      {t.creative || 'Creative'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="classic" id="classic-header" />
                    <Label htmlFor="classic-header" className="cursor-pointer">
                      {t.classic || 'Classic'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Hint */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-center">
            <Sparkles className="h-4 w-4 inline mr-1" />
            {t.themePreviewHint ||
              'Changes will be reflected in the preview panel immediately'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
