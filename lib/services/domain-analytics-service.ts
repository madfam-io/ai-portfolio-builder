import { createClient } from '@/lib/supabase/client';
import type { DomainAnalytics } from '@/types/domains';

interface DetailedDomainAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  popularPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  deviceTypes: Record<string, number>;
  countries: Array<{ country: string; count: number }>;
}

export class DomainAnalyticsService {
  /**
   * Track a page view for a custom domain
   */
  static async trackPageView(
    domainId: string,
    path: string,
    referrer?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      await supabase.from('domain_analytics').insert({
        domain_id: domainId,
        event_type: 'page_view',
        path,
        referrer,
        user_agent: userAgent,
        visitor_id: this.generateVisitorId(),
        session_id: this.generateSessionId(),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Get analytics for a domain
   */
  static async getDomainAnalytics(
    domainId: string,
    dateRange: { from: Date; to: Date }
  ): Promise<DetailedDomainAnalytics> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    const { data: events, error } = await supabase
      .from('domain_analytics')
      .select('*')
      .eq('domain_id', domainId)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    if (error) {
      throw error;
    }

    const pageViews = events?.filter(e => e.event_type === 'page_view') || [];
    const uniqueVisitors = new Set(pageViews.map(e => e.visitor_id)).size;
    const uniqueSessions = new Set(pageViews.map(e => e.session_id)).size;

    // Calculate page popularity
    const pageCounts = pageViews.reduce(
      (acc, event) => {
        acc[event.path] = (acc[event.path] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const popularPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([path, views]) => ({ path, views: views as number }));

    // Calculate referrer stats
    const referrerCounts = pageViews
      .filter(e => e.referrer)
      .reduce(
        (acc, event) => {
          const referrerDomain = this.extractDomain(event.referrer);
          acc[referrerDomain] = (acc[referrerDomain] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const topReferrers = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count: count as number }));

    // Calculate daily views
    const dailyViews = this.calculateDailyViews(pageViews, dateRange);

    return {
      totalViews: pageViews.length,
      uniqueVisitors,
      uniqueSessions,
      averageSessionDuration: this.calculateAverageSessionDuration(
        events || []
      ),
      bounceRate: this.calculateBounceRate(events || []),
      popularPages,
      topReferrers,
      dailyViews,
      deviceTypes: this.calculateDeviceTypes(pageViews),
      countries: [], // Would need IP geolocation service
    };
  }

  /**
   * Get aggregated analytics for multiple domains
   */
  static async getAggregatedAnalytics(
    domainIds: string[],
    dateRange: { from: Date; to: Date }
  ): Promise<{
    totalViews: number;
    totalVisitors: number;
    domainPerformance: Array<{
      domainId: string;
      views: number;
      visitors: number;
    }>;
  }> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    const { data: events, error } = await supabase
      .from('domain_analytics')
      .select('*')
      .in('domain_id', domainIds)
      .eq('event_type', 'page_view')
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    if (error) {
      throw error;
    }

    const allVisitors = new Set(events?.map(e => e.visitor_id) || []);

    const domainPerformance = domainIds.map(domainId => {
      const domainEvents = events?.filter(e => e.domain_id === domainId) || [];
      const domainVisitors = new Set(domainEvents.map(e => e.visitor_id));

      return {
        domainId,
        views: domainEvents.length,
        visitors: domainVisitors.size,
      };
    });

    return {
      totalViews: events?.length || 0,
      totalVisitors: allVisitors.size,
      domainPerformance,
    };
  }

  /**
   * Record SSL certificate events
   */
  static async recordSSLEvent(
    domainId: string,
    eventType: 'provisioned' | 'renewed' | 'expired' | 'failed',
    details?: any
  ): Promise<void> {
    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      await supabase.from('domain_analytics').insert({
        domain_id: domainId,
        event_type: `ssl_${eventType}`,
        metadata: details,
      });
    } catch (error) {
      console.error('Failed to record SSL event:', error);
    }
  }

  /**
   * Helper methods
   */
  private static generateVisitorId(): string {
    // In production, this would use a more sophisticated method
    // like fingerprinting or cookie-based tracking
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateSessionId(): string {
    // In production, this would track actual user sessions
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'direct';
    }
  }

  private static calculateDailyViews(
    events: any[],
    dateRange: { from: Date; to: Date }
  ): Array<{ date: string; views: number }> {
    const dailyCounts: Record<string, number> = {};

    events.forEach(event => {
      if (event.created_at) {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (date) {
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
      }
    });

    // Fill in missing days with 0
    const days: Array<{ date: string; views: number }> = [];
    const current = new Date(dateRange.from);

    while (current <= dateRange.to) {
      const dateStr = current.toISOString().split('T')[0]!;
      days.push({
        date: dateStr,
        views: dailyCounts[dateStr] || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  private static calculateAverageSessionDuration(events: any[]): number {
    // Simplified calculation - in production would track actual session times
    const sessions = new Map<string, { start: Date; end: Date }>();

    events.forEach(event => {
      const sessionId = event.session_id;
      const eventTime = new Date(event.created_at);

      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { start: eventTime, end: eventTime });
      } else {
        const session = sessions.get(sessionId)!;
        if (eventTime < session.start) session.start = eventTime;
        if (eventTime > session.end) session.end = eventTime;
      }
    });

    let totalDuration = 0;
    sessions.forEach(session => {
      totalDuration += session.end.getTime() - session.start.getTime();
    });

    return sessions.size > 0 ? totalDuration / sessions.size / 1000 : 0; // in seconds
  }

  private static calculateBounceRate(events: any[]): number {
    // Count sessions with only one page view
    const sessionPageCounts = new Map<string, number>();

    events
      .filter(e => e.event_type === 'page_view')
      .forEach(event => {
        const count = sessionPageCounts.get(event.session_id) || 0;
        sessionPageCounts.set(event.session_id, count + 1);
      });

    const bouncedSessions = Array.from(sessionPageCounts.values()).filter(
      count => count === 1
    ).length;

    return sessionPageCounts.size > 0
      ? (bouncedSessions / sessionPageCounts.size) * 100
      : 0;
  }

  private static calculateDeviceTypes(events: any[]): Record<string, number> {
    const deviceCounts: Record<string, number> = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    events.forEach(event => {
      if (!event.user_agent) return;

      const ua = event.user_agent.toLowerCase();
      if (/mobile|android|iphone/i.test(ua) && !/ipad/i.test(ua)) {
        deviceCounts.mobile = (deviceCounts.mobile || 0) + 1;
      } else if (/ipad|tablet/i.test(ua)) {
        deviceCounts.tablet = (deviceCounts.tablet || 0) + 1;
      } else {
        deviceCounts.desktop = (deviceCounts.desktop || 0) + 1;
      }
    });

    return deviceCounts;
  }
}
