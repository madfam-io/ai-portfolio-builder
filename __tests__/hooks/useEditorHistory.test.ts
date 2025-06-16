import { renderHook, act } from '@testing-library/react';
import { useEditorHistory } from '@/hooks/useEditorHistory';
import { Portfolio, PortfolioEditorState } from '@/types/portfolio';

describe('useEditorHistory', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    tagline: 'Test tagline',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: { email: 'test@example.com', phone: '123-456-7890', location: 'New York' },
    social: { github: 'https://github.com/test', linkedin: 'https://linkedin.com/in/test' },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    aiSettings: {},
    status: 'draft',
    subdomain: 'test',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createInitialState = (): PortfolioEditorState => ({
    portfolio: mockPortfolio,
    history: [],
    historyIndex: -1,
    isDirty: false,
    isAutoSaving: false,
    lastSaved: undefined,
    selectedSection: null,
    expandedSections: {},
    validationErrors: {},
    focusedField: null,
  });

  it('should initialize with no history', () => {
    const editorState = createInitialState();
    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should push to history', () => {
    const editorState = createInitialState();
    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    const updatedPortfolio = { ...mockPortfolio, name: 'Updated Portfolio' };

    act(() => {
      result.current.pushToHistory('Update name', updatedPortfolio);
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState.history).toHaveLength(1);
    expect(newState.history[0]).toMatchObject({
      action: 'Update name',
      state: expect.objectContaining({ name: 'Updated Portfolio' }),
      timestamp: expect.any(Date),
    });
    expect(newState.historyIndex).toBe(0);
  });

  it('should handle undo', () => {
    const historyEntry = {
      timestamp: new Date(),
      action: 'Initial state',
      state: mockPortfolio,
    };

    const updatedPortfolio = { ...mockPortfolio, name: 'Updated Portfolio' };
    const currentEntry = {
      timestamp: new Date(),
      action: 'Update name',
      state: updatedPortfolio,
    };

    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      portfolio: updatedPortfolio,
      history: [historyEntry, currentEntry],
      historyIndex: 1,
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState.portfolio.name).toBe('Test Portfolio');
    expect(newState.historyIndex).toBe(0);
    expect(newState.isDirty).toBe(true);
  });

  it('should handle redo', () => {
    const historyEntry = {
      timestamp: new Date(),
      action: 'Initial state',
      state: mockPortfolio,
    };

    const updatedPortfolio = { ...mockPortfolio, name: 'Updated Portfolio' };
    const nextEntry = {
      timestamp: new Date(),
      action: 'Update name',
      state: updatedPortfolio,
    };

    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      portfolio: mockPortfolio,
      history: [historyEntry, nextEntry],
      historyIndex: 0,
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState.portfolio.name).toBe('Updated Portfolio');
    expect(newState.historyIndex).toBe(1);
    expect(newState.isDirty).toBe(true);
  });

  it('should not undo when at beginning of history', () => {
    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history: [{ timestamp: new Date(), action: 'Initial', state: mockPortfolio }],
      historyIndex: 0,
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.undo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState).toBe(editorState); // Should return unchanged state
  });

  it('should not redo when at end of history', () => {
    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history: [{ timestamp: new Date(), action: 'Initial', state: mockPortfolio }],
      historyIndex: 0,
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.redo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState).toBe(editorState); // Should return unchanged state
  });

  it('should limit history to 50 entries', () => {
    const editorState = createInitialState();
    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    // Push 60 entries
    let currentState = editorState;
    for (let i = 0; i < 60; i++) {
      act(() => {
        result.current.pushToHistory(`Action ${i}`, mockPortfolio);
      });

      const updateFn = setEditorState.mock.calls[i][0];
      currentState = updateFn(currentState);
    }

    expect(currentState.history).toHaveLength(50);
    expect(currentState.history[0].action).toBe('Action 10'); // First 10 should be removed
    expect(currentState.history[49].action).toBe('Action 59'); // Last should be most recent
  });

  it('should clear future history when pushing after undo', () => {
    const history = [
      { timestamp: new Date(), action: 'Action 1', state: mockPortfolio },
      { timestamp: new Date(), action: 'Action 2', state: { ...mockPortfolio, name: 'Version 2' } },
      { timestamp: new Date(), action: 'Action 3', state: { ...mockPortfolio, name: 'Version 3' } },
    ];

    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history,
      historyIndex: 1, // Currently at Action 2
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    const newPortfolio = { ...mockPortfolio, name: 'New Version' };

    act(() => {
      result.current.pushToHistory('New Action', newPortfolio);
    });

    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState.history).toHaveLength(3); // Action 1, Action 2, New Action
    expect(newState.history[2].action).toBe('New Action');
    expect(newState.historyIndex).toBe(2);
  });

  it('should maintain function references across renders', () => {
    const editorState = createInitialState();
    const setEditorState = jest.fn();

    const { result, rerender } = renderHook(
      ({ state, setState }) => useEditorHistory(state, setState),
      {
        initialProps: {
          state: editorState,
          setState: setEditorState,
        },
      }
    );

    const firstPushToHistory = result.current.pushToHistory;
    const firstUndo = result.current.undo;
    const firstRedo = result.current.redo;

    // Re-render with same setState function
    rerender({
      state: { ...editorState, isDirty: true },
      setState: setEditorState,
    });

    expect(result.current.pushToHistory).toBe(firstPushToHistory);
    expect(result.current.undo).toBe(firstUndo);
    expect(result.current.redo).toBe(firstRedo);
  });

  it('should handle missing history entries gracefully', () => {
    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history: [],
      historyIndex: 5, // Invalid index
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    act(() => {
      result.current.undo();
    });

    // Should not crash and should return unchanged state
    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);
    expect(newState).toBe(editorState);
  });

  it('should merge portfolio states correctly during undo/redo', () => {
    const basePortfolio = mockPortfolio;
    const partialUpdate = { name: 'Partial Update', bio: 'New bio' };
    
    const history = [
      { timestamp: new Date(), action: 'Initial', state: basePortfolio },
      { timestamp: new Date(), action: 'Update', state: partialUpdate as Portfolio },
    ];

    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      portfolio: { ...basePortfolio, ...partialUpdate },
      history,
      historyIndex: 1,
    };

    const setEditorState = jest.fn();

    const { result } = renderHook(() => 
      useEditorHistory(editorState, setEditorState)
    );

    act(() => {
      result.current.undo();
    });

    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    // Should merge with existing portfolio, preserving non-overridden fields
    expect(newState.portfolio.name).toBe('Test Portfolio');
    expect(newState.portfolio.title).toBe('Developer'); // Should be preserved
  });
});