import { jest, , describe, it, expect, beforeEach } from '@jest/globals';
      const { gdprService } = await import('@/lib/services/gdpr/gdpr-service');
    const { gdprService } = await import('@/lib/services/gdpr/gdpr-service');
/**
 * Test suite for GDPR Service

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

jest.mock('@/lib/auth/supabase-client', () => ({ 
  createClient: jest.fn(() => mockSupabaseClient),
  supabase: mockSupabaseClient,
 }));

 * @jest-environment node
 */

// Setup function to configure mocks
const setupMocks = (mockOverrides: any = {}) => {
  jest.resetModules();

  // Default mock values
  const mockSupabase = mockOverrides.supabase || {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };

  const mockRedis = mockOverrides.redis || {
    setex: jest.fn().mockReturnValue(void 0),
    get: jest.fn().mockReturnValue(void 0),
    sismember: jest.fn().mockReturnValue(void 0),
    sadd: jest.fn().mockReturnValue(void 0),
  };

  const mockAuditLogger = mockOverrides.auditLogger || {
    logGDPR: jest.fn().mockReturnValue(void 0),
    logDataAccess: jest.fn().mockReturnValue(void 0),
  };

  // Mock Supabase client
  jest.doMock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase,
  }));

  // Mock Redis
  jest.doMock('@/lib/cache/redis-client', () => ({
    redis: mockRedis,
    isRedisAvailable: () => true,
  }));

  // Mock audit logger
  jest.doMock('@/lib/services/audit/audit-logger', () => ({
    auditLogger: mockAuditLogger,
  }));

  return { mockSupabase, mockRedis, mockAuditLogger };
};

