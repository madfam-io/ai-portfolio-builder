import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act , act } from '@testing-library/react';
import { useState } from 'react';
import type { Portfolio, PortfolioEditorState } from '@/types/portfolio';
import { useEditorHistory } from '@/hooks/useEditorHistory';

describe('useEditorHistory', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  // Verify the hook is loaded correctly
  it('should load the hook correctly', async () => {
    expect(typeof useEditorHistory).toBe('function');
  });

  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    tagline: 'Test tagline',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'New York',
    },
    social: {
      github: 'https://github.com/test',
      linkedin: 'https://linkedin.com/in/test',
    },
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

  it('should initialize with no history', async () => {
    const { result } = renderHook(() => {
      const [editorState, setEditorState] = useState(createInitialState());
      return useEditorHistory(editorState, setEditorState);
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should push to history', async () => {
    const { result } = renderHook(() => {
      const [editorState, setEditorState] = useState(createInitialState());
      return {
        editorState,
        setEditorState,
        ...useEditorHistory(editorState, setEditorState),
      };
    });

    const updatedPortfolio = { ...mockPortfolio, name: 'Updated Portfolio' };

    await act(async () => {
      result.current.pushToHistory('Update name', updatedPortfolio);
    });

    expect(result.current.editorState.history).toHaveLength(1);
    expect(result.current.editorState.history[0]).toMatchObject({
      action: 'Update name',
      state: expect.objectContaining({ name: 'Updated Portfolio' }),
      timestamp: expect.any(Date),
    });
    expect(result.current.editorState.historyIndex).toBe(0);
    expect(result.current.canUndo).toBeTruthy();
  });

  it('should handle undo', async () => {
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

    const setEditorState = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canUndo).toBeTruthy();

    await act(async () => {
      result.current.undo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState.portfolio.name).toBe('Test Portfolio');
    expect(newState.historyIndex).toBe(0);
    expect(newState.isDirty).toBe(true);
  });

  it('should handle redo', async () => {
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

    const setEditorState = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canRedo).toBeTruthy();

    await act(async () => {
      result.current.redo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState.portfolio.name).toBe('Updated Portfolio');
    expect(newState.historyIndex).toBe(1);
    expect(newState.isDirty).toBe(true);
  });

  it('should not undo when at beginning of history', async () => {
    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history: [
        { timestamp: new Date(), action: 'Initial', state: mockPortfolio },
      ],
      historyIndex: 0,
    };

    const setEditorState = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canUndo).toBe(false);

    await act(async () => {
      result.current.undo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState).toBe(editorState); // Should return unchanged state
  });

  it('should not redo when at end of history', async () => {
    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history: [
        { timestamp: new Date(), action: 'Initial', state: mockPortfolio },
      ],
      historyIndex: 0,
    };

    const setEditorState = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useEditorHistory(editorState, setEditorState)
    );

    expect(result.current.canRedo).toBe(false);

    await act(async () => {
      result.current.redo();
    });

    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    expect(newState).toBe(editorState); // Should return unchanged state
  });

  it('should limit history to 50 entries', async () => {
    const { result } = renderHook(() => {
      const [editorState, setEditorState] = useState(createInitialState());
      return {
        editorState,
        setEditorState,
        ...useEditorHistory(editorState, setEditorState),
      };
    });

    // Push 60 entries
    for (let i = 0; i < 60; i++) {
      await act(async () => {
        result.current.pushToHistory(`Action ${i}`, mockPortfolio);
      });
    }

    expect(result.current.editorState.history).toHaveLength(50);
    expect(result.current.editorState.history[0].action).toBe('Action 10'); // First 10 should be removed
    expect(result.current.editorState.history[49].action).toBe('Action 59'); // Last should be most recent
  });

  it('should clear future history when pushing after undo', async () => {
    const initialState = createInitialState();
    const history = [
      { timestamp: new Date(), action: 'Action 1', state: mockPortfolio },
      {
        timestamp: new Date(),
        action: 'Action 2',
        state: { ...mockPortfolio, name: 'Version 2' },
      },
      {
        timestamp: new Date(),
        action: 'Action 3',
        state: { ...mockPortfolio, name: 'Version 3' },
      },
    ];

    const { result } = renderHook(() => {
      const [editorState, setEditorState] = useState({
        ...initialState,
        history,
        historyIndex: 1, // Currently at Action 2
      });
      return {
        editorState,
        setEditorState,
        ...useEditorHistory(editorState, setEditorState),
      };
    });

    const newPortfolio = { ...mockPortfolio, name: 'New Version' };

    await act(async () => {
      result.current.pushToHistory('New Action', newPortfolio);
    });

    expect(result.current.editorState.history).toHaveLength(3); // Action 1, Action 2, New Action
    expect(result.current.editorState.history[2].action).toBe('New Action');
    expect(result.current.editorState.historyIndex).toBe(2);
  });

  it('should maintain function references across renders', async () => {
    const editorState = createInitialState();
    const setEditorState = jest.fn().mockReturnValue(void 0);

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

  it('should handle missing history entries gracefully', async () => {
    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      history: [],
      historyIndex: 5, // Invalid index
    };

    const setEditorState = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useEditorHistory(editorState, setEditorState)
    );

    await act(async () => {
      result.current.undo();
    });

    // Should not crash and should return unchanged state
    expect(setEditorState).toHaveBeenCalled();
    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);
    expect(newState).toBe(editorState);
  });

  it('should merge portfolio states correctly during undo/redo', async () => {
    const basePortfolio = mockPortfolio;
    const partialUpdate = { name: 'Partial Update', bio: 'New bio' };

    const history = [
      { timestamp: new Date(), description: 'Initial', state: basePortfolio },
      {
        timestamp: new Date(),
        description: 'Update',
        state: partialUpdate as Portfolio,
      },
    ];

    const editorState: PortfolioEditorState = {
      ...createInitialState(),
      portfolio: { ...basePortfolio, ...partialUpdate },
      history,
      historyIndex: 1,
    };

    const setEditorState = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useEditorHistory(editorState, setEditorState)
    );

    await act(async () => {
      result.current.undo();
    });

    const updateFn = setEditorState.mock.calls[0][0];
    const newState = updateFn(editorState);

    // Should merge with existing portfolio, preserving non-overridden fields
    expect(newState.portfolio.name).toBe('Test Portfolio');
    expect(newState.portfolio.title).toBe('Developer'); // Should be preserved
  });
});
