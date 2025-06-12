import { createMockPortfolio, createMockUser } from '../utils/test-helpers';
/**
 * Tests for DragDropProvider component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import DragDropProvider from '@/components/editor/DragDropContext';
import { DraggableItem } from '@/components/editor/DraggableItem';

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropProvider: ({ children, onDragEnd }: any) => (
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
  Draggable: ({ children, draggableId }: any) => (
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

describe('DragDropProvider', () => {
  const mockItems = [
    { id: '1', content: 'Item 1', order: 0 },
    { id: '2', content: 'Item 2', order: 1 },
    { id: '3', content: 'Item 3', order: 2 },
  ];

  const mockOnReorder = jest.fn() as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render drag drop context', async () => {
      render(
        <DragDropProvider>
          {mockItems.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </DragDropProvider>
      );

      expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
    });

    it('should render all items', async () => {
      render(
        <DragDropProvider>
          {mockItems.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </DragDropProvider>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render with custom droppable ID', async () => {
      render(
        <DragDropProvider>
          {mockItems.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </DragDropProvider>
      );

      expect(screen.getByTestId('droppable-custom-list')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should call onReorder when item is dragged', async () => {
      const user = userEvent.setup();

      render(
        <DragDropProvider>
          {mockItems.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </DragDropProvider>
      );

      // Simulate drag by clicking (mocked behavior)
      await user.click(screen.getByTestId('drag-drop-context'));

      expect(mockOnReorder).toHaveBeenCalledWith([
        { id: '2', content: 'Item 2', order: 0 },
        { id: '1', content: 'Item 1', order: 1 },
        { id: '3', content: 'Item 3', order: 2 },
      ]);
    });

    it('should maintain item order when dropped in same position', async () => {
      const onDragEnd = jest.fn();

      render(
        <DragDropProvider items={mockItems as any} onReorder={onDragEnd}>
          {((item: any) => <div key={item.id}>{item.content}</div>) as any}
        </DragDropProvider>
      );

      // Mock same position drop
      const mockDragDropProvider = screen.getByTestId('drag-drop-context');
      mockDragDropProvider.onclick = () =>
        onDragEnd({
          destination: { index: 0 },
          source: { index: 0 },
          draggableId: 'item-1',
        });

      mockDragDropProvider.click();

      // Should not call onReorder if position hasn't changed
      expect(onDragEnd).not.toHaveBeenCalled();
    });
  });

  describe('Custom Rendering', () => {
    it('should render custom item components', async () => {
      render(
        <DragDropProvider items={mockItems as any} onReorder={mockOnReorder as any}>
          {(item: any) => (
            <div key={item.id} className="custom-item">
              <span>{item.content}</span>
              <button>Edit</button>
            </div>
          ) as any}
        </DragDropProvider>
      );

      const customItems = screen.getAllByRole('button', { name: 'Edit' });
      expect(customItems).toHaveLength(3);
    });

    it('should pass item data to render function', async () => {
      const renderItem = jest.fn(item => (
        <div key={item.id}>{item.content}</div>
      ));

      render(
        <DragDropProvider items={mockItems as any} onReorder={mockOnReorder as any}>
          {renderItem as any}
        </DragDropProvider>
      );

      expect(renderItem).toHaveBeenCalledTimes(3);
      expect(renderItem).toHaveBeenCalledWith(mockItems[0], 0);
      expect(renderItem).toHaveBeenCalledWith(mockItems[1], 1);
      expect(renderItem).toHaveBeenCalledWith(mockItems[2], 2);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no items', async () => {
      render(
        <DragDropProvider
          items={[]}
          onReorder={mockOnReorder as any}
          emptyState={<div>No items to display</div>}
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropProvider>
      );

      expect(screen.getByText('No items to display')).toBeInTheDocument();
    });

    it('should render default empty state', async () => {
      render(
        <DragDropProvider items={[]} onReorder={mockOnReorder as any}>
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropProvider>
      );

      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable drag and drop when disabled prop is true', async () => {
      render(
        <DragDropProvider
          items={mockItems as any}
          onReorder={mockOnReorder as any}
          disabled={true}
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropProvider>
      );

      const context = screen.getByTestId('drag-drop-context');
      expect(context).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(
        <DragDropProvider>
          {mockItems.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </DragDropProvider>
      );

      const droppable = screen.getByTestId('droppable-items');
      expect(droppable).toHaveAttribute('role', 'list');
    });

    it('should announce drag operations to screen readers', async () => {
      render(
        <DragDropProvider
          items={mockItems as any}
          onReorder={mockOnReorder as any}
          announceItem={item => `${item.content} grabbed`}
        >
          {item => <div key={item.id}>{item.content}</div>}
        </DragDropProvider>
      );

      // Check for screen reader announcements
      const announcement = screen.queryByRole('status');
      expect(announcement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderItem = jest.fn(item => (
        <div key={item.id}>{item.content}</div>
      ));

      const { rerender } = render(
        <DragDropProvider items={mockItems as any} onReorder={mockOnReorder as any}>
          {renderItem as any}
        </DragDropProvider>
      );

      const initialCallCount = renderItem.mock.calls.length;

      // Re-render with same props
      rerender(
        <DragDropProvider items={mockItems as any} onReorder={mockOnReorder as any}>
          {renderItem as any}
        </DragDropProvider>
      );

      // Should not call render function again with same items
      expect(renderItem.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Integration with DraggableItem', () => {
    it('should work with DraggableItem component', async () => {
      render(
        <DragDropProvider items={mockItems as any} onReorder={mockOnReorder as any}>
          {((item: any, index: any) => (
            <DraggableItem key={item.id} index={index}>
              <div>{item.content}</div>
            </DraggableItem>
          )) as any}
        </DragDropProvider>
      );

      // Check that draggable items are rendered
      expect(screen.getByTestId('draggable-1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-2')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-3')).toBeInTheDocument();
    });
  });
});
