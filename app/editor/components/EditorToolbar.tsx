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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Undo,
  Redo,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Grid,
  Ruler,
  Palette,
  Download,
  Share,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';

interface EditorToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  onExport?: () => void;
}

export function EditorToolbar({
  onSave,
  onPreview,
  onExport,
}: EditorToolbarProps) {
  const {
    blocks,
    viewport,
    isPreviewMode: _isPreviewMode,
    canUndo,
    canRedo,
    undo,
    redo,
    setViewport,
    togglePreview,
    preferences,
    updatePreferences,
  } = useEditorStore();

  const handleSave = () => {
    onSave?.();
  };

  const handlePreview = () => {
    onPreview?.();
    togglePreview();
  };

  const handleExport = () => {
    onExport?.();
  };

  const renderViewportButton = (
    size: 'desktop' | 'tablet' | 'mobile',
    icon: React.ReactNode,
    label: string
  ) => (
    <Button
      variant={viewport === size ? 'default' : 'outline'}
      size="sm"
      onClick={() => setViewport(size)}
      className="h-8 w-8 p-0"
      title={label}
    >
      {icon}
    </Button>
  );

  return (
    <div className="flex items-center justify-between p-3 border-b bg-background">
      {/* Left Section - History & Save */}
      <div className="flex items-center gap-2">
        <Button
          variant={canUndo() ? 'outline' : 'ghost'}
          size="sm"
          onClick={undo}
          disabled={!canUndo()}
          className="h-8 w-8 p-0"
          title="Undo (Cmd+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant={canRedo() ? 'outline' : 'ghost'}
          size="sm"
          onClick={redo}
          disabled={!canRedo()}
          className="h-8 w-8 p-0"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="h-8 px-3"
          title="Save (Cmd+S)"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>

        <Badge variant="secondary" className="text-xs ml-2">
          {blocks.length} blocks
        </Badge>
      </div>

      {/* Center Section - Viewport Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
          {renderViewportButton(
            'desktop',
            <Monitor className="h-4 w-4" />,
            'Desktop View'
          )}
          {renderViewportButton(
            'tablet',
            <Tablet className="h-4 w-4" />,
            'Tablet View'
          )}
          {renderViewportButton(
            'mobile',
            <Smartphone className="h-4 w-4" />,
            'Mobile View'
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Options */}
        <div className="flex items-center gap-1">
          <Button
            variant={preferences.showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              updatePreferences({ showGrid: !preferences.showGrid })
            }
            className="h-8 w-8 p-0"
            title="Toggle Grid"
          >
            <Grid className="h-4 w-4" />
          </Button>

          <Button
            variant={preferences.showRulers ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              updatePreferences({ showRulers: !preferences.showRulers })
            }
            className="h-8 w-8 p-0"
            title="Toggle Rulers"
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="h-8 px-3"
          title="Preview Mode"
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Theme Settings"
        >
          <Palette className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-8 w-8 p-0"
          title="Export Portfolio"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Share Portfolio"
        >
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
