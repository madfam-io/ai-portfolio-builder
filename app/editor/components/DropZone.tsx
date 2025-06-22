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

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface DropZoneProps {
  index: number;
  className?: string;
}

export function DropZone({ index, className = '' }: DropZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: `drop-zone-${index}`,
    data: { type: 'drop-zone', index },
  });

  const isDraggingBlock =
    active &&
    (active.id.toString().startsWith('block-type-') ||
      !active.id.toString().startsWith('drop-zone-'));

  if (!isDraggingBlock) {
    return <div ref={setNodeRef} className="h-0" />;
  }

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver
          ? 'h-20 bg-primary/10 border-2 border-dashed border-primary'
          : 'h-8 bg-transparent border-2 border-dashed border-transparent hover:border-muted-foreground/30'
      } ${className}`}
    >
      <div className="h-full flex items-center justify-center">
        {isOver ? (
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <Plus className="h-4 w-4" />
            Drop block here
          </div>
        ) : (
          <div className="w-full h-0.5 bg-muted-foreground/20 opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}
