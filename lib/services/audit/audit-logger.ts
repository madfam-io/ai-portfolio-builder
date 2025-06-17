/**
 * Audit Logging Service for Compliance
 * Tracks all user actions, data access, and system events for SOC 2, GDPR compliance
 */

import { logger } from '@/lib/utils/logger';
import { redis, isRedisAvailable } from '@/lib/cache/redis-client';
import { createClient } from '@/lib/supabase/client';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  userIp: string;
  userAgent?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: Record<string, any>;
  outcome: 'success' | 'failure' | 'error';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  correlationId?: string;
}

export type AuditAction =
  // Authentication events
  | 'auth.login'
  | 'auth.logout'
  | 'auth.signup'
  | 'auth.password_reset'
  | 'auth.password_change'
  | 'auth.mfa_enable'
  | 'auth.mfa_disable'
  | 'auth.mfa_verify'
  | 'auth.session_expired'
  | 'auth.account_locked'

  // Data access events
  | 'data.read'
  | 'data.create'
  | 'data.update'
  | 'data.delete'
  | 'data.export'
  | 'data.import'
  | 'data.backup'

  // Portfolio events
  | 'portfolio.create'
  | 'portfolio.update'
  | 'portfolio.delete'
  | 'portfolio.publish'
  | 'portfolio.unpublish'
  | 'portfolio.view'
  | 'portfolio.export'
  | 'portfolio.share'

  // AI events
  | 'ai.enhance_bio'
  | 'ai.optimize_project'
  | 'ai.recommend_template'
  | 'ai.quota_exceeded'

  // Payment events
  | 'payment.subscription_create'
  | 'payment.subscription_update'
  | 'payment.subscription_cancel'
  | 'payment.invoice_paid'
  | 'payment.invoice_failed'
  | 'payment.refund'

  // Admin events
  | 'admin.user_view'
  | 'admin.user_update'
  | 'admin.user_delete'
  | 'admin.user_impersonate'
  | 'admin.system_config'
  | 'admin.data_export'

  // Security events
  | 'security.suspicious_activity'
  | 'security.rate_limit_exceeded'
  | 'security.unauthorized_access'
  | 'security.data_breach_detected'

  // GDPR events
  | 'gdpr.data_request'
  | 'gdpr.data_export'
  | 'gdpr.data_deletion'
  | 'gdpr.consent_given'
  | 'gdpr.consent_withdrawn'

  // System events
  | 'system.error'
  | 'system.maintenance'
  | 'system.backup'
  | 'system.restore';

export type AuditResource =
  | 'user'
  | 'portfolio'
  | 'ai_request'
  | 'payment'
  | 'subscription'
  | 'admin'
  | 'system'
  | 'session'
  | 'file'
  | 'api_key';

/**
 * Audit Logger Service
 */
class AuditLogger {
  private supabase = createClient();
  private buffer: AuditEvent[] = [];
  private maxBufferSize = 100;
  private flushInterval = 10000; // 10 seconds

  constructor() {
    // Start periodic buffer flush
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);

