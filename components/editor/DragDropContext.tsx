/**
 * Drag and Drop Context for Portfolio Editor
 * Provides drag-and-drop functionality for reordering sections and content
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DragItem {
  id: string;
  type: 'section' | 'project' | 'experience' | 'education' | 'skill';
  index: number;
  data?: any;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  setDraggedItem: (item: DragItem | null) => void;
  dropTarget: { id: string; position: 'before' | 'after' } | null;
  setDropTarget: (
    target: { id: string; position: 'before' | 'after' } | null
  ) => void;
  isDragging: boolean;
}

const DragDropContext = createContext<DragDropContextType | undefined>(
  undefined
);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: 'before' | 'after';
  } | null>(null);

  const isDragging = draggedItem !== null;

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        dropTarget,
        setDropTarget,
        isDragging,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

// Utility functions for drag and drop
export function handleDragStart(e: React.DragEvent, item: DragItem) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/json', JSON.stringify(item));

  // Add custom drag image if needed
  const dragImage = document.createElement('div');
  dragImage.className = 'drag-preview';
  dragImage.textContent = item.data?.title || 'Moving...';
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 0, 0);

  setTimeout(() => document.body.removeChild(dragImage), 0);
}

export function handleDragOver(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

export function handleDrop(
  e: React.DragEvent,
  targetId: string,
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  e.preventDefault();

  try {
    const item = JSON.parse(
      e.dataTransfer.getData('application/json')
    ) as DragItem;
    const dropRect = e.currentTarget.getBoundingClientRect();
    const dropY = e.clientY - dropRect.top;
    const dropPosition = dropY < dropRect.height / 2 ? 'before' : 'after';

    // Calculate new index based on drop position
    let newIndex = parseInt(targetId);
    if (dropPosition === 'after') {
      newIndex += 1;
    }

    // Adjust index if dropping after original position
    if (item.index < newIndex) {
      newIndex -= 1;
    }

    if (item.index !== newIndex) {
      onReorder(item.index, newIndex);
    }
  } catch (error) {
    console.error('Drop error:', error);
  }
}
