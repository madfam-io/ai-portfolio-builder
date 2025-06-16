import { useState, useEffect, useCallback, useMemo } from 'react';

import { Portfolio, SectionType } from '@/types/portfolio';

/**
 * @fileoverview Real-Time Preview Hook
 *
 * Manages real-time preview functionality for the portfolio editor,
 * including preview modes, section highlighting, and responsive design testing.
 */

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';
export type PreviewState = 'editing' | 'preview' | 'fullscreen';

interface PreviewConfig {
  mode: PreviewMode;
  state: PreviewState;
  activeSection: SectionType | null;
  highlightedSection: SectionType | null;
  showSectionBorders: boolean;
  showInteractiveElements: boolean;
  zoomLevel: number;
}

interface UseRealTimePreviewOptions {
  portfolio: Portfolio;
  onPreviewChange?: (config: PreviewConfig) => void;
}

interface UseRealTimePreviewReturn {
  previewConfig: PreviewConfig;
  previewDimensions: {
    width: string;
    height: string;
    scale: number;
  };

  // Preview mode controls
  setPreviewMode: (mode: PreviewMode) => void;
  setPreviewState: (state: PreviewState) => void;
  toggleFullscreen: () => void;

  // Section controls
  setActiveSection: (section: SectionType | null) => void;
  highlightSection: (section: SectionType | null) => void;
  scrollToSection: (section: SectionType) => void;

  // Visual controls
  setZoomLevel: (zoom: number) => void;
  toggleSectionBorders: () => void;
  toggleInteractiveElements: () => void;

  // Responsive testing
  getResponsiveBreakpoints: () => {
    name: string;
    width: number;
    height: number;
  }[];
  testResponsiveBreakpoint: (width: number, height: number) => void;

  // Preview utilities
  capturePreviewScreenshot: () => Promise<string | null>;
  exportPreviewHTML: () => string;
  getPreviewUrl: () => string | null;
}

const RESPONSIVE_BREAKPOINTS = [
  { name: 'Desktop Large', width: 1920, height: 1080 },
  { name: 'Desktop', width: 1366, height: 768 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Tablet Landscape', width: 1024, height: 600 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Mobile Large', width: 414, height: 736 },
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Mobile Small', width: 320, height: 568 },
];

const PREVIEW_DIMENSIONS = {
  desktop: { width: '100%', height: '100%', scale: 1 },
  tablet: { width: '768px', height: '1024px', scale: 0.8 },
  mobile: { width: '375px', height: '667px', scale: 0.9 },
};

