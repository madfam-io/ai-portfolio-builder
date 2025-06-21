/**
 * GDPR Compliance Service
 * Handles data protection requests, consent management, and privacy controls
 */

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { auditLogger } from '@/lib/services/audit/audit-logger';
import { AppError } from '@/types/errors';
import { redis, isRedisAvailable } from '@/lib/cache/redis-client';

export interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  purpose: string;
  legalBasis: LegalBasis;
  expiryDate?: Date;
}

export type ConsentType =
  | 'marketing'
  | 'analytics'
  | 'essential'
  | 'performance'
  | 'targeting'
  | 'ai_processing'
  | 'data_sharing';

export type LegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export interface DataExportRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedDate?: Date;
  downloadUrl?: string;
  expiryDate?: Date;
  requestIp: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedDate?: Date;
  deletionType: 'soft' | 'hard';
  retentionPeriod?: number; // days
  requestIp: string;
  reason?: string;
}

export interface PrivacySettings {
  userId: string;
  profileVisibility: 'public' | 'private' | 'unlisted';
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  dataProcessingEnabled: boolean;
  thirdPartySharing: boolean;
  dataRetentionPeriod: number; // days
  updatedAt: Date;
}

/**
 * GDPR Compliance Service
 */
class GDPRService {
  private supabase = createClient();

