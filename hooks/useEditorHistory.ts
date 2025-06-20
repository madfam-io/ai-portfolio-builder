import { useCallback } from 'react';
import {
  Portfolio,
  PortfolioEditorState,
  PortfolioHistoryEntry,
} from '@/types/portfolio';

/**
 * Custom hook for managing editor history (undo/redo functionality)
 *
 * @param editorState Current editor state
 * @param setEditorState Function to update editor state
 * @returns History management functions
 */
export function useEditorHistory(
  editorState: PortfolioEditorState,
  setEditorState: React.Dispatch<React.SetStateAction<PortfolioEditorState>>
) {
  const pushToHistory = useCallback(
    (action: string, portfolio: Portfolio) => {
      setEditorState(prev => {
        const newEntry: PortfolioHistoryEntry = {
          timestamp: new Date(),
          action,
          state: { ...portfolio },
        };

        // Limit history to 50 entries to prevent memory issues
        const newHistory = [
          ...prev.history.slice(0, prev.historyIndex + 1),
          newEntry,
        ].slice(-50);

        return {
          ...prev,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },
    [setEditorState]
  );

  const undo = useCallback(() => {
    setEditorState(prev => {
      if (prev.historyIndex < 0) return prev;

      const newIndex = prev.historyIndex - 1;

      // If going to -1, we need to restore the initial state before any history
      if (newIndex < 0) {
        // For now, just prevent going below 0 since we don't store initial state
        return prev;
      }

      const previousState = prev.history[newIndex];

      if (previousState) {
        return {
          ...prev,
          portfolio: { ...prev.portfolio, ...previousState.state },
          historyIndex: newIndex,
          isDirty: true,
        };
      }

      return prev;
    });
  }, [setEditorState]);

  const redo = useCallback(() => {
    setEditorState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;
      const nextState = prev.history[newIndex];

      if (nextState) {
        return {
          ...prev,
          portfolio: { ...prev.portfolio, ...nextState.state },
          historyIndex: newIndex,
          isDirty: true,
        };
      }

      return prev;
    });
  }, [setEditorState]);

  const canUndo = editorState.historyIndex > 0;
  const canRedo = editorState.historyIndex < editorState.history.length - 1;

  return {
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
