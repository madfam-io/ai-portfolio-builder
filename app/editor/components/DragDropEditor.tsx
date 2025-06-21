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

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Eye,
  Undo,
  Redo,
  Save,
  Settings,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Palette,
  Grid,
  Ruler,
  Move,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';
import { blockConfigs } from '@/lib/editor/block-configs';
import { EditorBlock } from './EditorBlock';
import { BlockLibrary } from './BlockLibrary';
import { PropertyPanel } from './PropertyPanel';
import { PreviewPane } from './PreviewPane';
// import { EditorToolbar } from './EditorToolbar';
import { DropZone } from './DropZone';
import type { BlockType } from '@/types/editor';

interface DragDropEditorProps {
  portfolioId?: string;
  initialBlocks?: Array<{
    id: string;
    type: BlockType;
    data: Record<string, unknown>;
    styles: Record<string, unknown>;
  }>;
}

export function DragDropEditor({
  portfolioId: _portfolioId,
  initialBlocks: _initialBlocks = [],
}: DragDropEditorProps) {
  const {
    blocks,
    selectedBlockId,
    viewport,
    isPreviewMode,
    isDragging: _isDragging,
    preferences,
    addBlock,
    reorderBlocks,
    selectBlock,
    setViewport,
    togglePreview,
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    startDragging,
    stopDragging,
  } = useEditorStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<
    'blocks' | 'layers' | 'properties'
  >('blocks');
  const [showGrid, setShowGrid] = useState(preferences.showGrid);
  const [showRulers, setShowRulers] = useState(preferences.showRulers);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id as string);

      // Check if dragging from block library or existing block
      if (
        typeof active.id === 'string' &&
        active.id.startsWith('block-type-')
      ) {
        // Dragging from block library
        startDragging(active.id);
      } else {
        // Dragging existing block
        startDragging(active.id as string);
        selectBlock(active.id as string);
      }
    },
    [startDragging, selectBlock]
  );

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Handle drag over logic for drop zones
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      stopDragging();

      if (!over) return;

      // Handle dropping from block library
      if (
        typeof active.id === 'string' &&
        active.id.startsWith('block-type-')
      ) {
        const blockType = active.id.replace('block-type-', '') as BlockType;
        const config = blockConfigs[blockType];

        if (config) {
          const dropIndex =
            typeof over.id === 'string' && over.id.startsWith('drop-zone-')
              ? parseInt(over.id.replace('drop-zone-', ''))
              : blocks.length;

          addBlock(
            {
              type: blockType,
              data: config.defaultData,
              styles: config.defaultStyles,
              responsive: {
                desktop: config.defaultStyles,
              },
            },
            dropIndex
          );
        }
        return;
      }

      // Handle reordering existing blocks
      const activeIndex = blocks.findIndex(block => block.id === active.id);
      const overIndex = blocks.findIndex(block => block.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        reorderBlocks(activeIndex, overIndex);
      }
    },
    [blocks, addBlock, reorderBlocks, stopDragging]
  );

  const handleSave = useCallback(async () => {
    try {
      await save();
      // Show success toast or notification
    } catch (_error) {
      // Show error toast or notification
    }
  }, [save]);

  const renderViewportButton = (
    size: 'desktop' | 'tablet' | 'mobile',
    icon: React.ReactNode
  ) => (
    <Button
      variant={viewport === size ? 'default' : 'outline'}
      size="sm"
      onClick={() => setViewport(size)}
      className="h-8 w-8 p-0"
    >
      {icon}
    </Button>
  );

  if (isPreviewMode) {
    return (
      <div className="h-screen">
        <PreviewPane
          blocks={blocks}
          viewport={viewport}
          onExitPreview={() => togglePreview()}
        />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-background flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Portfolio Editor</h2>
              <div className="flex gap-1">
                <Button
                  variant={canUndo() ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo()}
                  className="h-8 w-8 p-0"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant={canRedo() ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo()}
                  className="h-8 w-8 p-0"
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8 mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="h-8 px-3"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>

            <Tabs
              value={sidebarTab}
              onValueChange={value =>
                setSidebarTab(value as 'blocks' | 'layers' | 'properties')
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="blocks" className="text-xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Blocks
                </TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">
                  <Layers className="h-4 w-4 mr-1" />
                  Layers
                </TabsTrigger>
                <TabsTrigger value="properties" className="text-xs">
                  <Settings className="h-4 w-4 mr-1" />
                  Properties
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={sidebarTab} className="h-full">
              <TabsContent value="blocks" className="h-full p-0 m-0">
                <BlockLibrary />
              </TabsContent>

              <TabsContent value="layers" className="h-full p-0 m-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Layers</h3>
                      <Badge variant="secondary" className="text-xs">
                        {blocks.length}
                      </Badge>
                    </div>

                    <SortableContext
                      items={blocks.map(b => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {blocks.map((block, index) => (
                        <Card
                          key={block.id}
                          className={`p-3 cursor-pointer transition-colors ${
                            selectedBlockId === block.id
                              ? 'ring-2 ring-primary'
                              : ''
                          }`}
                          onClick={() => selectBlock(block.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Move className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {blockConfigs[block.type]?.name || block.type}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </SortableContext>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="properties" className="h-full p-0 m-0">
                <PropertyPanel blockId={selectedBlockId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Viewport Controls */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                  {renderViewportButton(
                    'desktop',
                    <Monitor className="h-4 w-4" />
                  )}
                  {renderViewportButton(
                    'tablet',
                    <Tablet className="h-4 w-4" />
                  )}
                  {renderViewportButton(
                    'mobile',
                    <Smartphone className="h-4 w-4" />
                  )}
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* View Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={showGrid ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowGrid(!showGrid)}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={showRulers ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowRulers(!showRulers)}
                    className="h-8 w-8 p-0"
                  >
                    <Ruler className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Canvas */}
          <div className="flex-1 relative overflow-auto bg-slate-50">
            <div
              className={`mx-auto transition-all duration-300 ${
                viewport === 'desktop'
                  ? 'max-w-none'
                  : viewport === 'tablet'
                    ? 'max-w-2xl'
                    : 'max-w-md'
              }`}
            >
              <div
                className={`bg-white shadow-sm min-h-full relative ${
                  showGrid ? 'bg-grid-pattern' : ''
                }`}
              >
                {showRulers && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-6 bg-muted border-b ruler-horizontal" />
                    <div className="absolute top-0 left-0 bottom-0 w-6 bg-muted border-r ruler-vertical" />
                  </>
                )}

                <div className={`${showRulers ? 'ml-6 mt-6' : ''}`}>
                  {/* Drop Zone at the beginning */}
                  <DropZone index={0} />

                  {/* Render blocks */}
                  <SortableContext
                    items={blocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.map((block, index) => (
                      <React.Fragment key={block.id}>
                        <EditorBlock
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onClick={() => selectBlock(block.id)}
                          viewport={viewport}
                        />
                        <DropZone index={index + 1} />
                      </React.Fragment>
                    ))}
                  </SortableContext>

                  {/* Empty state */}
                  {blocks.length === 0 && (
                    <div className="flex items-center justify-center min-h-96 text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                          <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Start Building Your Portfolio
                          </h3>
                          <p className="text-muted-foreground">
                            Drag blocks from the sidebar to start creating your
                            portfolio
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white border-2 border-primary rounded-lg p-4 shadow-lg opacity-90">
            <div className="text-sm font-medium">
              {activeId.startsWith('block-type-')
                ? blockConfigs[activeId.replace('block-type-', '') as BlockType]
                    ?.name
                : blocks.find(b => b.id === activeId)?.type}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
