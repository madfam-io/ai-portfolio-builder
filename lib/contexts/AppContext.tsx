'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isDarkMode: boolean;
  currency: 'MXN' | 'USD' | 'EUR';
  toggleDarkMode: () => void;
  setCurrency: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
    const savedCurrency = localStorage.getItem('currency') as 'MXN' | 'USD' | 'EUR';
    if (savedCurrency && CURRENCY_CYCLE.includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else {
      // Default to MXN for first-time visitors
      localStorage.setItem('currency', 'MXN');
    }
  }, []);

  const toggleDarkMode = () => {
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

  const cycleCurrency = () => {
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}