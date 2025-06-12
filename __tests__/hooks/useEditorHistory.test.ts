import { renderHook, act } from '@testing-library/react';

import { useEditorHistory } from '@/hooks/useEditorHistory';
import { PortfolioEditorState } from '@/types/portfolio';

const mockInitialState: PortfolioEditorState = {
  portfolio: {
    id: 'test-1',
    userId: 'user-1',
    name: 'Test Portfolio',
    title: 'Test Title',
    bio: 'Initial bio',
    contact: { email: 'test@example.com' },
    social: {},
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  isDirty: false,
  isSaving: false,
  previewMode: 'desktop',
  errors: {},
  history: [],
  historyIndex: -1,
};

describe('useEditorHistory', () => {
  it('should initialize with no undo/redo capability', () => {
    const mockSetState = jest.fn();

    const { result } = renderHook(() =>
      useEditorHistory(mockInitialState, mockSetState)
    );

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should have correct undo/redo capability based on state', () => {
    const mockSetState = jest.fn();

    // Test with no history - should not allow undo/redo
    const { result: result1 } = renderHook(() =>
      useEditorHistory(mockInitialState, mockSetState)
    );
    expect(result1.current.canUndo).toBe(false);
    expect(result1.current.canRedo).toBe(false);

    // Test with one item in history (index 0) - should not allow undo yet
    const stateWithOneItem = {
      ...mockInitialState,
      history: [
        {
          timestamp: new Date(),
          action: 'action-1',
          state: mockInitialState.portfolio,
        },
      ],
      historyIndex: 0,
    };
    const { result: result2 } = renderHook(() =>
      useEditorHistory(stateWithOneItem, mockSetState)
    );
    expect(result2.current.canUndo).toBe(false);
    expect(result2.current.canRedo).toBe(false);

    // Test with two items in history (index 1) - should allow undo
    const stateWithTwoItems = {
      ...mockInitialState,
      history: [
        {
          timestamp: new Date(),
          action: 'action-1',
          state: mockInitialState.portfolio,
        },
        {
          timestamp: new Date(),
          action: 'action-2',
          state: mockInitialState.portfolio,
        },
      ],
      historyIndex: 1,
    };
    const { result: result3 } = renderHook(() =>
      useEditorHistory(stateWithTwoItems, mockSetState)
    );
    expect(result3.current.canUndo).toBe(true);
    expect(result3.current.canRedo).toBe(false);
  });

  it('should call setState when pushing to history', () => {
    const mockSetState = jest.fn();

    const { result } = renderHook(() =>
      useEditorHistory(mockInitialState, mockSetState)
    );

    act(() => {
      result.current.pushToHistory('test-action', mockInitialState.portfolio);
    });

    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));

    // Test the setState function
    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(mockInitialState);

    expect(newState.history).toHaveLength(1);
    expect(newState.history[0]).toEqual({
      timestamp: expect.any(Date),
      action: 'test-action',
      state: mockInitialState.portfolio,
    });
    expect(newState.historyIndex).toBe(0);
  });

  it('should limit history to 50 entries', () => {
    const mockSetState = jest.fn();
    const stateWithFullHistory = {
      ...mockInitialState,
      history: Array(50)
        .fill(null)
        .map((_, i) => ({
          timestamp: new Date(),
          action: `action-${i}`,
          state: mockInitialState.portfolio,
        })),
      historyIndex: 49,
    };

    const { result } = renderHook(() =>
      useEditorHistory(stateWithFullHistory, mockSetState)
    );

    act(() => {
      result.current.pushToHistory('new-action', mockInitialState.portfolio);
    });

    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(stateWithFullHistory);

    expect(newState.history).toHaveLength(50);
    expect(newState.history[49].action).toBe('new-action');
    expect(newState.historyIndex).toBe(49);
  });

  it('should handle undo operation', () => {
    const mockSetState = jest.fn();
    const stateWithHistory = {
      ...mockInitialState,
      portfolio: {
        ...mockInitialState.portfolio,
        bio: 'Current bio',
      },
      history: [
        {
          timestamp: new Date(),
          action: 'first-update',
          state: mockInitialState.portfolio,
        },
        {
          timestamp: new Date(),
          action: 'bio-update',
          state: {
            ...mockInitialState.portfolio,
            bio: 'Previous bio',
          },
        },
      ],
      historyIndex: 1, // At second item, can undo to first
    };

    const { result } = renderHook(() =>
      useEditorHistory(stateWithHistory, mockSetState)
    );

    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));

    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(stateWithHistory);

    expect(newState.portfolio.bio).toBe('Initial bio'); // Goes to first history item
    expect(newState.historyIndex).toBe(0);
    expect(newState.isDirty).toBe(true);
  });

  it('should handle redo operation', () => {
    const mockSetState = jest.fn();
    const stateWithHistory = {
      ...mockInitialState,
      history: [
        {
          timestamp: new Date(),
          action: 'bio-update',
          state: {
            ...mockInitialState.portfolio,
            bio: 'Updated bio',
          },
        },
      ],
      historyIndex: -1, // Undo was performed
    };

    const { result } = renderHook(() =>
      useEditorHistory(stateWithHistory, mockSetState)
    );

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));

    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(stateWithHistory);

    expect(newState.portfolio.bio).toBe('Updated bio');
    expect(newState.historyIndex).toBe(0);
  });

  it('should not undo when no history available', () => {
    const mockSetState = jest.fn();

    const { result } = renderHook(() =>
      useEditorHistory(mockInitialState, mockSetState)
    );

    act(() => {
      result.current.undo();
    });

    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));

    // Verify that the state function returns the same state when no undo is possible
    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(mockInitialState);
    expect(newState).toBe(mockInitialState); // Should return the same object
  });

  it('should not redo when no future history available', () => {
    const mockSetState = jest.fn();
    const stateWithHistory = {
      ...mockInitialState,
      history: [
        {
          timestamp: new Date(),
          action: 'test-action',
          state: mockInitialState.portfolio,
        },
      ],
      historyIndex: 0, // At latest state
    };

    const { result } = renderHook(() =>
      useEditorHistory(stateWithHistory, mockSetState)
    );

    act(() => {
      result.current.redo();
    });

    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));

    // Verify that the state function returns the same state when no redo is possible
    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(stateWithHistory);
    expect(newState).toBe(stateWithHistory); // Should return the same object
  });

  it('should clear future history when pushing after undo', () => {
    const mockSetState = jest.fn();
    const stateWithHistory = {
      ...mockInitialState,
      history: [
        {
          timestamp: new Date(),
          action: 'action-1',
          state: mockInitialState.portfolio,
        },
        {
          timestamp: new Date(),
          action: 'action-2',
          state: { ...mockInitialState.portfolio, bio: 'Bio 2' },
        },
      ],
      historyIndex: 0, // Undone once
    };

    const { result } = renderHook(() =>
      useEditorHistory(stateWithHistory, mockSetState)
    );

    act(() => {
      result.current.pushToHistory('new-action', mockInitialState.portfolio);
    });

    const setStateFunction = mockSetState.mock.calls[0][0];
    const newState = setStateFunction(stateWithHistory);

    expect(newState.history).toHaveLength(2); // Original first entry + new entry
    expect(newState.history[1].action).toBe('new-action');
    expect(newState.historyIndex).toBe(1);
  });
});
