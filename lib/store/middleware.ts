import { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * Store Middleware
 * Custom middleware for Zustand stores
 */

/**
 * Logger middleware for development
 */
export const logger =
  <
    T extends unknown,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  >(
    config: StateCreator<T, Mps, Mcs, T>
  ): StateCreator<T, Mps, Mcs, T> =>
  (set, get, api) =>
    config(
      ((partial: any, replace?: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('  applying', partial);
          set(partial, replace);
          console.log('  new state', get());
        } else {
          set(partial, replace);
        }
      }) as typeof set,
      get,
      api
    );

/**
 * Computed values middleware
 * @deprecated Complex type issues - temporarily disabled
 */
// export interface ComputedValues<T> {
//   [key: string]: (state: T) => any;
// }

// export const computed = <
//   T extends unknown,
//   C extends ComputedValues<T>,
//   Mps extends [StoreMutatorIdentifier, unknown][] = [],
//   Mcs extends [StoreMutatorIdentifier, unknown][] = [],
// >(
//   config: StateCreator<T, Mps, Mcs, T>,
//   computedValues: C,
// ): StateCreator<T & { computed: { [K in keyof C]: ReturnType<C[K]> } }, Mps, Mcs, T> =>
//   (set, get, api) => {
//     const state = config(set, get, api);

//     // Create computed property getter
//     const computed = new Proxy({} as unknown, {
//       get: (target, prop: string) => {
//         if (prop in computedValues) {
//           return computedValues[prop](get() as T);
//         }
//         return undefined;
//       },
//     });

//     return {
//       ...state,
//       computed,
//     } as unknown;
//   };

/**
 * Action logger middleware
 */
export const actionLogger =
  <
    T extends unknown,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  >(
    config: StateCreator<T, Mps, Mcs, T>,
    storeName: string
  ): StateCreator<T, Mps, Mcs, T> =>
  (set, get, api) => {
    const state = config(
      ((partial: any, replace?: any) => {
        if (process.env.NODE_ENV === 'development') {
          const timestamp = new Date().toISOString();
          console.group(`[${storeName}] State Update @ ${timestamp}`);
          console.log('Previous State:', get());
          set(partial, replace);
          console.log('Next State:', get());
          console.groupEnd();
        } else {
          set(partial, replace);
        }
      }) as typeof set,
      get,
      api
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
 * @deprecated Complex type issues - temporarily disabled
 */
// The undoRedo middleware has been temporarily disabled due to complex TypeScript
// type inference issues with Zustand v4. This can be re-enabled once the type
// issues are resolved or when migrating to a different state management solution.
