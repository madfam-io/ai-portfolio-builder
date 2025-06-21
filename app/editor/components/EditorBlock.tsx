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

import React, { useCallback, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Move,
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEditorStore } from '@/lib/store/editor-store';
import { blockConfigs } from '@/lib/editor/block-configs';
import { BlockRenderer } from './BlockRenderer';
import type { EditorBlock as EditorBlockType } from '@/types/editor';

interface EditorBlockProps {
  block: EditorBlockType;
  isSelected: boolean;
  onClick: () => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

export function EditorBlock({
  block,
  isSelected,
  onClick,
  viewport,
}: EditorBlockProps) {
  const {
    updateBlock: _updateBlock,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
    getBlockIndex,
    blocks,
    showContextMenu,
  } = useEditorStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { type: 'block', block },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockConfig = blockConfigs[block.type];
  const blockIndex = getBlockIndex(block.id);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < blocks.length - 1;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu({ x: e.clientX, y: e.clientY }, block.id);
    },
    [block.id, showContextMenu]
  );

  const handleMoveUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canMoveUp) {
        reorderBlocks(blockIndex, blockIndex - 1);
      }
    },
    [blockIndex, canMoveUp, reorderBlocks]
  );

  const handleMoveDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canMoveDown) {
        reorderBlocks(blockIndex, blockIndex + 1);
      }
    },
    [blockIndex, canMoveDown, reorderBlocks]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateBlock(block.id);
    },
    [block.id, duplicateBlock]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteBlock(block.id);
    },
    [block.id, deleteBlock]
  );

  const handleToggleVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsVisible(!isVisible);
      // In a real implementation, you might update block visibility in the store
    },
    [isVisible]
  );

  const _getResponsiveStyles = () => {
    const styles = block.responsive[viewport] || block.responsive.desktop;
    return styles;
  };

  const renderBlockControls = () => {
    if (!isSelected && !isHovered) return null;

    return (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border p-1 z-10">
        {/* Visibility Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleToggleVisibility}
        >
          {isVisible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
        </Button>

        {/* Move Up */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleMoveUp}
          disabled={!canMoveUp}
        >
          <ArrowUp className="h-3 w-3" />
        </Button>

        {/* Move Down */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleMoveDown}
          disabled={!canMoveDown}
        >
          <ArrowDown className="h-3 w-3" />
        </Button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onClick()}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Block
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderDragHandle = () => {
    if (!isSelected && !isHovered) return null;

    return (
      <div
        className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md shadow-lg border p-1 cursor-grab active:cursor-grabbing z-10"
        {...listeners}
        {...attributes}
      >
        <Move className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  };

  const renderBlockLabel = () => {
    if (!isSelected && !isHovered) return null;

    return (
      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-lg z-10">
        {blockConfig?.name || block.type}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      {/* Selection Outline */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 rounded-lg pointer-events-none z-20" />
      )}

      {/* Hover Outline */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 ring-1 ring-primary/50 ring-offset-1 rounded-lg pointer-events-none z-10" />
      )}

      {/* Block Content */}
      <div
        className={`relative ${isVisible ? '' : 'opacity-50'}`}
        onClick={onClick}
      >
        <BlockRenderer block={block} viewport={viewport} isEditing={true} />
      </div>

      {/* Block Controls */}
      {renderDragHandle()}
      {renderBlockControls()}
      {renderBlockLabel()}

      {/* Grid Overlay (when dragging) */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none z-30" />
      )}
    </div>
  );
}