  /**
   * Record user consent
   */
  async recordConsent(
    consent: Omit<ConsentRecord, 'timestamp'>
  ): Promise<void> {
    try {
      const consentRecord: ConsentRecord = {
        ...consent,
        timestamp: new Date(),
      };

      // Store in database
      if (this.supabase) {
        const { error } = await this.supabase.from('user_consent').upsert({
          user_id: consent.userId,
          consent_type: consent.consentType,
          granted: consent.granted,
          timestamp: consentRecord.timestamp.toISOString(),
          ip_address: consent.ipAddress,
          user_agent: consent.userAgent,
          purpose: consent.purpose,
          legal_basis: consent.legalBasis,
          expiry_date: consent.expiryDate?.toISOString(),
        });

        if (error) {
          logger.error('Failed to record consent', { error, consent });
          throw new AppError(
            'CONSENT_RECORD_FAILED',
            'Failed to record consent',
            500
          );
        }
      }

      // Cache in Redis for quick access
      if (isRedisAvailable()) {
        const cacheKey = `consent:${consent.userId}:${consent.consentType}`;
        await redis.setex(cacheKey, 86400, JSON.stringify(consentRecord)); // 24 hours
      }

      // Log audit event
      await auditLogger.logGDPR('gdpr.consent_given', {
        userId: consent.userId,
        userIp: consent.ipAddress,
        outcome: 'success',
        details: {
          consentType: consent.consentType,
          granted: consent.granted,
          purpose: consent.purpose,
          legalBasis: consent.legalBasis,
        },
      });

      logger.info('Consent recorded successfully', {
        userId: consent.userId,
        consentType: consent.consentType,
        granted: consent.granted,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to record consent', { error, consent });
      throw new AppError(
        'CONSENT_RECORD_FAILED',
        'Failed to record consent',
        500
      );
    }
  }

  /**
   * Get user consent status
   */
  async getUserConsent(
    userId: string
  ): Promise<Record<ConsentType, ConsentRecord | null>> {
    try {
      // Try Redis first
      if (isRedisAvailable()) {
        const cachedConsent = await this.getCachedConsent(userId);
        if (cachedConsent) {
          return cachedConsent;
        }
      }

      // Fallback to database
      if (!this.supabase) {
        return this.getDefaultConsent();
      }

      const { data, error } = await this.supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to get user consent', { error, userId });
        return this.getDefaultConsent();
      }

      const consentMap: Record<ConsentType, ConsentRecord | null> =
        this.getDefaultConsent();

      data?.forEach((record: any) => {
        consentMap[record.consent_type as ConsentType] = {
          userId: record.user_id,
          consentType: record.consent_type,
          granted: record.granted,
          timestamp: new Date(record.timestamp),
          ipAddress: record.ip_address,
          userAgent: record.user_agent,
          purpose: record.purpose,
          legalBasis: record.legal_basis,
          expiryDate: record.expiry_date
            ? new Date(record.expiry_date)
            : undefined,
        };
      });

      // Cache the result
      if (isRedisAvailable()) {
        await this.cacheConsent(userId, consentMap);
      }

      return consentMap;
    } catch (error) {
      logger.error('Failed to get user consent', { error, userId });
      return this.getDefaultConsent();
    }
  }

  /**
   * Request data export (Right of Access)
   */
  async requestDataExport(
    userId: string,
    userEmail: string,
    requestIp: string
  ): Promise<DataExportRequest> {
    try {
      const request: DataExportRequest = {
        id: `export_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        userId,
        userEmail,
        requestDate: new Date(),
        status: 'pending',
        requestIp,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      // Store request in database
      if (this.supabase) {
        const { error } = await this.supabase
          .from('data_export_requests')
          .insert({
            id: request.id,
            user_id: request.userId,
            user_email: request.userEmail,
            request_date: request.requestDate.toISOString(),
            status: request.status,
            request_ip: request.requestIp,
            expiry_date: request.expiryDate?.toISOString(),
          });

        if (error) {
          logger.error('Failed to create data export request', {
            error,
            request,
          });
          throw new AppError(
            'EXPORT_REQUEST_FAILED',
            'Failed to create data export request',
            500
          );
        }
      }

      // Log audit event
      await auditLogger.logGDPR('gdpr.data_request', {
        userId,
        userEmail,
        userIp: requestIp,
        outcome: 'success',
        details: {
          requestId: request.id,
          type: 'export',
        },
      });

      // Queue processing (in production, use a proper job queue)
      this.processDataExportAsync(request);

      logger.info('Data export request created', {
        requestId: request.id,
        userId,
      });
      return request;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to request data export', { error, userId });
      throw new AppError(
        'EXPORT_REQUEST_FAILED',
        'Failed to request data export',
        500
      );
    }
  }

  /**
   * Request data deletion (Right to be Forgotten)
   */
  async requestDataDeletion(
    userId: string,
    userEmail: string,
    options: {
      requestIp: string;
      deletionType?: 'soft' | 'hard';
      reason?: string;
    }
  ): Promise<DataDeletionRequest> {
    try {
      const { requestIp, deletionType = 'soft', reason } = options;

      const request: DataDeletionRequest = {
        id: `deletion_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        userId,
        userEmail,
        requestDate: new Date(),
        status: 'pending',
        deletionType,
        retentionPeriod: deletionType === 'soft' ? 90 : 0, // 90 days for soft delete
        requestIp,
        reason,
      };

      // Store request in database
      if (this.supabase) {
        const { error } = await this.supabase
          .from('data_deletion_requests')
          .insert({
            id: request.id,
            user_id: request.userId,
            user_email: request.userEmail,
            request_date: request.requestDate.toISOString(),
            status: request.status,
            deletion_type: request.deletionType,
            retention_period: request.retentionPeriod,
            request_ip: request.requestIp,
            reason: request.reason,
          });

        if (error) {
          logger.error('Failed to create data deletion request', {
            error,
            request,
          });
          throw new AppError(
            'DELETION_REQUEST_FAILED',
            'Failed to create data deletion request',
            500
          );
        }
      }

      // Log audit event
      await auditLogger.logGDPR('gdpr.data_deletion', {
        userId,
        userEmail,
        userIp: requestIp,
        outcome: 'success',
        details: {
          requestId: request.id,
          deletionType,
          reason,
        },
      });

      // Queue processing
      this.processDataDeletionAsync(request);

      logger.info('Data deletion request created', {
        requestId: request.id,
        userId,
      });
      return request;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to request data deletion', { error, userId });
      throw new AppError(
        'DELETION_REQUEST_FAILED',
        'Failed to request data deletion',
        500
      );
    }
  }

  /**
   * Get user privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      if (!this.supabase) {
        return this.getDefaultPrivacySettings(userId);
      }

      const { data, error } = await this.supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return this.getDefaultPrivacySettings(userId);
      }

      return {
        userId: data.user_id,
        profileVisibility: data.profile_visibility,
        analyticsEnabled: data.analytics_enabled,
        marketingEnabled: data.marketing_enabled,
        dataProcessingEnabled: data.data_processing_enabled,
        thirdPartySharing: data.third_party_sharing,
        dataRetentionPeriod: data.data_retention_period,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      logger.error('Failed to get privacy settings', { error, userId });
      return this.getDefaultPrivacySettings(userId);
    }
  }

  /**
   * Update user privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: Partial<Omit<PrivacySettings, 'userId' | 'updatedAt'>>,
    userIp: string
  ): Promise<PrivacySettings> {
    try {
      const currentSettings = await this.getPrivacySettings(userId);
      const updatedSettings: PrivacySettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date(),
      };

      if (this.supabase) {
        const { error } = await this.supabase
          .from('user_privacy_settings')
          .upsert({
            user_id: userId,
            profile_visibility: updatedSettings.profileVisibility,
            analytics_enabled: updatedSettings.analyticsEnabled,
            marketing_enabled: updatedSettings.marketingEnabled,
            data_processing_enabled: updatedSettings.dataProcessingEnabled,
            third_party_sharing: updatedSettings.thirdPartySharing,
            data_retention_period: updatedSettings.dataRetentionPeriod,
            updated_at: updatedSettings.updatedAt.toISOString(),
          });

        if (error) {
          logger.error('Failed to update privacy settings', {
            error,
            userId,
            settings,
          });
          throw new AppError(
            'PRIVACY_UPDATE_FAILED',
            'Failed to update privacy settings',
            500
          );
        }
      }

      // Log audit event
      await auditLogger.logDataAccess('data.update', {
        userId,
        userIp,
        resource: 'user',
        resourceId: userId,
        outcome: 'success',
        details: {
          type: 'privacy_settings',
          changes: settings,
        },
      });

      logger.info('Privacy settings updated', { userId, settings });
      return updatedSettings;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to update privacy settings', { error, userId });
      throw new AppError(
        'PRIVACY_UPDATE_FAILED',
        'Failed to update privacy settings',
        500
      );
    }
  }

  /**
   * Check if user can be contacted for marketing
   */
  async canContactForMarketing(userId: string): Promise<boolean> {
    const consent = await this.getUserConsent(userId);
    const marketingConsent = consent.marketing;

    if (!marketingConsent || !marketingConsent.granted) {
      return false;
    }

    // Check if consent has expired
    if (
      marketingConsent.expiryDate &&
      marketingConsent.expiryDate < new Date()
    ) {
      return false;
    }

    return true;
  }

  /**
   * Process data export asynchronously
   */
  private async processDataExportAsync(
    request: DataExportRequest
  ): Promise<void> {
    try {
      // Update status to processing
      await this.updateExportRequestStatus(request.id, 'processing');

      // Collect all user data
      const userData = await this.collectUserData(request.userId);

      // Generate export file (JSON format)
      const exportData = {
        userId: request.userId,
        exportDate: new Date().toISOString(),
        requestId: request.id,
        data: userData,
      };

      // In production, upload to secure storage and generate download URL
      const downloadUrl = this.generateExportFile(exportData);

      // Update request with download URL
      await this.updateExportRequestStatus(
        request.id,
        'completed',
        downloadUrl
      );

      // Log completion
      await auditLogger.logGDPR('gdpr.data_export', {
        userId: request.userId,
        userEmail: request.userEmail,
        userIp: request.requestIp,
        outcome: 'success',
        details: {
          requestId: request.id,
          exportSize: JSON.stringify(exportData).length,
        },
      });

      logger.info('Data export completed', { requestId: request.id });
    } catch (error) {
      logger.error('Data export processing failed', {
        error,
        requestId: request.id,
      });
      await this.updateExportRequestStatus(request.id, 'failed');
    }
  }

  /**
   * Process data deletion asynchronously
   */
  private async processDataDeletionAsync(
    request: DataDeletionRequest
  ): Promise<void> {
    try {
      // Update status to processing
      await this.updateDeletionRequestStatus(request.id, 'processing');

      if (request.deletionType === 'hard') {
        await this.performHardDeletion(request.userId);
      } else {
        await this.performSoftDeletion(request.userId);
      }

      // Update request status
      await this.updateDeletionRequestStatus(request.id, 'completed');

      logger.info('Data deletion completed', {
        requestId: request.id,
        type: request.deletionType,
      });
    } catch (error) {
      logger.error('Data deletion processing failed', {
        error,
        requestId: request.id,
      });
      await this.updateDeletionRequestStatus(request.id, 'failed');
    }
  }

  /**
   * Collect all user data for export
   */
  private async collectUserData(userId: string): Promise<any> {
    if (!this.supabase) {
      return { error: 'Database not available' };
    }

    try {
      // Collect from all relevant tables
      const [
        { data: profile },
        { data: portfolios },
        { data: aiRequests },
        { data: subscriptions },
        { data: consent },
        { data: auditLogs },
      ] = await Promise.all([
        this.supabase.from('user_profiles').select('*').eq('user_id', userId),
        this.supabase.from('portfolios').select('*').eq('user_id', userId),
        this.supabase.from('ai_requests').select('*').eq('user_id', userId),
        this.supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId),
        this.supabase.from('user_consent').select('*').eq('user_id', userId),
        this.supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', userId)
          .limit(1000),
      ]);

      return {
        profile: profile || [],
        portfolios: portfolios || [],
        aiRequests: aiRequests || [],
        subscriptions: subscriptions || [],
        consent: consent || [],
        auditLogs: auditLogs || [],
      };
    } catch (error) {
      logger.error('Failed to collect user data', { error, userId });
      throw error;
    }
  }

