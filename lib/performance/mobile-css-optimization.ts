/**
 * @fileoverview Mobile CSS Optimization Utilities
 *
 * Provides responsive CSS classes and optimizations for mobile devices
 * to ensure excellent performance and user experience across all templates.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  large: string;
}

export interface MobileCSSConfig {
  enableTouchTargets: boolean;
  enableReducedMotion: boolean;
  enableFlexboxOptimizations: boolean;
  enableGridOptimizations: boolean;
  minTouchTarget: string;
}

/**
 * Default responsive breakpoints matching Tailwind CSS
 */
export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  large: '1280px',
};

/**
 * Default mobile CSS configuration
 */
export const DEFAULT_MOBILE_CSS_CONFIG: MobileCSSConfig = {
  enableTouchTargets: true,
  enableReducedMotion: true,
  enableFlexboxOptimizations: true,
  enableGridOptimizations: true,
  minTouchTarget: '44px',
};

/**
 * Mobile-responsive CSS class generator
 */
export class MobileCSSOptimizer {
  private config: MobileCSSConfig;
  private breakpoints: ResponsiveBreakpoints;

  constructor(
    config: MobileCSSConfig = DEFAULT_MOBILE_CSS_CONFIG,
    breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
  ) {
    this.config = config;
    this.breakpoints = breakpoints;
  }

  /**
   * Generate responsive container classes
   */
  getResponsiveContainer(): string {
    return 'w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto';
  }

  /**
   * Generate responsive grid classes
   */
  getResponsiveGrid(columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  }): string {
    const { mobile, tablet, desktop } = columns;
    return `grid grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} gap-4 md:gap-6 lg:gap-8`;
  }

  /**
   * Generate responsive text classes
   */
  getResponsiveText(sizes: {
    mobile: string;
    tablet: string;
    desktop: string;
  }): string {
    const { mobile, tablet, desktop } = sizes;
    return `text-${mobile} md:text-${tablet} lg:text-${desktop}`;
  }

  /**
   * Generate responsive spacing classes
   */
  getResponsiveSpacing(
    type: 'padding' | 'margin',
    sizes: { mobile: string; tablet: string; desktop: string }
  ): string {
    const { mobile, tablet, desktop } = sizes;
    const prefix = type === 'padding' ? 'p' : 'm';
    return `${prefix}-${mobile} md:${prefix}-${tablet} lg:${prefix}-${desktop}`;
  }

  /**
   * Generate touch-optimized button classes
   */
  getTouchOptimizedButton(): string {
    const classes = [
      'inline-flex items-center justify-center',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
    ];

    if (this.config.enableTouchTargets) {
      classes.push(
        `min-h-[${this.config.minTouchTarget}]`,
        `min-w-[${this.config.minTouchTarget}]`
      );
    }

    return classes.join(' ');
  }

  /**
   * Generate mobile-optimized image classes
   */
  getMobileImageClasses(): string {
    return [
      'w-full h-auto',
      'object-cover',
      'transition-transform duration-300',
      'will-change-transform',
    ].join(' ');
  }

  /**
   * Generate responsive flexbox classes
   */
  getResponsiveFlex(direction: { mobile: string; desktop: string }): string {
    return `flex flex-${direction.mobile} lg:flex-${direction.desktop} gap-4 lg:gap-6`;
  }

  /**
   * Generate performance-optimized animation classes
   */
  getOptimizedAnimationClasses(): string {
    const classes = ['transform-gpu', 'will-change-transform'];

    if (this.config.enableReducedMotion) {
      classes.push(
        'motion-reduce:transition-none',
        'motion-reduce:transform-none'
      );
    }

    return classes.join(' ');
  }

  /**
   * Generate mobile navigation classes
   */
  getMobileNavClasses(): string {
    return [
      'flex items-center justify-between',
      'p-4 lg:p-6',
      'sticky top-0 z-50',
      'bg-background/80 backdrop-blur-sm',
      'border-b border-border',
    ].join(' ');
  }

  /**
   * Generate responsive card classes
   */
  getResponsiveCard(): string {
    return [
      'bg-card text-card-foreground',
      'border border-border rounded-lg',
      'p-4 md:p-6',
      'shadow-sm hover:shadow-md',
      'transition-shadow duration-200',
    ].join(' ');
  }

  /**
   * Generate mobile-first layout classes
   */
  getMobileFirstLayout(): string {
    return [
      'min-h-screen',
      'flex flex-col',
      'bg-background text-foreground',
    ].join(' ');
  }

  /**
   * Generate responsive section classes
   */
  getResponsiveSection(): string {
    return [
      'py-8 md:py-12 lg:py-16',
      'px-4 md:px-6 lg:px-8',
      'max-w-7xl mx-auto',
    ].join(' ');
  }

  /**
   * Generate mobile-optimized form classes
   */
  getMobileFormClasses(): string {
    return [
      'w-full',
      `min-h-[${this.config.minTouchTarget}]`,
      'px-3 py-2',
      'text-base md:text-sm',
      'border border-border rounded-md',
      'focus:outline-none focus:ring-2 focus:ring-primary',
      'transition-colors duration-200',
    ].join(' ');
  }

  /**
   * Generate CSS custom properties for mobile optimization
   */
  getCSSCustomProperties(): Record<string, string> {
    return {
      '--touch-target-min': this.config.minTouchTarget,
      '--mobile-breakpoint': this.breakpoints.mobile,
      '--tablet-breakpoint': this.breakpoints.tablet,
      '--desktop-breakpoint': this.breakpoints.desktop,
      '--mobile-font-scale': '0.875',
      '--tablet-font-scale': '1',
      '--desktop-font-scale': '1.125',
    };
  }

  /**
   * Generate complete mobile stylesheet
   */
  generateMobileStylesheet(): string {
    const customProps = this.getCSSCustomProperties();
    const propsCSS = Object.entries(customProps)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');

    return `
:root {
${propsCSS}
}

/* Mobile-first base styles */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Touch target optimization */
button, a, input, select, textarea {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
}

/* Image optimization */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Mobile-specific optimizations */
@media (max-width: ${this.breakpoints.tablet}) {
  .mobile-stack {
    flex-direction: column !important;
  }
  
  .mobile-full-width {
    width: 100% !important;
  }
  
  .mobile-center {
    text-align: center !important;
  }
  
  .mobile-hide {
    display: none !important;
  }
}

/* Tablet optimizations */
@media (min-width: ${this.breakpoints.tablet}) and (max-width: ${this.breakpoints.desktop}) {
  .tablet-two-columns {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

.smooth-scroll {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Touch interaction feedback */
.touch-feedback {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}

.touch-feedback:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Safe area support for mobile devices */
.safe-area-inset {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Dark mode optimizations */
@media (prefers-color-scheme: dark) {
  .auto-dark-bg {
    background-color: theme('colors.slate.900');
    color: theme('colors.slate.100');
  }
}
`;
  }
}

