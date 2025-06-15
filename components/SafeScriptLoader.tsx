'use client';

import { useEffect } from 'react';

interface SafeScriptLoaderProps {
  src?: string;
  onLoad?: () => void;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
}

/**
 * Safe script loader component that avoids dangerouslySetInnerHTML
 * Loads external scripts or executes inline scripts safely
 */
export default function SafeScriptLoader({
  src,
  onLoad,
  strategy = 'afterInteractive',
}: SafeScriptLoaderProps) {
  useEffect(() => {
    if (strategy !== 'afterInteractive') return;

    if (src) {
      // Load external script
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      if (onLoad) {
        script.onload = onLoad;
      }

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
    return undefined;
  }, [src, onLoad, strategy]);

  // For beforeInteractive scripts, return null as they should be in <head>
  if (strategy === 'beforeInteractive') {
    return null;
  }

  return null;
}

/**
 * Hook to safely execute client-side scripts
 */
export function useClientScript(
  scriptFn: () => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        scriptFn();
      } catch (error) {
        // Log error in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('Error executing client script:', error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
