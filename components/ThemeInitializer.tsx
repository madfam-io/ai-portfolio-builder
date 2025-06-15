'use client';

import { useEffect } from 'react';

/**
 * Client-side theme initializer that avoids FOUC (Flash of Unstyled Content)
 * This component must be rendered as early as possible in the app
 */
export default function ThemeInitializer() {
  useEffect(() => {
    // This runs immediately on mount
    const initializeTheme = () => {
      try {
        // Check UI store for theme preference
        const uiStore = localStorage.getItem('ui-store');
        let theme = 'dark'; // default
        
        if (uiStore) {
          try {
            const parsed = JSON.parse(uiStore);
            if (parsed.state && parsed.state.theme) {
              theme = parsed.state.theme;
            }
          } catch (e) {
            // Silent fallback if parsing fails
          }
        }
        
        // Apply theme
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      } catch (e) {
        // Default to dark mode if localStorage is not available
        document.documentElement.classList.add('dark');
      }
    };

    // Run immediately
    initializeTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const uiStore = localStorage.getItem('ui-store');
      if (uiStore) {
        try {
          const parsed = JSON.parse(uiStore);
          if (parsed.state && parsed.state.theme === 'system') {
            initializeTheme();
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return null;
}