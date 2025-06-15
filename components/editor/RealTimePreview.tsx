import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { WidgetErrorBoundary } from '@/components/shared/error-boundaries';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';

/**
 * Real-Time Preview Component
 * Provides live preview of portfolio changes with device simulation
 */

interface RealTimePreviewProps {
  portfolio: Portfolio;
  template: string;
  className?: string;
  onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export const RealTimePreview = React.memo(function RealTimePreview({
  portfolio,
  template,
  className,
  onDeviceChange,
}: RealTimePreviewProps) {
  const { t } = useLanguage();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Device dimensions
  const deviceDimensions = {
    desktop: { width: '100%', height: '100%', scale: 1 },
    tablet: { width: '768px', height: '1024px', scale: 0.8 },
    mobile: { width: '375px', height: '812px', scale: 0.7 },
  };

  // Update preview when portfolio changes
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      // Post message to preview iframe to update content
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_PORTFOLIO',
          portfolio,
          template,
        },
        '*'
      );
    }
  }, [portfolio, template]);

  const handleDeviceChange = (newDevice: typeof device) => {
    setDevice(newDevice);
    onDeviceChange?.(newDevice);
  };

  const handleRefresh = (): void => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleOpenInNewTab = (): void => {
    const previewUrl = `/preview/${portfolio.id}?template=${template}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <WidgetErrorBoundary
      widgetName="RealTimePreview"
      compact={false}
      isolate={true}
    >
      <div className={cn('flex flex-col h-full bg-gray-50', className)}>
        {/* Preview Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Device Selector */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleDeviceChange('desktop')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    device === 'desktop'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                  title={t.desktop}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeviceChange('tablet')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    device === 'tablet'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                  title={t.tablet}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeviceChange('mobile')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    device === 'mobile'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                  title={t.mobile}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              {/* Device Info */}
              <span className="text-sm text-gray-500 ml-2">
                {device === 'desktop' && t.fullWidth}
                {device === 'tablet' && t.tabletSize}
                {device === 'mobile' && t.mobileSize}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={cn(
                  'p-2 rounded transition-colors',
                  showGrid
                    ? 'bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title={t.toggleGrid}
              >
                {showGrid ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 rounded transition-colors disabled:opacity-50"
                title={t.refresh}
              >
                <RefreshCw
                  className={cn('h-4 w-4', isLoading && 'animate-spin')}
                />
              </button>

              {/* Open in New Tab */}
              <button
                onClick={handleOpenInNewTab}
                className="p-2 text-gray-600 hover:text-gray-900 rounded transition-colors"
                title={t.openInNewTab}
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden p-8">
          <div className="h-full flex items-center justify-center">
            <div
              className={cn(
                'relative bg-white rounded-lg shadow-2xl transition-all duration-300',
                device !== 'desktop' && 'border-8 border-gray-800',
                device === 'mobile' && 'rounded-3xl',
                showGrid && 'preview-grid'
              )}
              style={{
                width: deviceDimensions[device].width,
                height: deviceDimensions[device].height,
                transform: `scale(${deviceDimensions[device].scale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Device Frame */}
              {device === 'mobile' && (
                <>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-gray-800 rounded-b-2xl" />
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gray-400 rounded-full" />
                </>
              )}

              {/* Preview Content */}
              <iframe
                ref={iframeRef}
                src={`/api/v1/preview?portfolioId=${portfolio.id}&template=${template}`}
                className={cn(
                  'w-full h-full bg-white',
                  device === 'mobile' && 'rounded-2xl'
                )}
                title={t.portfolioPreviewTitle}
                onLoad={() => setIsLoading(false)}
              />

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="text-sm text-gray-600">{t.loading}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .preview-grid {
            background-image:
              linear-gradient(
                0deg,
                transparent 24%,
                rgba(0, 0, 0, 0.05) 25%,
                rgba(0, 0, 0, 0.05) 26%,
                transparent 27%,
                transparent 74%,
                rgba(0, 0, 0, 0.05) 75%,
                rgba(0, 0, 0, 0.05) 76%,
                transparent 77%,
                transparent
              ),
              linear-gradient(
                90deg,
                transparent 24%,
                rgba(0, 0, 0, 0.05) 25%,
                rgba(0, 0, 0, 0.05) 26%,
                transparent 27%,
                transparent 74%,
                rgba(0, 0, 0, 0.05) 75%,
                rgba(0, 0, 0, 0.05) 76%,
                transparent 77%,
                transparent
              );
            background-size: 50px 50px;
          }
        `}</style>
      </div>
    </WidgetErrorBoundary>
  );
});
