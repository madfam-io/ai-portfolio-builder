'use client';

import {
  Eye as FiEye,
  Layout,
  Layout as FiLayout,
  Moon,
  Move,
  Settings,
  Settings as FiSettings,
  Sparkles,
  Sun,
  Type,
  Type as FiType,
} from 'lucide-react';
import React, { useState } from 'react';
interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface Font {
  name: string;
  family: string;
  preview: string;
  category: 'modern' | 'classic' | 'creative';
}

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  density: 'compact' | 'normal' | 'relaxed';
  headerStyle: 'minimal' | 'bold' | 'creative';
}

interface VisualCustomizationToolsProps {
  onColorChange?: (colors: ColorScheme) => void;
  onFontChange?: (font: Font) => void;
  onLayoutChange?: (layout: LayoutOption) => void;
  onThemeToggle?: (isDark: boolean) => void;
  currentTemplate?: string;
  className?: string;
}

export function VisualCustomizationTools({
  onColorChange,
  onFontChange,
  onLayoutChange,
  onThemeToggle,
  className = '',
}: VisualCustomizationToolsProps) {
  const [activeTab, setActiveTab] = useState<
    'colors' | 'fonts' | 'layout' | 'theme'
  >('colors');
  const [selectedColors, setSelectedColors] = useState<ColorScheme | null>(
    null
  );
  const [selectedFont, setSelectedFont] = useState<Font | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutOption | null>(
    null
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const colorSchemes: ColorScheme[] = [
    {
      name: 'Ocean Blue',
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#06B6D4',
      background: '#F8FAFC',
      text: '#1E293B',
    },
    {
      name: 'Forest Green',
      primary: '#059669',
      secondary: '#047857',
      accent: '#0891B2',
      background: '#F9FAFB',
      text: '#111827',
    },
    {
      name: 'Sunset Orange',
      primary: '#EA580C',
      secondary: '#C2410C',
      accent: '#F59E0B',
      background: '#FFFBEB',
      text: '#1C1917',
    },
    {
      name: 'Royal Purple',
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#EC4899',
      background: '#FDFCFC',
      text: '#1E1B4B',
    },
    {
      name: 'Professional Gray',
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#DC2626',
      background: '#FFFFFF',
      text: '#111827',
    },
    {
      name: 'Creative Pink',
      primary: '#EC4899',
      secondary: '#BE185D',
      accent: '#F59E0B',
      background: '#FEFBFB',
      text: '#1F2937',
    },
  ];

  const fonts: Font[] = [
    {
      name: 'Inter',
      family: 'Inter, sans-serif',
      preview: 'Modern & Clean',
      category: 'modern',
    },
    {
      name: 'Poppins',
      family: 'Poppins, sans-serif',
      preview: 'Friendly & Approachable',
      category: 'modern',
    },
    {
      name: 'Playfair Display',
      family: 'Playfair Display, serif',
      preview: 'Elegant & Sophisticated',
      category: 'classic',
    },
    {
      name: 'Source Sans Pro',
      family: 'Source Sans Pro, sans-serif',
      preview: 'Professional & Readable',
      category: 'classic',
    },
    {
      name: 'Space Grotesk',
      family: 'Space Grotesk, sans-serif',
      preview: 'Bold & Distinctive',
      category: 'creative',
    },
    {
      name: 'JetBrains Mono',
      family: 'JetBrains Mono, monospace',
      preview: 'Technical & Modern',
      category: 'creative',
    },
  ];

  const layoutOptions: LayoutOption[] = [
    {
      id: 'compact',
      name: 'Compact',
      description: 'Tight spacing, maximum content density',
      density: 'compact',
      headerStyle: 'minimal',
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Optimal spacing for readability',
      density: 'normal',
      headerStyle: 'bold',
    },
    {
      id: 'spacious',
      name: 'Spacious',
      description: 'Generous spacing, premium feel',
      density: 'relaxed',
      headerStyle: 'creative',
    },
  ];

  const tabs = [
    { id: 'colors', label: 'Colors', icon: FiSettings },
    { id: 'fonts', label: 'Typography', icon: FiType },
    { id: 'layout', label: 'Layout', icon: FiLayout },
    { id: 'theme', label: 'Theme', icon: FiEye },
  ];

  const handleColorSelect = async (colorScheme: ColorScheme) => {
    setIsCustomizing(true);
    setSelectedColors(colorScheme);

    // Simulate customization process
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsCustomizing(false);
    if (onColorChange) {
      onColorChange(colorScheme);
    }
  };

  const handleFontSelect = async (font: Font) => {
    setIsCustomizing(true);
    setSelectedFont(font);

    await new Promise(resolve => setTimeout(resolve, 800));

    setIsCustomizing(false);
    if (onFontChange) {
      onFontChange(font);
    }
  };

  const handleLayoutSelect = async (layout: LayoutOption) => {
    setIsCustomizing(true);
    setSelectedLayout(layout);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setIsCustomizing(false);
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  };

  const handleThemeToggle = (): void => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (onThemeToggle) {
      onThemeToggle(newTheme);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">Visual Customization</h3>
            <p className="text-purple-100">
              Personalize your portfolio's appearance
            </p>
          </div>
        </div>
      </div>

      {/* Customization in Progress */}
      {isCustomizing && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">
              Applying changes...
            </span>
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Choose Your Color Palette
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select colors that reflect your professional brand
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {colorSchemes.map(scheme => (
                <div
                  key={scheme.name}
                  className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                    selectedColors?.name === scheme.name
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleColorSelect(scheme)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: scheme.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: scheme.accent }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {scheme.name}
                    </span>
                  </div>

                  {/* Mini Preview */}
                  <div
                    className="h-16 rounded"
                    style={{ backgroundColor: scheme.background }}
                  >
                    <div className="p-2">
                      <div
                        className="h-2 rounded mb-1"
                        style={{
                          backgroundColor: scheme.primary,
                          width: '60%',
                        }}
                      />
                      <div
                        className="h-1 rounded mb-1"
                        style={{
                          backgroundColor: scheme.text,
                          opacity: 0.6,
                          width: '80%',
                        }}
                      />
                      <div
                        className="h-1 rounded"
                        style={{ backgroundColor: scheme.accent, width: '40%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select Typography
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose fonts that match your professional style
              </p>
            </div>

            <div className="space-y-3">
              {fonts.map(font => (
                <div
                  key={font.name}
                  className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                    selectedFont?.name === font.name
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleFontSelect(font)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5
                        className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {font.preview}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        font.category === 'modern'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : font.category === 'classic'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}
                    >
                      {font.category}
                    </span>
                  </div>

                  {/* Font Preview */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p
                      className="text-gray-700 dark:text-gray-300"
                      style={{ fontFamily: font.family }}
                    >
                      The quick brown fox jumps over the lazy dog. 1234567890
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Layout Configuration
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Adjust spacing and visual density
              </p>
            </div>

            <div className="space-y-4">
              {layoutOptions.map(layout => (
                <div
                  key={layout.id}
                  className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                    selectedLayout?.id === layout.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleLayoutSelect(layout)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {layout.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {layout.description}
                      </p>
                    </div>
                    <Move className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Layout Preview */}
                  <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded p-3">
                    <div
                      className={`space-y-${layout.density === 'compact' ? '1' : layout.density === 'normal' ? '2' : '3'}`}
                    >
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Theme Settings
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Switch between light and dark modes
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-20 w-40 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-16 w-16 transform rounded-full bg-white shadow-lg transition-transform ${
                    isDarkMode ? 'translate-x-20' : 'translate-x-2'
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="w-8 h-8 text-gray-800 m-4" />
                  ) : (
                    <Sun className="w-8 h-8 text-yellow-500 m-4" />
                  )}
                </span>
                <div className="absolute left-4 text-gray-600">
                  <Sun className="w-6 h-6" />
                </div>
                <div className="absolute right-4 text-gray-400">
                  <Moon className="w-6 h-6" />
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Currently using{' '}
                <span className="font-semibold">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>{' '}
                mode
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Applied Changes Summary */}
      {(selectedColors || selectedFont || selectedLayout) && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
            Applied Changes:
          </h5>
          <div className="space-y-2 text-sm">
            {selectedColors && (
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Color scheme: {selectedColors.name}
                </span>
              </div>
            )}
            {selectedFont && (
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Typography: {selectedFont.name}
                </span>
              </div>
            )}
            {selectedLayout && (
              <div className="flex items-center space-x-2">
                <Layout className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Layout: {selectedLayout.name}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
