/**
 * Store Middleware
 * Custom middleware for Zustand stores
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * Logger middleware for development
 */
export const logger = <
  T extends unknown,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs, T>,
): StateCreator<T, Mps, Mcs, T> =>
  (set, get, api) =>
    config(
      (args) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('  applying', args);
          set(args);
          console.log('  new state', get());
        } else {
          set(args);
        }
      },
      get,
      api,
    );

/**
 * Computed values middleware
 */
export interface ComputedValues<T> {
  [key: string]: (state: T) => any;
}

export const computed = <
  T extends unknown,
  C extends ComputedValues<T>,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs, T>,
  computedValues: C,
): StateCreator<T & { computed: { [K in keyof C]: ReturnType<C[K]> } }, Mps, Mcs, T> =>
  (set, get, api) => {
    const state = config(set, get, api);
    
    // Create computed property getter
    const computed = new Proxy({} as any, {
      get: (target, prop: string) => {
        if (prop in computedValues) {
          return computedValues[prop](get() as T);
        }
        return undefined;
      },
    });

    return {
      ...state,
      computed,
    } as any;
  };

/**
 * Action logger middleware
 */
export const actionLogger = <
  T extends unknown,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs, T>,
  storeName: string,
): StateCreator<T, Mps, Mcs, T> =>
  (set, get, api) => {
    const state = config(
      (args) => {
        if (process.env.NODE_ENV === 'development') {
          const timestamp = new Date().toISOString();
          console.group(`[${storeName}] State Update @ ${timestamp}`);
          console.log('Previous State:', get());
          set(args);
          console.log('Next State:', get());
          console.groupEnd();
        } else {
          set(args);
        }
      },
      get,
      api,
    );

    // Wrap actions to log them
    const wrappedState: any = {};
    
    for (const key in state) {
      if (typeof state[key as keyof typeof state] === 'function') {
        wrappedState[key] = (...args: any[]) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[${storeName}] Action: ${key}`, args);
          }
          return (state[key as keyof typeof state] as any)(...args);
        };
      } else {
        wrappedState[key] = state[key as keyof typeof state];
      }
    }

    return wrappedState;
  };

/**
 * Undo/Redo middleware
 */
export interface UndoRedoState<T> {
  history: T[];
  currentIndex: number;
}

export interface UndoRedoActions {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const undoRedo = <
  T extends unknown,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs, T>,
  options?: {
    limit?: number;
    exclude?: (keyof T)[];
  },
): StateCreator<T & UndoRedoState<T> & UndoRedoActions, Mps, Mcs, T> => {
  const limit = options?.limit || 50;
  const exclude = options?.exclude || [];

  return (set, get, api) => {
    let isTimeTravel = false;
    
    const baseState = config(
      (args) => {
        set(args);
        
        // Don't track history during time travel
        if (!isTimeTravel) {
          const currentState = get() as any;
          const { history, currentIndex } = currentState;
          
          // Create a clean state snapshot (without history/undo/redo)
          const snapshot: any = {};
          for (const key in currentState) {
            if (
              key !== 'history' &&
              key !== 'currentIndex' &&
              key !== 'undo' &&
              key !== 'redo' &&
              key !== 'canUndo' &&
              key !== 'canRedo' &&
              key !== 'clearHistory' &&
              !exclude.includes(key as keyof T)
            ) {
              snapshot[key] = currentState[key];
            }
          }
          
          // Update history
          const newHistory = [
            ...history.slice(0, currentIndex + 1),
            snapshot,
          ].slice(-limit);
          
          set({
            history: newHistory,
            currentIndex: newHistory.length - 1,
          } as any);
        }
      },
      get,
      api,
    );

    return {
      ...baseState,
      history: [baseState],
      currentIndex: 0,
      
      undo: () => {
        const { history, currentIndex } = get() as any;
        if (currentIndex > 0) {
          isTimeTravel = true;
          const previousState = history[currentIndex - 1];
          set({
            ...previousState,
            history,
            currentIndex: currentIndex - 1,
          } as any);
          isTimeTravel = false;
        }
      },
      
      redo: () => {
        const { history, currentIndex } = get() as any;
        if (currentIndex < history.length - 1) {
          isTimeTravel = true;
          const nextState = history[currentIndex + 1];
          set({
            ...nextState,
            history,
            currentIndex: currentIndex + 1,
          } as any);
          isTimeTravel = false;
        }
      },
      
      canUndo: () => {
        const { currentIndex } = get() as any;
        return currentIndex > 0;
      },
      
      canRedo: () => {
        const { history, currentIndex } = get() as any;
        return currentIndex < history.length - 1;
      },
      
      clearHistory: () => {
        const currentState = get() as any;
        const snapshot: any = {};
        
        for (const key in currentState) {
          if (
            key !== 'history' &&
            key !== 'currentIndex' &&
            key !== 'undo' &&
            key !== 'redo' &&
            key !== 'canUndo' &&
            key !== 'canRedo' &&
            key !== 'clearHistory'
          ) {
            snapshot[key] = currentState[key];
          }
        }
        
        set({
          history: [snapshot],
          currentIndex: 0,
        } as any);
      },
    } as any;
  };
};