describe('GDPR Service', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Consent Management', () => {
    test('should record consent successfully', async () => {
      const { mockSupabase, mockRedis } = setupMocks();
      mockSupabase.upsert.mockResolvedValue({ error: null });
      mockRedis.setex.mockResolvedValue('OK');

      await gdprService.recordConsent({
        userId: 'user_123',
        consentType: 'marketing',
        granted: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        purpose: 'Marketing communications',
        legalBasis: 'consent',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabase.upsert).toHaveBeenCalledWith({
        user_id: 'user_123',
        consent_type: 'marketing',
        granted: true,
        timestamp: expect.any(String),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        purpose: 'Marketing communications',
        legal_basis: 'consent',
        expiry_date: expect.any(String),
      });
    });

    test('should handle consent recording failure', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.upsert.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(
        gdprService.recordConsent({
          userId: 'user_123',
          consentType: 'marketing',
          granted: true,
          ipAddress: '192.168.1.1',
          purpose: 'Marketing communications',
          legalBasis: 'consent',
        })
      ).rejects.toThrow('Failed to record consent');
    });

    test('should get user consent status', async () => {
      const mockConsentData = [
        {
          user_id: 'user_123',
          consent_type: 'marketing',
          granted: true,
          timestamp: '2025-01-01T00:00:00Z',
          ip_address: '192.168.1.1',
          purpose: 'Marketing communications',
          legal_basis: 'consent',
        },
        {
          user_id: 'user_123',
          consent_type: 'analytics',
          granted: false,
          timestamp: '2025-01-01T00:00:00Z',
          ip_address: '192.168.1.1',
          purpose: 'Analytics tracking',
          legal_basis: 'consent',
        },
      ];

      const { mockSupabase } = setupMocks();
      mockSupabase.select.mockResolvedValue({
        data: mockConsentData,
        error: null,
      });

      const consent = await gdprService.getUserConsent('user_123');

      expect(consent.marketing).toMatchObject({
        userId: 'user_123',
        consentType: 'marketing',
        granted: true,
      });

      expect(consent.analytics).toMatchObject({
        userId: 'user_123',
        consentType: 'analytics',
        granted: false,
      });

      expect(consent.essential).toBeNull();
    });
  });

  describe('Data Export Requests', () => {
    test('should create data export request successfully', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.insert.mockResolvedValue({ error: null });

      const request = await gdprService.requestDataExport(
        'user_123',
        'test@example.com',
        '192.168.1.1'

      expect(request).toMatchObject({
        userId: 'user_123',
        userEmail: 'test@example.com',
        status: 'pending',
        requestIp: '192.168.1.1',
      });

      expect(request.id).toMatch(/^export_/);
      expect(request.expiryDate).toBeInstanceOf(Date);

      expect(mockSupabase.from).toHaveBeenCalledWith('data_export_requests');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        id: request.id,
        user_id: 'user_123',
        user_email: 'test@example.com',
        request_date: expect.any(String),
        status: 'pending',
        request_ip: '192.168.1.1',
        expiry_date: expect.any(String),
      });
    });

    test('should handle export request failure', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.insert.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(
        gdprService.requestDataExport(
          'user_123',
          'test@example.com',
          '192.168.1.1'
        )
      ).rejects.toThrow('Failed to create data export request');
    });
  });

  describe('Data Deletion Requests', () => {
    test('should create data deletion request successfully', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.insert.mockResolvedValue({ error: null });

      const request = await gdprService.requestDataDeletion(
        'user_123',
        'test@example.com',
        '192.168.1.1',
        'soft',
        'User requested account deletion'

      expect(request).toMatchObject({
        userId: 'user_123',
        userEmail: 'test@example.com',
        status: 'pending',
        deletionType: 'soft',
        retentionPeriod: 90,
        reason: 'User requested account deletion',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('data_deletion_requests');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        id: request.id,
        user_id: 'user_123',
        user_email: 'test@example.com',
        request_date: expect.any(String),
        status: 'pending',
        deletion_type: 'soft',
        retention_period: 90,
        request_ip: '192.168.1.1',
        reason: 'User requested account deletion',
      });
    });

    test('should create hard deletion request with zero retention', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.insert.mockResolvedValue({ error: null });

      const request = await gdprService.requestDataDeletion(
        'user_123',
        'test@example.com',
        '192.168.1.1',
        'hard'

      expect(request.deletionType).toBe('hard');
      expect(request.retentionPeriod).toBe(0);
    });
  });

  describe('Privacy Settings', () => {
    test('should get default privacy settings for new user', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' },
      });

      const settings = await gdprService.getPrivacySettings('user_123');

      expect(settings).toMatchObject({
        userId: 'user_123',
        profileVisibility: 'public',
        analyticsEnabled: true,
        marketingEnabled: false,
        dataProcessingEnabled: true,
        thirdPartySharing: false,
        dataRetentionPeriod: 1095, // 3 years
      });
    });

    test('should get existing privacy settings', async () => {
      const mockSettings = {
        user_id: 'user_123',
        profile_visibility: 'private',
        analytics_enabled: false,
        marketing_enabled: true,
        data_processing_enabled: true,
        third_party_sharing: false,
        data_retention_period: 365,
        updated_at: '2025-01-01T00:00:00Z',
      };

      const { mockSupabase } = setupMocks();
      mockSupabase.single.mockResolvedValue({
        data: mockSettings,
        error: null,
      });

      const settings = await gdprService.getPrivacySettings('user_123');

      expect(settings).toMatchObject({
        userId: 'user_123',
        profileVisibility: 'private',
        analyticsEnabled: false,
        marketingEnabled: true,
        dataRetentionPeriod: 365,
      });
    });

    test('should update privacy settings', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.upsert.mockResolvedValue({ error: null });

      // Mock getting current settings
      mockSupabase.single.mockResolvedValue({
        data: {
          user_id: 'user_123',
          profile_visibility: 'public',
          analytics_enabled: true,
          marketing_enabled: false,
          data_processing_enabled: true,
          third_party_sharing: false,
          data_retention_period: 1095,
          updated_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      });

      const updatedSettings = await gdprService.updatePrivacySettings(
        'user_123',
        {
          profileVisibility: 'private',
          marketingEnabled: true,
        },
        '192.168.1.1'

      expect(updatedSettings.profileVisibility).toBe('private');
      expect(updatedSettings.marketingEnabled).toBe(true);
      expect(updatedSettings.analyticsEnabled).toBe(true); // Unchanged

      expect(mockSupabase.upsert).toHaveBeenCalledWith({
        user_id: 'user_123',
        profile_visibility: 'private',
        analytics_enabled: true,
        marketing_enabled: true,
        data_processing_enabled: true,
        third_party_sharing: false,
        data_retention_period: 1095,
        updated_at: expect.any(String),
      });
    });
  });

  describe('Marketing Contact Permission', () => {
    test('should allow marketing contact when consent is granted', async () => {
      const mockConsentData = [
        {
          user_id: 'user_123',
          consent_type: 'marketing',
          granted: true,
          timestamp: '2025-01-01T00:00:00Z',
          expiry_date: '2026-01-01T00:00:00Z', // Future date
          ip_address: '192.168.1.1',
          purpose: 'Marketing communications',
          legal_basis: 'consent',
        },
      ];

      const { mockSupabase } = setupMocks();
      mockSupabase.select.mockResolvedValue({
        data: mockConsentData,
        error: null,
      });

      const canContact = await gdprService.canContactForMarketing('user_123');

      expect(canContact).toBe(true);
    });

    test('should deny marketing contact when consent not granted', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const canContact = await gdprService.canContactForMarketing('user_123');

      expect(canContact).toBe(false);
    });

    test('should deny marketing contact when consent expired', async () => {
      const mockConsentData = [
        {
          user_id: 'user_123',
          consent_type: 'marketing',
          granted: true,
          timestamp: '2025-01-01T00:00:00Z',
          expiry_date: '2024-01-01T00:00:00Z', // Past date
          ip_address: '192.168.1.1',
          purpose: 'Marketing communications',
          legal_basis: 'consent',
        },
      ];

      const { mockSupabase } = setupMocks();
      mockSupabase.select.mockResolvedValue({
        data: mockConsentData,
        error: null,
      });

      const canContact = await gdprService.canContactForMarketing('user_123');

      expect(canContact).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      const { mockSupabase } = setupMocks();
      mockSupabase.select.mockRejectedValue(new Error('Connection failed'));

      const consent = await gdprService.getUserConsent('user_123');

      // Should return default consent structure
      expect(consent).toMatchObject({
        marketing: null,
        analytics: null,
        essential: null,
      });
    });

    test('should handle redis connection errors gracefully', async () => {
      const { mockSupabase, mockRedis } = setupMocks();
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));
      mockSupabase.upsert.mockResolvedValue({ error: null });

      // Should not throw error even if Redis fails
      await expect(
        gdprService.recordConsent({
          userId: 'user_123',
          consentType: 'marketing',
          granted: true,
          ipAddress: '192.168.1.1',
          purpose: 'Marketing communications',
          legalBasis: 'consent',
        })
      ).resolves.toBeUndefined();
    });
  });
});

