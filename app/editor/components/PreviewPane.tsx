/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share,
} from 'lucide-react';
import { BlockRenderer } from './BlockRenderer';
import type { EditorBlock } from '@/types/editor';

interface PreviewPaneProps {
  blocks: EditorBlock[];
  viewport: 'desktop' | 'tablet' | 'mobile';
  onExitPreview: () => void;
  onViewportChange?: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
}

export function PreviewPane({
  blocks,
  viewport,
  onExitPreview,
  onViewportChange,
}: PreviewPaneProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onExitPreview();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, onExitPreview]);

  const getViewportDimensions = () => {
    switch (viewport) {
      case 'desktop':
        return { width: '100%', height: '100%', maxWidth: 'none' };
      case 'tablet':
        return {
          width: isRotated ? '1024px' : '768px',
          height: isRotated ? '768px' : '1024px',
          maxWidth: isRotated ? '1024px' : '768px',
        };
      case 'mobile':
        return {
          width: isRotated ? '667px' : '375px',
          height: isRotated ? '375px' : '667px',
          maxWidth: isRotated ? '667px' : '375px',
        };
      default:
        return { width: '100%', height: '100%', maxWidth: 'none' };
    }
  };

  const dimensions = getViewportDimensions();

  const renderViewportButton = (
    size: 'desktop' | 'tablet' | 'mobile',
    icon: React.ReactNode,
    label: string
  ) => (
    <Button
      variant={viewport === size ? 'default' : 'outline'}
      size="sm"
      onClick={() => onViewportChange?.(size)}
      className="h-8 gap-2"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  const renderPreviewHeader = () => (
    <div className="bg-background border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Preview Mode</h1>
          <Badge variant="secondary" className="text-xs">
            {blocks.length} blocks
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex items-center gap-1">
            {renderViewportButton(
              'desktop',
              <Monitor className="h-4 w-4" />,
              'Desktop'
            )}
            {renderViewportButton(
              'tablet',
              <Tablet className="h-4 w-4" />,
              'Tablet'
            )}
            {renderViewportButton(
              'mobile',
              <Smartphone className="h-4 w-4" />,
              'Mobile'
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Mobile/Tablet Rotation */}
          {viewport !== 'desktop' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRotated(!isRotated)}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {/* Share */}
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Share className="h-4 w-4" />
          </Button>

          {/* Open in New Tab */}
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Exit Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExitPreview}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDeviceFrame = () => {
    if (viewport === 'desktop') {
      return (
        <div className="flex-1 bg-slate-100 overflow-auto">
          <div className="w-full h-full bg-white">
            {blocks.map(block => (
              <BlockRenderer
                key={block.id}
                block={block}
                viewport={viewport}
                isEditing={false}
              />
            ))}
          </div>
        </div>
      );
    }

    // At this point, viewport is either 'tablet' or 'mobile'
    const deviceViewport = viewport as 'tablet' | 'mobile';

    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8">
        {/* Device Frame */}
        <div
          className={`relative bg-gray-800 rounded-2xl shadow-2xl ${
            deviceViewport === 'tablet' ? 'p-8' : 'p-4'
          }`}
          style={{
            width:
              parseInt(dimensions.width as string) +
              (deviceViewport === 'tablet' ? 64 : 32),
            height:
              parseInt(dimensions.height as string) +
              (deviceViewport === 'tablet' ? 64 : 32),
          }}
        >
          {/* Device Screen */}
          <div
            className="bg-white rounded-lg overflow-auto shadow-inner"
            style={dimensions}
          >
            {/* Status Bar (Mobile only) */}
            {deviceViewport === 'mobile' && !isRotated && (
              <div className="h-6 bg-black flex items-center justify-between px-4 text-white text-xs">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 border border-white rounded-sm">
                    <div className="w-3 h-1 bg-white rounded-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Content */}
            <div className="h-full overflow-auto">
              {blocks.map(block => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  viewport={viewport}
                  isEditing={false}
                />
              ))}
            </div>
          </div>

          {/* Home Indicator (iPhone) */}
          {deviceViewport === 'mobile' && !isRotated && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-50" />
          )}
        </div>

        {/* Device Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm font-medium">
            {deviceViewport === 'tablet'
              ? `Tablet ${isRotated ? 'Landscape' : 'Portrait'}`
              : `Mobile ${isRotated ? 'Landscape' : 'Portrait'}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {dimensions.width} × {dimensions.height}
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex-1 bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <Monitor className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Content to Preview</h3>
        <p className="text-muted-foreground mb-4">
          Add some blocks to see your portfolio preview
        </p>
        <Button onClick={onExitPreview} variant="outline">
          Back to Editor
        </Button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Fullscreen Header */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExitPreview}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Content */}
        <div className="w-full h-full bg-white overflow-auto">
          {blocks.map(block => (
            <BlockRenderer
              key={block.id}
              block={block}
              viewport="desktop"
              isEditing={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {renderPreviewHeader()}
      {blocks.length === 0 ? renderEmptyState() : renderDeviceFrame()}
    </div>
  );
}
