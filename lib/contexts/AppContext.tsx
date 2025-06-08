'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isDarkMode: boolean;
  currency: 'USD' | 'EUR' | 'GBP';
  toggleDarkMode: () => void;
  setCurrency: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CURRENCY_CYCLE: Array<'USD' | 'EUR' | 'GBP'> = ['USD', 'EUR', 'GBP'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currency, setCurrencyState] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Initialize currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as 'USD' | 'EUR' | 'GBP';
    if (savedCurrency && CURRENCY_CYCLE.includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
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

  const setCurrency = (newCurrency: 'USD' | 'EUR' | 'GBP') => {
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