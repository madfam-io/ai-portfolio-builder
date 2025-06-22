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
