/**
 * @fileoverview Mobile Performance Optimization
 *
 * Specialized optimizations for mobile devices to ensure excellent
 * performance on smartphones and tablets with limited resources.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

export interface MobileOptimizationConfig {
  enableTouchOptimizations: boolean;
  enableReducedMotion: boolean;
  enableDataSaver: boolean;
  maxMobileImageSize: number;
  prefersReducedData: boolean;
  enableOfflineSupport: boolean;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isLowEndDevice: boolean;
  hasSlowConnection: boolean;
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  screenSize: { width: number; height: number };
  devicePixelRatio: number;
  memoryLimit?: number;
}

/**
 * Device detection and capability assessment
 */
export class DeviceDetector {
  private capabilities: DeviceCapabilities;

  constructor() {
    this.capabilities = this.detectCapabilities();
  }

  /**
   * Detect device capabilities and limitations
   */
  private detectCapabilities(): DeviceCapabilities {
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isTablet =
      /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|KFAPWI/i.test(userAgent);

    // Detect low-end devices
    const isLowEndDevice = this.isLowEndDevice();

    // Detect connection speed
    const hasSlowConnection = this.hasSlowConnection();

    // Get user preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const prefersReducedData =
      typeof navigator !== 'undefined' && 'connection' in navigator
        ? (navigator as any).connection?.saveData
        : false;

    // Screen information
    const screenSize =
      typeof window !== 'undefined'
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 1024, height: 768 };

    const devicePixelRatio =
      typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    // Memory information (if available)
    const memoryLimit =
      typeof navigator !== 'undefined' && 'deviceMemory' in navigator
        ? (navigator as any).deviceMemory
        : undefined;

    return {
      isMobile,
      isTablet,
      isLowEndDevice,
      hasSlowConnection,
      prefersReducedMotion,
      prefersReducedData,
      screenSize,
      devicePixelRatio,
      memoryLimit,
    };
  }

  /**
   * Detect if device is low-end based on various heuristics
   */
  private isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false;

    // Check device memory
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory;
      if (memory && memory <= 2) return true;
    }

    // Check hardware concurrency (CPU cores)
    if ('hardwareConcurrency' in navigator) {
      const cores = navigator.hardwareConcurrency;
      if (cores && cores <= 2) return true;
    }

    // Check user agent for known low-end devices
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndIndicators = [
      'android 4',
      'android 5',
      'iphone os 10',
      'iphone os 11',
      'windows phone',
    ];

    return lowEndIndicators.some(indicator => userAgent.includes(indicator));
  }

  /**
   * Detect slow connection
   */
  private hasSlowConnection(): boolean {
    if (typeof navigator === 'undefined' || !('connection' in navigator))
      return false;

    const connection = (navigator as any).connection;
    if (!connection) return false;

    // Check effective connection type
    const slowTypes = ['slow-2g', '2g', '3g'];
    if (
      connection.effectiveType &&
      slowTypes.includes(connection.effectiveType)
    ) {
      return true;
    }

    // Check downlink speed (Mbps)
    if (connection.downlink && connection.downlink < 1.5) {
      return true;
    }

    return false;
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }

  /**
   * Check if device needs aggressive optimizations
   */
  needsAggressiveOptimization(): boolean {
    return (
      this.capabilities.isLowEndDevice ||
      this.capabilities.hasSlowConnection ||
      this.capabilities.prefersReducedData
    );
  }
}

/**
 * Mobile-specific image optimization
 */
export class MobileImageOptimizer {
  private config: MobileOptimizationConfig;
  private deviceDetector: DeviceDetector;

  constructor(
    config: MobileOptimizationConfig,
    deviceDetector: DeviceDetector
  ) {
    this.config = config;
    this.deviceDetector = deviceDetector;
  }

  /**
   * Optimize images for mobile devices
   */
  optimizeForMobile(imageUrl: string): {
    src: string;
    srcSet: string;
    sizes: string;
    loading: 'lazy' | 'eager';
    quality: number;
  } {
    const capabilities = this.deviceDetector.getCapabilities();
    const isLowEnd = this.deviceDetector.needsAggressiveOptimization();

    // Determine quality based on device capabilities
    const quality = this.getOptimalQuality(capabilities, isLowEnd);

    // Generate responsive image sizes
    const sizes = this.generateMobileSizes(capabilities);

    // Create srcSet for different screen densities
    const srcSet = this.generateSrcSet(imageUrl, capabilities, quality);

    // Determine loading strategy
    const loading = this.getLoadingStrategy(capabilities);

    return {
      src: `${imageUrl}?w=${sizes.default}&q=${quality}`,
      srcSet,
      sizes: this.generateSizesAttribute(capabilities),
      loading,
      quality,
    };
  }

