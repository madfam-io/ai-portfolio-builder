/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/experiments
 *
 * React provider for experiments
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Experiments } from '../core/experiments';
import type { UserContext } from '../core/types';

interface ExperimentsContextValue {
  experiments: Experiments | null;
  user: UserContext | null;
  setUser: (user: UserContext) => void;
  ready: boolean;
}

const ExperimentsContext = createContext<ExperimentsContextValue | null>(null);

export interface ExperimentsProviderProps {
  experiments: Experiments;
  user?: UserContext;
  children: React.ReactNode;
  loadOnMount?: boolean;
}

export function ExperimentsProvider({
  experiments,
  user: initialUser,
  children,
  loadOnMount = true,
}: ExperimentsProviderProps) {
  const [user, setUser] = useState<UserContext | null>(initialUser || null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loadOnMount && experiments) {
      // In a real implementation, this might load experiments from a remote source
      setReady(true);
    }
  }, [experiments, loadOnMount]);

  const value: ExperimentsContextValue = {
    experiments,
    user,
    setUser,
    ready,
  };

  return (
    <ExperimentsContext.Provider value={value}>
      {children}
    </ExperimentsContext.Provider>
  );
}

export function useExperimentsContext(): ExperimentsContextValue {
  const context = useContext(ExperimentsContext);
  if (!context) {
    throw new Error(
      'useExperimentsContext must be used within ExperimentsProvider'
    );
  }
  return context;
}
