/**
 * Draggable Item Component
 * Wrapper component that makes any content draggable
 */

import React, { useState } from 'react';
import { cn } from '@/components/ui/utils';
import { GripVertical } from 'lucide-react';
import {
  DragItem,
  handleDragStart,
  handleDragOver,
  handleDrop,
} from './DragDropContext';

interface DraggableItemProps {
  item: DragItem;
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
  disabled?: boolean;
}

export function DraggableItem({
  item,
  onReorder,
  children,
  className,
  showHandle = true,
  disabled = false,
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStartWrapper = (e: React.DragEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleDragStart(e, item);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set isDragOver to false if we're leaving the element entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleDrop(e, item.index.toString(), onReorder);
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStartWrapper}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDropWrapper}
      className={cn(
        'group relative transition-all duration-200',
        isDragging && 'opacity-50',
        isDragOver && 'ring-2 ring-blue-500 ring-offset-2',
        disabled && 'cursor-default',
        !disabled && 'cursor-move',
        className
      )}
    >
      {showHandle && !disabled && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity p-1">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      )}

      {/* Drop indicator */}
      {isDragOver && (
        <div className="absolute inset-x-0 -top-1 h-0.5 bg-blue-500 animate-pulse" />
      )}

      {children}
    </div>
  );
}