  /**
   * Get optimal image quality for device
   */
  private getOptimalQuality(
    capabilities: DeviceCapabilities,
    isLowEnd: boolean
  ): number {
    if (capabilities.prefersReducedData || isLowEnd) {
      return 60; // Lower quality for data saving
    }

    if (capabilities.hasSlowConnection) {
      return 70; // Moderate quality for slow connections
    }

    if (capabilities.isMobile) {
      return 80; // Good quality for mobile
    }

    return 85; // High quality for desktop
  }

  /**
   * Generate mobile-appropriate image sizes
   */
  private generateMobileSizes(capabilities: DeviceCapabilities): {
    small: number;
    medium: number;
    large: number;
    default: number;
  } {
    const baseWidth = capabilities.screenSize.width;
    const pixelRatio = capabilities.devicePixelRatio;

    return {
      small: Math.round(baseWidth * 0.5 * pixelRatio),
      medium: Math.round(baseWidth * 0.75 * pixelRatio),
      large: Math.round(baseWidth * 1.0 * pixelRatio),
      default: Math.round(baseWidth * 0.75 * pixelRatio),
    };
  }

  /**
   * Generate srcSet for responsive images
   */
  private generateSrcSet(
    imageUrl: string,
    capabilities: DeviceCapabilities,
    quality: number
  ): string {
    const sizes = this.generateMobileSizes(capabilities);

    return [
      `${imageUrl}?w=${sizes.small}&q=${quality} ${sizes.small}w`,
      `${imageUrl}?w=${sizes.medium}&q=${quality} ${sizes.medium}w`,
      `${imageUrl}?w=${sizes.large}&q=${quality} ${sizes.large}w`,
    ].join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  private generateSizesAttribute(capabilities: DeviceCapabilities): string {
    if (capabilities.isMobile) {
      return '(max-width: 640px) 100vw, (max-width: 768px) 75vw, 50vw';
    }

    if (capabilities.isTablet) {
      return '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw';
    }

    return '(max-width: 1024px) 75vw, 50vw';
  }

  /**
   * Determine loading strategy based on device capabilities
   */
  private getLoadingStrategy(
    capabilities: DeviceCapabilities
  ): 'lazy' | 'eager' {
    // Use eager loading for above-the-fold content on fast devices
    if (!capabilities.hasSlowConnection && !capabilities.prefersReducedData) {
      return 'eager';
    }

    // Default to lazy loading for better performance
    return 'lazy';
  }
}

/**
 * Mobile viewport and interaction optimizations
 */
export class MobileViewportOptimizer {
  private config: MobileOptimizationConfig;
  private deviceDetector: DeviceDetector;

  constructor(
    config: MobileOptimizationConfig,
    deviceDetector: DeviceDetector
  ) {
    this.config = config;
    this.deviceDetector = deviceDetector;
  }

  /**
   * Optimize viewport settings for mobile
   */
  optimizeViewport(): void {
    if (typeof document === 'undefined') return;

    const capabilities = this.deviceDetector.getCapabilities();

    // Set optimal viewport meta tag
    this.setViewportMeta(capabilities);

    // Apply mobile-specific CSS optimizations
    this.applyMobileCSS(capabilities);

    // Configure touch interactions
    if (this.config.enableTouchOptimizations) {
      this.optimizeTouchInteractions();
    }
  }

  /**
   * Set optimal viewport meta tag
   */
  private setViewportMeta(capabilities: DeviceCapabilities): void {
    let viewportMeta = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement;

    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Base viewport settings
    let content = 'width=device-width, initial-scale=1';

    // Prevent zoom on low-end devices for better performance
    if (capabilities.isLowEndDevice) {
      content += ', user-scalable=no, maximum-scale=1';
    }

    // Optimize for specific device types
    if (capabilities.isMobile) {
      content += ', shrink-to-fit=no';
    }

    viewportMeta.content = content;
  }

