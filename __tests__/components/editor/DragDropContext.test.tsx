/**
 * Tests for DragDropContext component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragDropContext } from '@/components/editor/DragDropContext';
import { DraggableItem } from '@/components/editor/DraggableItem';

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => (
    <div
      data-testid="drag-drop-context"
      onClick={() =>
        onDragEnd({
          destination: { index: 1 },
          source: { index: 0 },
          draggableId: 'item-1',
        })
      }
    >
      {children}
    </div>
  ),
  Droppable: ({ children, droppableId }: any) => (
    <div data-testid={`droppable-${droppableId}`}>
      {children({
        draggableProps: {},
        dragHandleProps: {},
        innerRef: jest.fn(),
        placeholder: null,
      })}
    </div>
  ),
  Draggable: ({ children, draggableId, index }: any) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children(
        {
          draggableProps: {},
          dragHandleProps: {},
          innerRef: jest.fn(),
        },
        {}
      )}
    </div>
  ),
}));

describe('DragDropContext', () => {
  const mockItems = [
    { id: '1', content: 'Item 1', order: 0 },
    { id: '2', content: 'Item 2', order: 1 },
    { id: '3', content: 'Item 3', order: 2 },
  ];

  const mockOnReorder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render drag drop context', () => {
      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
    });

    it('should render all items', () => {
      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render with custom droppable ID', () => {
      render(
        <DragDropContext
          items={mockItems}
          onReorder={mockOnReorder}
          droppableId="custom-list"
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      expect(screen.getByTestId('droppable-custom-list')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should call onReorder when item is dragged', async () => {
      const user = userEvent.setup();

      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      // Simulate drag by clicking (mocked behavior)
      await user.click(screen.getByTestId('drag-drop-context'));

      expect(mockOnReorder).toHaveBeenCalledWith([
        { id: '2', content: 'Item 2', order: 0 },
        { id: '1', content: 'Item 1', order: 1 },
        { id: '3', content: 'Item 3', order: 2 },
      ]);
    });

    it('should maintain item order when dropped in same position', () => {
      const onDragEnd = jest.fn();

      render(
        <DragDropContext items={mockItems} onReorder={onDragEnd}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      // Mock same position drop
      const mockDragDropContext = screen.getByTestId('drag-drop-context');
      mockDragDropContext.onclick = () =>
        onDragEnd({
          destination: { index: 0 },
          source: { index: 0 },
          draggableId: 'item-1',
        });

      mockDragDropContext.click();

      // Should not call onReorder if position hasn't changed
      expect(onDragEnd).not.toHaveBeenCalled();
    });
  });

  describe('Custom Rendering', () => {
    it('should render custom item components', () => {
      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {item => (
            <div key={item.id} className="custom-item">
              <span>{item.content}</span>
              <button>Edit</button>
            </div>
          )}
        </DragDropContext>
      );

      const customItems = screen.getAllByRole('button', { name: 'Edit' });
      expect(customItems).toHaveLength(3);
    });

    it('should pass item data to render function', () => {
      const renderItem = jest.fn(item => (
        <div key={item.id}>{item.content}</div>
      ));

      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {renderItem}
        </DragDropContext>
      );

      expect(renderItem).toHaveBeenCalledTimes(3);
      expect(renderItem).toHaveBeenCalledWith(mockItems[0], 0);
      expect(renderItem).toHaveBeenCalledWith(mockItems[1], 1);
      expect(renderItem).toHaveBeenCalledWith(mockItems[2], 2);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no items', () => {
      render(
        <DragDropContext
          items={[]}
          onReorder={mockOnReorder}
          emptyState={<div>No items to display</div>}
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      expect(screen.getByText('No items to display')).toBeInTheDocument();
    });

    it('should render default empty state', () => {
      render(
        <DragDropContext items={[]} onReorder={mockOnReorder}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable drag and drop when disabled prop is true', () => {
      render(
        <DragDropContext
          items={mockItems}
          onReorder={mockOnReorder}
          disabled={true}
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      const context = screen.getByTestId('drag-drop-context');
      expect(context).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      const droppable = screen.getByTestId('droppable-items');
      expect(droppable).toHaveAttribute('role', 'list');
    });

    it('should announce drag operations to screen readers', () => {
      render(
        <DragDropContext
          items={mockItems}
          onReorder={mockOnReorder}
          announceItem={item => `${item.content} grabbed`}
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropContext>
      );

      // Check for screen reader announcements
      const announcement = screen.queryByRole('status');
      expect(announcement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderItem = jest.fn(item => (
        <div key={item.id}>{item.content}</div>
      ));

      const { rerender } = render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {renderItem}
        </DragDropContext>
      );

      const initialCallCount = renderItem.mock.calls.length;

      // Re-render with same props
      rerender(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {renderItem}
        </DragDropContext>
      );

      // Should not call render function again with same items
      expect(renderItem.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Integration with DraggableItem', () => {
    it('should work with DraggableItem component', () => {
      render(
        <DragDropContext items={mockItems} onReorder={mockOnReorder}>
          {(item, index) => (
            <DraggableItem key={item.id} id={item.id} index={index}>
              <div>{item.content}</div>
            </DraggableItem>
          )}
        </DragDropContext>
      );

      // Check that draggable items are rendered
      expect(screen.getByTestId('draggable-1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-2')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-3')).toBeInTheDocument();
    });
  });
});
