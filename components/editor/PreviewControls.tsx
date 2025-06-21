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

import {
  Download,
  Eye,
  EyeOff,
  Grid,
  Maximize2,
  Minimize2,
  Monitor,
  RefreshCw,
  Settings,
  Share2,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';

import { PreviewMode, PreviewState } from '@/hooks/useRealTimePreview';

/**
 * @fileoverview Preview Controls Component
 *
 * Advanced preview controls for the portfolio editor including responsive testing,
 * zoom controls, section highlighting, and export functionality.
 */

interface PreviewControlsProps {
  previewMode: PreviewMode;
  previewState: PreviewState;
  zoomLevel: number;
  showSectionBorders: boolean;
  showInteractiveElements: boolean;
  isLoading?: boolean;

  // Control handlers
  onPreviewModeChange: (mode: PreviewMode) => void;
  onToggleFullscreen: () => void;
  onZoomChange: (zoom: number) => void;
  onToggleSectionBorders: () => void;
  onToggleInteractiveElements: () => void;
  onRefresh: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onOpenSettings?: () => void;

  // Responsive testing
  responsiveBreakpoints?: Array<{
    name: string;
    width: number;
    height: number;
  }>;
  onTestBreakpoint?: (width: number, height: number) => void;
}

interface ResponsiveTestingProps {
  breakpoints: Array<{ name: string; width: number; height: number }>;
  onTestBreakpoint: (width: number, height: number) => void;
  onClose: () => void;
}

function ResponsiveTestingPanel({
  breakpoints,
  onTestBreakpoint,
  onClose,
}: ResponsiveTestingProps) {
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  const handleCustomTest = (): void => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (width > 0 && height > 0) {
      onTestBreakpoint(width, height);
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Responsive Testing
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      {/* Preset breakpoints */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Common Breakpoints
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {breakpoints.map((bp, index) => (
            <button
              key={index}
              onClick={() => {
                onTestBreakpoint(bp.width, bp.height);
                onClose();
              }}
              className="text-left p-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {bp.name}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {bp.width} × {bp.height}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom dimensions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom Dimensions
        </h4>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Width"
            value={customWidth}
            onChange={e => setCustomWidth(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
          <span className="self-center text-gray-500">×</span>
          <input
            type="number"
            placeholder="Height"
            value={customHeight}
            onChange={e => setCustomHeight(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={handleCustomTest}
          disabled={!customWidth || !customHeight}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Test Custom Size
        </button>
      </div>
    </div>
  );
}

export function PreviewControls({
  previewMode,
  previewState,
  zoomLevel,
  showSectionBorders,
  showInteractiveElements,
  isLoading = false,
  onPreviewModeChange,
  onToggleFullscreen,
  onZoomChange,
  onToggleSectionBorders,
  onToggleInteractiveElements,
  onRefresh,
  onExport,
  onShare,
  onOpenSettings,
  responsiveBreakpoints = [],
  onTestBreakpoint,
}: PreviewControlsProps) {
  const [showResponsiveTesting, setShowResponsiveTesting] = useState(false);

  const zoomPercentage = Math.round(zoomLevel * 100);

  const handleZoomIn = (): void => {
    onZoomChange(Math.min(zoomLevel + 0.1, 2));
  };

  const handleZoomOut = (): void => {
    onZoomChange(Math.max(zoomLevel - 0.1, 0.25));
  };

  const handleZoomReset = (): void => {
    onZoomChange(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Preview modes */}
        <div className="flex items-center space-x-1">
          {/* Device preview modes */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onPreviewModeChange('desktop')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                previewMode === 'desktop'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Desktop Preview"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => onPreviewModeChange('tablet')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                previewMode === 'tablet'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Tablet Preview"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => onPreviewModeChange('mobile')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                previewMode === 'mobile'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Mobile Preview"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Responsive testing */}
          {responsiveBreakpoints.length > 0 && onTestBreakpoint && (
            <div className="relative">
              <button
                onClick={() => setShowResponsiveTesting(!showResponsiveTesting)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Responsive Testing"
              >
                <Grid className="w-4 h-4" />
              </button>

              {showResponsiveTesting && (
                <ResponsiveTestingPanel
                  breakpoints={responsiveBreakpoints}
                  onTestBreakpoint={onTestBreakpoint}
                  onClose={() => setShowResponsiveTesting(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Center - Zoom controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.25}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors min-w-[50px]"
            title="Reset Zoom"
          >
            {zoomPercentage}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right side - View controls and actions */}
        <div className="flex items-center space-x-2">
          {/* View toggles */}
          <button
            onClick={onToggleSectionBorders}
            className={`p-2 rounded-md transition-colors ${
              showSectionBorders
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Toggle Section Borders"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleInteractiveElements}
            className={`p-2 rounded-md transition-colors ${
              showInteractiveElements
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Toggle Interactive Elements"
          >
            {showInteractiveElements ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

          {/* Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={
              previewState === 'fullscreen'
                ? 'Exit Fullscreen'
                : 'Enter Fullscreen'
            }
          >
            {previewState === 'fullscreen' ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Export Preview"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Share */}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Share Preview"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Preview Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
