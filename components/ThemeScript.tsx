import Script from 'next/script';

/**
 * Theme initialization script that runs before React hydration
 * This prevents FOUC (Flash of Unstyled Content)
 *
 * Uses Next.js Script component with beforeInteractive strategy
 * which is safer than dangerouslySetInnerHTML
 */
export default function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        // Check UI store for theme preference
        var uiStore = localStorage.getItem('ui-store');
        var theme = 'dark'; // default
        
        if (uiStore) {
          try {
            var parsed = JSON.parse(uiStore);
            if (parsed.state && parsed.state.theme) {
              theme = parsed.state.theme;
            }
          } catch (e) {
            // Silent fallback if parsing fails
          }
        }
        
        // Apply theme
        var root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      } catch (e) {
        // Default to dark mode if localStorage is not available
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <Script
      id="theme-script"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
