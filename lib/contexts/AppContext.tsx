/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { AuthProvider } from './AuthContext';

/**
 * @fileoverview App Context for managing global application state
 *
 * This module provides centralized state management for app-wide settings including:
 * - Dark/Light mode with system preference and localStorage persistence
 * - Currency cycling for international pricing (MXN → USD → EUR)
 * - Mobile menu state for responsive navigation
 *
 * Key Features:
 * - Dark mode as default for better UX and modern design
 * - MXN as default currency (MADFAM's primary market)
 * - Automatic DOM manipulation for theme switching
 * - Cycle-based currency switching for easy user experience
 *
 * Usage:
 * ```tsx
 * import { useAppContext } from '@/lib/contexts/AppContext';
 *
 * export default function MyComponent() {
 *   const { isDarkMode, currency, toggleDarkMode, setCurrency } = useAppContext();
 *
 *   return (
 *     <div>
 *       <button onClick={toggleDarkMode}>
 *         {isDarkMode ? 'Light Mode' : 'Dark Mode'}
 *       </button>
 *       <button onClick={setCurrency}>
 *         {currency}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @author MADFAM Development Team
 * @version 2.0.0 - Enhanced currency system and dark mode defaults
 */

/**
 * Application context interface defining all global state and controls
 */
interface AppContextType {
  /** Current theme state - true for dark mode, false for light mode */
  isDarkMode: boolean;
  /** Current currency for pricing display - cycles through MXN → USD → EUR */
  currency: 'MXN' | 'USD' | 'EUR';
  /** Function to toggle between dark and light modes */
  toggleDarkMode: () => void;
  /** Function to cycle to the next currency in the sequence */
  setCurrency: () => void;
  /** Mobile menu visibility state for responsive navigation */
  isMobileMenuOpen: boolean;
  /** Function to control mobile menu visibility */
  setMobileMenuOpen: (open: boolean) => void;
}

/**
 * React Context for global app state
 * Uses undefined as default to enable proper error handling in useAppContext
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Currency rotation sequence prioritizing MADFAM's target markets:
 * 1. MXN (Mexican Peso) - Primary market
 * 2. USD (US Dollar) - Secondary market
 * 3. EUR (Euro) - International market
 */
const CURRENCY_CYCLE: Array<'MXN' | 'USD' | 'EUR'> = ['MXN', 'USD', 'EUR'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currency, setCurrencyState] = useState<'MXN' | 'USD' | 'EUR'>('MXN');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize dark mode from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDarkClass = document.documentElement.classList.contains('dark');

    if (savedTheme === 'light') {
      setIsDarkMode(false);
      if (isDarkClass) {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to dark mode for first-time visitors
      setIsDarkMode(true);
      if (!isDarkClass) {
        document.documentElement.classList.add('dark');
      }
      if (!savedTheme) {
        localStorage.setItem('theme', 'dark');
      }
    }
  }, []);

  // Initialize currency from localStorage or default to MXN
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as
      | 'MXN'
      | 'USD'
      | 'EUR';
    if (savedCurrency && CURRENCY_CYCLE.includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else {
      // Default to MXN for first-time visitors
      localStorage.setItem('currency', 'MXN');
    }
  }, []);

  const toggleDarkMode = (): void => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const setCurrency = (newCurrency: 'MXN' | 'USD' | 'EUR') => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const cycleCurrency = (): void => {
    const currentIndex = CURRENCY_CYCLE.indexOf(currency);
    const nextIndex = (currentIndex + 1) % CURRENCY_CYCLE.length;
    const nextCurrency = CURRENCY_CYCLE[nextIndex];
    if (nextCurrency) {
      setCurrency(nextCurrency);
    }
  };

  const value: AppContextType = {
    isDarkMode,
    currency,
    toggleDarkMode,
    setCurrency: cycleCurrency,
    isMobileMenuOpen,
    setMobileMenuOpen,
  };

  return (
    <AppContext.Provider value={value}>
      <AuthProvider>{children}</AuthProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