    // Flush buffer on process exit
    process.on('beforeExit', () => {
      this.flushBuffer();
    });
  }

  /**
   * Log an audit event
   */
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event,
    };

    try {
      // Add to buffer
      this.buffer.push(auditEvent);

      // Log to application logger as well
      logger.info('Audit event', auditEvent);

      // Store in Redis for immediate access if available
      if (isRedisAvailable()) {
        await this.storeInRedis(auditEvent);
      }

      // Flush buffer if full
      if (this.buffer.length >= this.maxBufferSize) {
        await this.flushBuffer();
      }

      // Handle critical events immediately
      if (auditEvent.riskLevel === 'critical') {
        await this.handleCriticalEvent(auditEvent);
      }
    } catch (error) {
      logger.error('Failed to log audit event', { error, event: auditEvent });
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(
    action: Extract<AuditAction, `auth.${string}`>,
    details: {
      userId?: string;
      userEmail?: string;
      userIp: string;
      userAgent?: string;
      outcome: 'success' | 'failure' | 'error';
      sessionId?: string;
      details?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log({
      action,
      resource: 'user',
      resourceId: details.userId,
      userId: details.userId,
      userEmail: details.userEmail,
      userIp: details.userIp,
      userAgent: details.userAgent,
      outcome: details.outcome,
      riskLevel: this.getRiskLevel(action, details.outcome),
      sessionId: details.sessionId,
      details: details.details || {},
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    action: Extract<AuditAction, `data.${string}`>,
    details: {
      userId: string;
      userEmail?: string;
      userIp: string;
      resource: AuditResource;
      resourceId?: string;
      outcome: 'success' | 'failure' | 'error';
      details?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log({
      action,
      resource: details.resource,
      resourceId: details.resourceId,
      userId: details.userId,
      userEmail: details.userEmail,
      userIp: details.userIp,
      outcome: details.outcome,
      riskLevel: this.getDataAccessRiskLevel(action),
      details: details.details || {},
    });
  }

  /**
   * Log security events
   */
  async logSecurity(
    action: Extract<AuditAction, `security.${string}`>,
    details: {
      userId?: string;
      userEmail?: string;
      userIp: string;
      userAgent?: string;
      resource?: AuditResource;
      resourceId?: string;
      details: Record<string, any>;
    }
  ): Promise<void> {
    await this.log({
      action,
      resource: details.resource || 'system',
      resourceId: details.resourceId,
      userId: details.userId,
      userEmail: details.userEmail,
      userIp: details.userIp,
      userAgent: details.userAgent,
      outcome: 'error',
      riskLevel: 'critical',
      details: details.details,
    });
  }

  /**
   * Log GDPR compliance events
   */
  async logGDPR(
    action: Extract<AuditAction, `gdpr.${string}`>,
    details: {
      userId: string;
      userEmail?: string;
      userIp: string;
      outcome: 'success' | 'failure' | 'error';
      details: Record<string, any>;
    }
  ): Promise<void> {
    await this.log({
      action,
      resource: 'user',
      resourceId: details.userId,
      userId: details.userId,
      userEmail: details.userEmail,
      userIp: details.userIp,
      outcome: details.outcome,
      riskLevel: 'high', // GDPR events are always high risk
      details: details.details,
    });
  }

  /**
   * Search audit logs
   */
  async search(criteria: {
    userId?: string;
    action?: AuditAction;
    resource?: AuditResource;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: AuditEvent['riskLevel'];
    limit?: number;
    offset?: number;
  }): Promise<{ events: AuditEvent[]; total: number }> {
    try {
      if (!this.supabase) {
        throw new Error('Database not available');
      }

      // Build query
      let query = this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      if (criteria.userId) {
        query = query.eq('user_id', criteria.userId);
      }
      if (criteria.action) {
        query = query.eq('action', criteria.action);
      }
      if (criteria.resource) {
        query = query.eq('resource', criteria.resource);
      }
      if (criteria.startDate) {
        query = query.gte('timestamp', criteria.startDate.toISOString());
      }
      if (criteria.endDate) {
        query = query.lte('timestamp', criteria.endDate.toISOString());
      }
      if (criteria.riskLevel) {
        query = query.eq('risk_level', criteria.riskLevel);
      }

      if (criteria.limit) {
        query = query.limit(criteria.limit);
      }
      if (criteria.offset) {
        query = query.range(
          criteria.offset,
          criteria.offset + (criteria.limit || 50) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to search audit logs', { error, criteria });
        return { events: [], total: 0 };
      }

      // Convert from database format
      const events: AuditEvent[] = data?.map(this.fromDatabaseFormat) || [];

      return { events, total: count || 0 };
    } catch (error) {
      logger.error('Audit log search failed', { error, criteria });
      return { events: [], total: 0 };
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByResource: Record<string, number>;
    eventsByRiskLevel: Record<string, number>;
    failedEvents: number;
    criticalEvents: AuditEvent[];
  }> {
    try {
      const { events } = await this.search({
        startDate,
        endDate,
        limit: 10000, // Large limit for report
      });

      const eventsByAction: Record<string, number> = {};
      const eventsByResource: Record<string, number> = {};
      const eventsByRiskLevel: Record<string, number> = {};
      const criticalEvents: AuditEvent[] = [];
      let failedEvents = 0;

      for (const event of events) {
        // Count by action
        eventsByAction[event.action] = (eventsByAction[event.action] || 0) + 1;

        // Count by resource
        eventsByResource[event.resource] =
          (eventsByResource[event.resource] || 0) + 1;

        // Count by risk level
        eventsByRiskLevel[event.riskLevel] =
          (eventsByRiskLevel[event.riskLevel] || 0) + 1;

        // Count failed events
        if (event.outcome === 'failure' || event.outcome === 'error') {
          failedEvents++;
        }

        // Collect critical events
        if (event.riskLevel === 'critical') {
          criticalEvents.push(event);
        }
      }

      return {
        totalEvents: events.length,
        eventsByAction,
        eventsByResource,
        eventsByRiskLevel,
        failedEvents,
        criticalEvents,
      };
    } catch (error) {
      logger.error('Failed to generate compliance report', { error });
      throw error;
    }
  }

  /**
   * Store event in Redis for immediate access
   */
  private async storeInRedis(event: AuditEvent): Promise<void> {
    try {
      const key = `audit:${event.id}`;
      await redis.setex(key, 3600, JSON.stringify(event)); // Store for 1 hour

      // Add to user-specific timeline
      if (event.userId) {
        const timelineKey = `audit:user:${event.userId}`;
        await redis.lpush(timelineKey, event.id);
        await redis.ltrim(timelineKey, 0, 99); // Keep last 100 events
        await redis.expire(timelineKey, 86400); // 24 hours
      }
    } catch (error) {
      logger.error('Failed to store audit event in Redis', { error });
    }
  }

  /**
   * Flush buffer to persistent storage
   */
  private async flushBuffer(): Promise<void> {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      if (!this.supabase) {
        logger.warn('Cannot flush audit buffer - database not available');
        return;
      }

      // Convert to database format
      const dbEvents = events.map(this.toDatabaseFormat);

      const { error } = await this.supabase.from('audit_logs').insert(dbEvents);

      if (error) {
        logger.error('Failed to flush audit buffer', { error });
        // Add events back to buffer for retry
        this.buffer.unshift(...events);
      }
    } catch (error) {
      logger.error('Audit buffer flush error', { error });
      // Add events back to buffer for retry
      this.buffer.unshift(...events);
    }
  }

  /**
   * Handle critical security events immediately
   */
  private async handleCriticalEvent(event: AuditEvent): Promise<void> {
    try {
      // Log to application logger with high priority
      logger.error('CRITICAL AUDIT EVENT', event);

      // Store immediately in database
      if (this.supabase) {
        const { error } = await this.supabase
          .from('audit_logs')
          .insert([this.toDatabaseFormat(event)]);

        if (error) {
          logger.error('Failed to store critical audit event', { error });
        }
      }

      // TODO: Send alerts to security team
      // TODO: Trigger automated security responses
    } catch (error) {
      logger.error('Failed to handle critical audit event', { error });
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Determine risk level based on action and outcome
   */
  private getRiskLevel(
    action: AuditAction,
    outcome: string
  ): AuditEvent['riskLevel'] {
    // Critical security events
    if (action.startsWith('security.') || action === 'auth.account_locked') {
      return 'critical';
    }

    // High risk events
    if (
      action.startsWith('admin.') ||
      action.startsWith('gdpr.') ||
      action === 'auth.password_reset' ||
      action === 'data.delete'
    ) {
      return 'high';
    }

    // Medium risk events
    if (
      action.startsWith('auth.') ||
      action.startsWith('payment.') ||
      outcome === 'failure'
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine risk level for data access events
   */
  private getDataAccessRiskLevel(
    action: Extract<AuditAction, `data.${string}`>
  ): AuditEvent['riskLevel'] {
    switch (action) {
      case 'data.delete':
      case 'data.export':
        return 'high';
      case 'data.update':
      case 'data.create':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Convert to database format
   */
  private toDatabaseFormat(event: AuditEvent): any {
    return {
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      user_id: event.userId,
      user_email: event.userEmail,
      user_ip: event.userIp,
      user_agent: event.userAgent,
      action: event.action,
      resource: event.resource,
      resource_id: event.resourceId,
      details: event.details,
      outcome: event.outcome,
      risk_level: event.riskLevel,
      session_id: event.sessionId,
      correlation_id: event.correlationId,
    };
  }

  /**
   * Convert from database format
   */
  private fromDatabaseFormat(data: any): AuditEvent {
    return {
      id: data.id,
      timestamp: new Date(data.timestamp),
      userId: data.user_id,
      userEmail: data.user_email,
      userIp: data.user_ip,
      userAgent: data.user_agent,
      action: data.action,
      resource: data.resource,
      resourceId: data.resource_id,
      details: data.details || {},
      outcome: data.outcome,
      riskLevel: data.risk_level,
      sessionId: data.session_id,
      correlationId: data.correlation_id,
    };
  }
}

/**
 * Singleton instance
 */
export const auditLogger = new AuditLogger();

/**
 * Helper functions for common audit events
 */
export const auditHelpers = {
  /**
   * Log user login
   */
  async logLogin(
    userId: string,
    userEmail: string,
    userIp: string,
    success: boolean
  ) {
    await auditLogger.logAuth('auth.login', {
      userId,
      userEmail,
      userIp,
      outcome: success ? 'success' : 'failure',
    });
  },

  /**
   * Log portfolio access
   */
  async logPortfolioAccess(
    userId: string,
    portfolioId: string,
    userIp: string,
    action: 'view' | 'edit'
  ) {
    await auditLogger.log({
      action: action === 'view' ? 'portfolio.view' : 'portfolio.update',
      resource: 'portfolio',
      resourceId: portfolioId,
      userId,
      userIp,
      outcome: 'success',
      riskLevel: 'low',
      details: { action },
    });
  },

  /**
   * Log AI request
   */
  async logAIRequest(
    userId: string,
    userIp: string,
    type: 'bio' | 'project' | 'template',
    success: boolean
  ) {
    const actionMap = {
      bio: 'ai.enhance_bio' as const,
      project: 'ai.optimize_project' as const,
      template: 'ai.recommend_template' as const,
    };

    await auditLogger.log({
      action: actionMap[type],
      resource: 'ai_request',
      userId,
      userIp,
      outcome: success ? 'success' : 'failure',
      riskLevel: 'low',
      details: { type },
    });
  },

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    userIp: string,
    reason: string,
    details: Record<string, any>
  ) {
    await auditLogger.logSecurity('security.suspicious_activity', {
      userIp,
      details: { reason, ...details },
    });
  },
};
