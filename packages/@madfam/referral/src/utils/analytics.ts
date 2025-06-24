/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Analytics utility
 */

export interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export class Analytics {
  private endpoint?: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint;
  }

  async track(
    userId: string,
    event: string,
    properties?: Record<string, unknown>
  ) {
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