export function useRealTimePreview({
  portfolio,
  onPreviewChange,
}: UseRealTimePreviewOptions): UseRealTimePreviewReturn {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>({
    mode: 'desktop',
    state: 'editing',
    activeSection: null,
    highlightedSection: null,
    showSectionBorders: false,
    showInteractiveElements: true,
    zoomLevel: 1,
  });

  const [customDimensions, setCustomDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Calculate preview dimensions based on mode and zoom
  const previewDimensions = useMemo(() => {
    const baseDimensions = customDimensions
      ? {
          width: `${customDimensions.width}px`,
          height: `${customDimensions.height}px`,
          scale: 1,
        }
      : PREVIEW_DIMENSIONS[previewConfig.mode];

    return {
      ...baseDimensions,
      scale: baseDimensions.scale * previewConfig.zoomLevel,
    };
  }, [previewConfig.mode, previewConfig.zoomLevel, customDimensions]);

  // Notify parent of preview changes
  useEffect(() => {
    onPreviewChange?.(previewConfig);
  }, [previewConfig, onPreviewChange]);

  // Preview mode controls
  const setPreviewMode = useCallback((mode: PreviewMode) => {
    setPreviewConfig(prev => ({ ...prev, mode }));
    setCustomDimensions(null); // Reset custom dimensions when changing mode
  }, []);

  const setPreviewState = useCallback((state: PreviewState) => {
    setPreviewConfig(prev => ({ ...prev, state }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setPreviewConfig(prev => ({
      ...prev,
      state: prev.state === 'fullscreen' ? 'preview' : 'fullscreen',
    }));
  }, []);

  // Section controls
  const setActiveSection = useCallback((section: SectionType | null) => {
    setPreviewConfig(prev => ({ ...prev, activeSection: section }));
  }, []);

  const highlightSection = useCallback((section: SectionType | null) => {
    setPreviewConfig(prev => ({ ...prev, highlightedSection: section }));
  }, []);

  const scrollToSection = useCallback(
    (section: SectionType) => {
      // This would trigger a scroll event in the preview component
      if (typeof window !== 'undefined') {
        const sectionElement = document.querySelector(
          `[data-section="${section}"]`
        );
        if (sectionElement) {
          sectionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      }
      setActiveSection(section);
    },
    [setActiveSection]
  );

  // Visual controls
  const setZoomLevel = useCallback((zoom: number) => {
    const clampedZoom = Math.max(0.25, Math.min(2, zoom)); // Clamp between 25% and 200%
    setPreviewConfig(prev => ({ ...prev, zoomLevel: clampedZoom }));
  }, []);

  const toggleSectionBorders = useCallback(() => {
    setPreviewConfig(prev => ({
      ...prev,
      showSectionBorders: !prev.showSectionBorders,
    }));
  }, []);

  const toggleInteractiveElements = useCallback(() => {
    setPreviewConfig(prev => ({
      ...prev,
      showInteractiveElements: !prev.showInteractiveElements,
    }));
  }, []);

  // Responsive testing
  const getResponsiveBreakpoints = useCallback(() => {
    return RESPONSIVE_BREAKPOINTS;
  }, []);

  const testResponsiveBreakpoint = useCallback(
    (width: number, height: number) => {
      setCustomDimensions({ width, height });
      setPreviewConfig(prev => ({ ...prev, mode: 'desktop' })); // Use desktop mode for custom dimensions
    },
    []
  );

  // Preview utilities
  const capturePreviewScreenshot = useCallback(async (): Promise<
    string | null
  > => {
    try {
      if (typeof window === 'undefined') return null;

      // This would use html2canvas or similar library to capture the preview
      const previewElement = document.querySelector('[data-preview-container]');
      if (!previewElement) return null;

      // For now, return a placeholder - implement with html2canvas in production
      return 'data:image/png;base64,placeholder-screenshot-data';
    } catch (error) {
      return null;
    }
  }, []);

  const exportPreviewHTML = useCallback((): string => {
    // Generate HTML export of the current preview
    if (typeof window === 'undefined') return '';

    const previewElement = document.querySelector('[data-preview-container]');
    if (!previewElement) return '';

    // Extract the HTML and inline the styles
    const html = previewElement.outerHTML;

    // Add meta tags and responsive styling
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.name || portfolio.title} - Portfolio</title>
  <style>
    /* Include Tailwind CSS or custom styles here */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${html}
</body>
</html>
    `.trim();
  }, [portfolio.name, portfolio.title]);

  const getPreviewUrl = useCallback((): string | null => {
    // Generate shareable preview URL
    if (portfolio.status === 'published' && portfolio.subdomain) {
      return `https://${portfolio.subdomain}.prisma.madfam.io`;
    }
    return null;
  }, [portfolio.status, portfolio.subdomain]);

  return {
    previewConfig,
    previewDimensions,
    setPreviewMode,
    setPreviewState,
    toggleFullscreen,
    setActiveSection,
    highlightSection,
    scrollToSection,
    setZoomLevel,
    toggleSectionBorders,
    toggleInteractiveElements,
    getResponsiveBreakpoints,
    testResponsiveBreakpoint,
    capturePreviewScreenshot,
    exportPreviewHTML,
    getPreviewUrl,
  };
}
