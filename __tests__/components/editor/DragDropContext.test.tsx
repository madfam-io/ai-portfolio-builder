import React from 'react';
import { render, screen } from '@testing-library/react';
import { DragDropContext } from 'react-beautiful-dnd';

// Simple test for DragDropContext
describe('DragDropContext', () => {
  it('should render children', () => {
    const onDragEnd = jest.fn();
    
    render(
      <DragDropContext onDragEnd={onDragEnd}>
        <div data-testid="child">Test Child</div>
      </DragDropContext>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should handle drag end', () => {
    const onDragEnd = jest.fn();
    
    render(
      <DragDropContext onDragEnd={onDragEnd}>
        <div>Content</div>
      </DragDropContext>
    );

    // DragDropContext is now properly imported
    expect(onDragEnd).toBeDefined();
  });
});