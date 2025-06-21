/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

import { logger as utilLogger } from '@/lib/utils/logger';
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
      ((
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean | undefined
      ) => {
        if (process.env.NODE_ENV === 'development') {
          utilLogger.debug('  applying', { partial: partial as unknown });
          (set as (partial: unknown, replace?: boolean) => void)(
            partial,
            replace
          );
          utilLogger.debug('  new state', { state: get() as unknown });
        } else {
          (set as (partial: unknown, replace?: boolean) => void)(
            partial,
            replace
          );
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
    _storeName: string
  ): StateCreator<T, Mps, Mcs, T> =>
  (set, get, api) => {
    const state = config(
      ((
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean | undefined
      ) => {
        if (process.env.NODE_ENV === 'development') {
          // const timestamp = new Date().toISOString();
          // Group logging removed
          utilLogger.debug('Previous State:', { state: get() as unknown });
          (set as (partial: unknown, replace?: boolean) => void)(
            partial,
            replace
          );
          utilLogger.debug('Next State:', { state: get() as unknown });
          // Group end removed
        } else {
          (set as (partial: unknown, replace?: boolean) => void)(
            partial,
            replace
          );
        }
      }) as typeof set,
      get,
      api
    );

    // Wrap actions to log them
    const wrappedState: T = {} as T;

    for (const key in state) {
      if (typeof state[key as keyof typeof state] === 'function') {
        wrappedState[key as keyof T] = ((...args: unknown[]) => {
          if (process.env.NODE_ENV === 'development') {
            utilLogger.debug(`[${_storeName}] Action: ${key}`, { args });
          }
          return (
            state[key as keyof typeof state] as (...args: unknown[]) => unknown
          )(...args);
        }) as T[keyof T];
      } else {
        (wrappedState as Record<string, unknown>)[key] =
          state[key as keyof typeof state];
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