  /**
   * Generate export file and return download URL
   */
  private generateExportFile(data: any): string {
    // In production, this would:
    // 1. Upload to secure cloud storage (S3, etc.)
    // 2. Generate a signed URL with expiration
    // 3. Return the download URL

    // For now, return a placeholder URL
    return `https://export.example.com/${data.requestId}.json`;
  }

  /**
   * Perform soft deletion (mark as deleted, retain for compliance)
   */
  private async performSoftDeletion(userId: string): Promise<void> {
    if (!this.supabase) return;

    const deletedAt = new Date().toISOString();

    // Soft delete from main tables
    await Promise.all([
      this.supabase
        .from('user_profiles')
        .update({ deleted_at: deletedAt, status: 'deleted' })
        .eq('user_id', userId),
      this.supabase
        .from('portfolios')
        .update({ deleted_at: deletedAt, status: 'deleted' })
        .eq('user_id', userId),
    ]);
  }

  /**
   * Perform hard deletion (permanent removal)
   */
  private async performHardDeletion(userId: string): Promise<void> {
    if (!this.supabase) return;

    // Hard delete from all tables (except audit logs for compliance)
    await Promise.all([
      this.supabase.from('user_profiles').delete().eq('user_id', userId),
      this.supabase.from('portfolios').delete().eq('user_id', userId),
      this.supabase.from('ai_requests').delete().eq('user_id', userId),
      this.supabase.from('user_consent').delete().eq('user_id', userId),
      this.supabase
        .from('user_privacy_settings')
        .delete()
        .eq('user_id', userId),
    ]);
  }