  /**
   * Apply mobile-specific CSS optimizations
   */
  private applyMobileCSS(capabilities: DeviceCapabilities): void {
    const style = document.createElement('style');
    style.id = 'mobile-optimizations';

    let css = `
      /* Base mobile optimizations */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
      
      body {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      /* Touch target optimization */
      button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Smooth scrolling for iOS */
      * {
        -webkit-overflow-scrolling: touch;
      }
    `;

    // Add reduced motion styles if preferred
    if (capabilities.prefersReducedMotion || this.config.enableReducedMotion) {
      css += `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `;
    }

    // Add low-end device optimizations
    if (capabilities.isLowEndDevice) {
      css += `
        /* Disable expensive CSS features on low-end devices */
        .disable-on-low-end {
          transform: none !important;
          filter: none !important;
          box-shadow: none !important;
        }
        
        /* Simplify animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
    }

    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Optimize touch interactions
   */
  private optimizeTouchInteractions(): void {
    if (typeof document === 'undefined') return;

    // Add touch-friendly classes to interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea'
    );

    interactiveElements.forEach(element => {
      element.classList.add('touch-optimized');

      // Add touch event listeners for better responsiveness
      element.addEventListener(
        'touchstart',
        this.handleTouchStart as EventListener,
        { passive: true }
      );
      element.addEventListener(
        'touchend',
        this.handleTouchEnd as EventListener,
        { passive: true }
      );
    });
  }

  /**
   * Handle touch start for visual feedback
   */
  private handleTouchStart = (event: TouchEvent): void => {
    const target = event.target as HTMLElement;
    target.classList.add('touch-active');
  };

  /**
   * Handle touch end to remove visual feedback
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      target.classList.remove('touch-active');
    }, 150);
  };
}

/**
 * Mobile data usage optimization
 */
export class MobileDataOptimizer {
  private config: MobileOptimizationConfig;
  private deviceDetector: DeviceDetector;

  constructor(
    config: MobileOptimizationConfig,
    deviceDetector: DeviceDetector
  ) {
    this.config = config;
    this.deviceDetector = deviceDetector;
  }

  /**
   * Optimize data usage for mobile connections
   */
  optimizeDataUsage(): {
    enablePreloading: boolean;
    imageQuality: number;
    enableAnimations: boolean;
    enableBackgroundSync: boolean;
  } {
    const capabilities = this.deviceDetector.getCapabilities();
    const needsDataSaving =
      capabilities.prefersReducedData ||
      capabilities.hasSlowConnection ||
      this.config.enableDataSaver;

    return {
      enablePreloading: !needsDataSaving,
      imageQuality: needsDataSaving ? 60 : 80,
      enableAnimations: !needsDataSaving && !capabilities.prefersReducedMotion,
      enableBackgroundSync: !needsDataSaving,
    };
  }

  /**
   * Get optimized fetch configuration for mobile
   */
  getOptimizedFetchConfig(): RequestInit {
    const capabilities = this.deviceDetector.getCapabilities();
    const needsCompression =
      capabilities.hasSlowConnection || capabilities.prefersReducedData;

    return {
      headers: {
        'Accept-Encoding': needsCompression ? 'gzip, deflate, br' : 'identity',
        'Save-Data': capabilities.prefersReducedData ? 'on' : 'off',
      },
      // Use shorter timeout for slow connections
      signal: capabilities.hasSlowConnection
        ? AbortSignal.timeout(10000)
        : AbortSignal.timeout(30000),
    };
  }
}

/**
 * Complete mobile optimization system
 */
export class MobileOptimizationSystem {
  private config: MobileOptimizationConfig;
  private deviceDetector: DeviceDetector;
  private imageOptimizer: MobileImageOptimizer;
  private viewportOptimizer: MobileViewportOptimizer;
  private dataOptimizer: MobileDataOptimizer;

  constructor(config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG) {
    this.config = config;
    this.deviceDetector = new DeviceDetector();
    this.imageOptimizer = new MobileImageOptimizer(config, this.deviceDetector);
    this.viewportOptimizer = new MobileViewportOptimizer(
      config,
      this.deviceDetector
    );
    this.dataOptimizer = new MobileDataOptimizer(config, this.deviceDetector);
  }

  /**
   * Initialize mobile optimizations
   */
  initialize(): void {
    this.viewportOptimizer.optimizeViewport();

    // Apply data optimizations
    const dataConfig = this.dataOptimizer.optimizeDataUsage();
    this.applyDataOptimizations(dataConfig);
  }

  /**
   * Get optimized image configuration
   */
  optimizeImage(imageUrl: string) {
    return this.imageOptimizer.optimizeForMobile(imageUrl);
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return this.deviceDetector.getCapabilities();
  }

  /**
   * Check if mobile optimizations are needed
   */
  isMobileDevice(): boolean {
    const capabilities = this.deviceDetector.getCapabilities();
    return capabilities.isMobile || capabilities.isTablet;
  }

  /**
   * Apply data usage optimizations
   */
  private applyDataOptimizations(config: any): void {
    if (typeof document === 'undefined') return;

    // Disable autoplay videos on slow connections
    if (!config.enableAnimations) {
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        (video as HTMLVideoElement).removeAttribute('autoplay');
      });
    }

    // Reduce image preloading
    if (!config.enablePreloading) {
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach(link => {
        if ((link as HTMLLinkElement).as === 'image') {
          link.remove();
        }
      });
    }
  }
}

/**
 * Default mobile optimization configuration
 */
export const DEFAULT_MOBILE_CONFIG: MobileOptimizationConfig = {
  enableTouchOptimizations: true,
  enableReducedMotion: false,
  enableDataSaver: false,
  maxMobileImageSize: 2 * 1024 * 1024, // 2MB
  prefersReducedData: false,
  enableOfflineSupport: true,
};

/**
 * Create mobile optimization system
 */
export function createMobileOptimizer(
  config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG
) {
  return new MobileOptimizationSystem(config);
}
