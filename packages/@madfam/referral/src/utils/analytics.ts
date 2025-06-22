/**
 * Analytics utility
 */

export interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export class Analytics {
  private endpoint?: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint;
  }

  async track(userId: string, event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      userId,
      event,
      properties,
      timestamp: new Date().toISOString(),
    };

    // If custom endpoint is provided, send to it
    if (this.endpoint) {
      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyticsEvent),
        });
      } catch (error) {
        console.error('Failed to send analytics event', error);
      }
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', analyticsEvent);
    }
  }
}