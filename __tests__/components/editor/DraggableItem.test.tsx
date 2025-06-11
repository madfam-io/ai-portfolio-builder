/**
 * Tests for DraggableItem Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DraggableItem } from '@/components/editor/DraggableItem';
import { DragItem } from '@/components/editor/DragDropContext';

// Mock the logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('DraggableItem', () => {
  const mockDragItem: DragItem = {
    id: 'test-item-1',
    type: 'project',
    index: 0,
    data: {
      title: 'Test Project',
    },
  };

  const mockOnReorder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should show drag handle by default', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });

    it('should hide drag handle when showHandle is false', () => {
      render(
        <DraggableItem 
          item={mockDragItem} 
          onReorder={mockOnReorder}
          showHandle={false}
        >
          <div>Test Content</div>
        </DraggableItem>
      );

      expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <DraggableItem 
          item={mockDragItem} 
          onReorder={mockOnReorder}
          className="custom-class"
        >
          <div>Test Content</div>
        </DraggableItem>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply disabled styles when disabled', () => {
      const { container } = render(
        <DraggableItem 
          item={mockDragItem} 
          onReorder={mockOnReorder}
          disabled={true}
        >
          <div>Test Content</div>
        </DraggableItem>
      );

      expect(container.firstChild).toHaveClass('opacity-50');
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should make element draggable', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      expect(draggableElement).toHaveAttribute('draggable', 'true');
    });

    it('should handle drag start event', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      const mockDataTransfer = {
        effectAllowed: '',
        setData: jest.fn(),
        setDragImage: jest.fn(),
      };

      fireEvent.dragStart(draggableElement, {
        dataTransfer: mockDataTransfer,
      });

      expect(mockDataTransfer.effectAllowed).toBe('move');
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(mockDragItem)
      );
    });

    it('should handle drag over event', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      const mockPreventDefault = jest.fn();
      const mockDataTransfer = { dropEffect: '' };

      fireEvent.dragOver(draggableElement, {
        preventDefault: mockPreventDefault,
        dataTransfer: mockDataTransfer,
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockDataTransfer.dropEffect).toBe('move');
    });

    it('should handle drop event and call onReorder', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      const mockPreventDefault = jest.fn();
      const mockDataTransfer = {
        getData: jest.fn().mockReturnValue(JSON.stringify({
          id: 'other-item',
          type: 'project',
          index: 1,
        })),
      };

      // Mock getBoundingClientRect for drop position calculation
      draggableElement.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 0,
        height: 100,
      });

      fireEvent.drop(draggableElement, {
        preventDefault: mockPreventDefault,
        clientY: 50,
        currentTarget: draggableElement,
        dataTransfer: mockDataTransfer,
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockOnReorder).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      expect(draggableElement).toHaveAttribute('tabIndex', '0');
    });

    it('should not be focusable when disabled', () => {
      render(
        <DraggableItem 
          item={mockDragItem} 
          onReorder={mockOnReorder}
          disabled={true}
        >
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      expect(draggableElement).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed drag data gracefully', () => {
      render(
        <DraggableItem item={mockDragItem} onReorder={mockOnReorder}>
          <div>Test Content</div>
        </DraggableItem>
      );

      const draggableElement = screen.getByRole('generic');
      const mockDataTransfer = {
        getData: jest.fn().mockReturnValue('invalid-json'),
      };

      fireEvent.drop(draggableElement, {
        preventDefault: jest.fn(),
        dataTransfer: mockDataTransfer,
      });

      // Should not throw error and should not call onReorder
      expect(mockOnReorder).not.toHaveBeenCalled();
    });
  });
});