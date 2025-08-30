/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

// Simplified monitoring for new infrastructure stack
// Uses Vercel Analytics + PostHog instead of OpenTelemetry/SigNoz

// Basic monitoring interface
export interface MonitoringConfig {
  enabled: boolean;
  environment: string;
}

export class Monitoring {
  private config: MonitoringConfig;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  // Stub methods for backward compatibility
  startInstrumentation(): void {
    if (this.config.enabled) {
      console.log('Monitoring initialized (using Vercel Analytics + PostHog)');
    }
  }

  track(event: string, properties?: Record<string, any>): void {
    if (this.config.enabled) {
      console.log('Event tracked:', event, properties);
      // In production, this would send to PostHog
    }
  }

  error(error: Error, context?: Record<string, any>): void {
    if (this.config.enabled) {
      console.error('Error tracked:', error.message, context);
      // In production, this would send to error tracking service
    }
  }

  performance(name: string, duration: number, context?: Record<string, any>): void {
    if (this.config.enabled) {
      console.log('Performance metric:', name, `${duration}ms`, context);
      // In production, this would send to Vercel Analytics
    }
  }
}

// Export singleton instance
export const monitoring = new Monitoring();

// Initialize monitoring
monitoring.startInstrumentation();

// Export additional functions for backward compatibility
export function initializeAllMonitoring(): void {
  monitoring.startInstrumentation();
}