  // Helper methods
  private async getCachedConsent(
    userId: string
  ): Promise<Record<ConsentType, ConsentRecord | null> | null> {
    try {
      const cacheKey = `consent:${userId}:all`;
      const cached = await redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (_error) {
      return null;
    }
  }

  private async cacheConsent(
    userId: string,
    consent: Record<ConsentType, ConsentRecord | null>
  ): Promise<void> {
    try {
      const cacheKey = `consent:${userId}:all`;
      await redis.setex(cacheKey, 86400, JSON.stringify(consent));
    } catch (_error) {
      // Ignore cache errors
    }
  }

  private getDefaultConsent(): Record<ConsentType, ConsentRecord | null> {
    return {
      marketing: null,
      analytics: null,
      essential: null,
      performance: null,
      targeting: null,
      ai_processing: null,
      data_sharing: null,
    };
  }

  private getDefaultPrivacySettings(userId: string): PrivacySettings {
    return {
      userId,
      profileVisibility: 'public',
      analyticsEnabled: true,
      marketingEnabled: false,
      dataProcessingEnabled: true,
      thirdPartySharing: false,
      dataRetentionPeriod: 1095, // 3 years
      updatedAt: new Date(),
    };
  }

  private async updateExportRequestStatus(
    requestId: string,
    status: DataExportRequest['status'],
    downloadUrl?: string
  ): Promise<void> {
    if (!this.supabase) return;

    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
      if (downloadUrl) {
        updateData.download_url = downloadUrl;
      }
    }

    await this.supabase
      .from('data_export_requests')
      .update(updateData)
      .eq('id', requestId);
  }

  private async updateDeletionRequestStatus(
    requestId: string,
    status: DataDeletionRequest['status']
  ): Promise<void> {
    if (!this.supabase) return;

    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
    }

    await this.supabase
      .from('data_deletion_requests')
      .update(updateData)
      .eq('id', requestId);
  }
}

/**
 * Singleton instance
 */
export const gdprService = new GDPRService();