// Integration tests
describe('GDPR Service Integration', () => {
  test('should handle complete consent lifecycle', async () => {
    const { mockSupabase, mockRedis } = setupMocks();
    // Record initial consent
    mockSupabase.upsert.mockResolvedValue({ error: null });
    mockRedis.setex.mockResolvedValue('OK');

    await gdprService.recordConsent({
      userId: 'user_123',
      consentType: 'marketing',
      granted: true,
      ipAddress: '192.168.1.1',
      purpose: 'Marketing communications',
      legalBasis: 'consent',
    });

    // Check consent status
    mockSupabase.select.mockResolvedValue({
      data: [
        {
          user_id: 'user_123',
          consent_type: 'marketing',
          granted: true,
          timestamp: '2025-01-01T00:00:00Z',
          ip_address: '192.168.1.1',
          purpose: 'Marketing communications',
          legal_basis: 'consent',
        },
      ],
      error: null,
    });

    const consent = await gdprService.getUserConsent('user_123');
    expect(consent.marketing?.granted).toBe(true);

    const canContact = await gdprService.canContactForMarketing('user_123');
    expect(canContact).toBe(true);
  });

  test('should handle complete data export flow', async () => {
    const { mockSupabase } = setupMocks();
    // Create export request
    mockSupabase.insert.mockResolvedValue({ error: null });

    const request = await gdprService.requestDataExport(
      'user_123',
      'test@example.com',
      '192.168.1.1'

    expect(request.status).toBe('pending');

    // Simulate data collection for export
    mockSupabase.select.mockResolvedValue({
      data: [{ id: 1, name: 'Test Portfolio' }],
      error: null,
    });

    // In a real scenario, the async processing would update the request status
    expect(request.id).toMatch(/^export_/);
  });
});
