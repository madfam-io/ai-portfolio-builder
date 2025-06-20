import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { createMobileOptimizer } from '@/lib/performance/mobile-optimization';

/**
 * Optimized image component with lazy loading and blur placeholder
 */

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  showSkeleton = true,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileOptimizer] = useState(() => createMobileOptimizer());
  const [optimizedImageConfig, setOptimizedImageConfig] = useState<{
    src: string;
    srcSet: string;
    sizes: string;
    loading: 'lazy' | 'eager';
    quality: number;
  } | null>(null);

  useEffect(() => {
    if (typeof src === 'string') {
      const config = mobileOptimizer.optimizeImage(src);
      setOptimizedImageConfig(config);
    }
  }, [src, mobileOptimizer]);

  const handleError = (): void => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = (): void => {
    setLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {showSkeleton && loading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}

      <Image
        src={error ? fallbackSrc : optimizedImageConfig?.src || src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        quality={optimizedImageConfig?.quality || 85}
        loading={optimizedImageConfig?.loading || 'lazy'}
        sizes={optimizedImageConfig?.sizes}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 will-change-transform`}
        {...props}
      />
    </div>
  );
}