/**
 * Template-specific mobile optimizations
 */
export class TemplateMobileOptimizer extends MobileCSSOptimizer {
  /**
   * Get Modern template mobile classes
   */
  getModernTemplateMobile(): {
    container: string;
    hero: string;
    card: string;
    grid: string;
  } {
    return {
      container: this.getResponsiveContainer(),
      hero: 'py-12 md:py-20 lg:py-24 text-center',
      card:
        this.getResponsiveCard() +
        ' backdrop-blur-sm bg-white/10 dark:bg-black/10',
      grid: this.getResponsiveGrid({ mobile: 1, tablet: 2, desktop: 3 }),
    };
  }

  /**
   * Get Minimal template mobile classes
   */
  getMinimalTemplateMobile(): {
    container: string;
    layout: string;
    typography: string;
  } {
    return {
      container: this.getResponsiveContainer() + ' max-w-4xl',
      layout: 'space-y-8 md:space-y-12 lg:space-y-16',
      typography: 'text-sm md:text-base leading-relaxed',
    };
  }

  /**
   * Get Business template mobile classes
   */
  getBusinessTemplateMobile(): {
    header: string;
    metrics: string;
    content: string;
  } {
    return {
      header: this.getMobileNavClasses() + ' bg-slate-900 text-white',
      metrics: this.getResponsiveGrid({ mobile: 2, tablet: 4, desktop: 4 }),
      content: this.getResponsiveSection() + ' prose prose-slate max-w-none',
    };
  }

  /**
   * Get Creative template mobile classes
   */
  getCreativeTemplateMobile(): {
    masonry: string;
    overlay: string;
    animations: string;
  } {
    return {
      masonry: 'columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6',
      overlay: 'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent',
      animations: this.getOptimizedAnimationClasses() + ' hover:scale-105',
    };
  }

  /**
   * Get Educator template mobile classes
   */
  getEducatorTemplateMobile(): {
    timeline: string;
    courseGrid: string;
    philosophy: string;
  } {
    return {
      timeline:
        'space-y-6 md:space-y-8 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-border',
      courseGrid: this.getResponsiveGrid({ mobile: 1, tablet: 2, desktop: 3 }),
      philosophy:
        'bg-amber-50 dark:bg-amber-900/20 p-6 md:p-8 rounded-lg border-l-4 border-amber-400',
    };
  }
}

/**
 * Create template mobile optimizer
 */
export function createTemplateMobileOptimizer(
  config?: MobileCSSConfig,
  breakpoints?: ResponsiveBreakpoints
): TemplateMobileOptimizer {
  return new TemplateMobileOptimizer(config, breakpoints);
}

/**
 * Apply mobile optimizations to existing classes
 */
export function applyMobileOptimizations(
  baseClasses: string,
  mobileClasses: string
): string {
  return `${baseClasses} ${mobileClasses}`.trim();
}

/**
 * Get device-specific CSS classes
 */
export function getDeviceSpecificClasses(
  deviceType: 'mobile' | 'tablet' | 'desktop'
): string {
  const baseClasses = 'transition-all duration-200';

  switch (deviceType) {
    case 'mobile':
      return `${baseClasses} text-sm p-3 gap-3`;
    case 'tablet':
      return `${baseClasses} text-base p-4 gap-4`;
    case 'desktop':
      return `${baseClasses} text-base p-6 gap-6`;
    default:
      return baseClasses;
  }
}
