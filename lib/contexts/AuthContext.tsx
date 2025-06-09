'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    const checkAuth = async () => {
      try {
        // Get initial user
        const { data, error } = await getCurrentUser();
        if (!error && data.user) {
          setUser(data.user);
        }
        setLoading(false);

        // Listen for auth changes
        const {
          data: { subscription },
        } = onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        // Supabase not configured - skip auth functionality
        console.warn('Authentication service not available:', error);
        setUser(null);
        setLoading(false);
        return () => {}; // No cleanup needed
      }
    };

    const cleanup = checkAuth();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  const signOut = async () => {
    try {
      const { signOut: authSignOut } = await import('@/lib/auth/auth');
      await authSignOut();
      setUser(null);
    } catch (error) {
      console.warn('Sign out failed - auth service not available:', error);
      setUser(null); // Still clear the user state
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe default when outside AuthProvider
    // This allows components to be used in pages that don't have auth
    return {
      user: null,
      loading: false,
      signOut: async () => {
        console.warn('useAuth: No AuthProvider found. Sign out disabled.');
      },
    };
  }
  return context;
}