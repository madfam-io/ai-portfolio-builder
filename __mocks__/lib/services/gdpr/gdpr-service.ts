/**
 * Mock GDPR Service for testing
 */

export const mockGDPRService = {
  recordConsent: jest.fn().mockResolvedValue({
    id: 'consent_123',
    userId: 'user_123',
    consentType: 'analytics',
    granted: true,
    timestamp: new Date(),
  }),

  requestDataExport: jest.fn().mockResolvedValue({
    id: 'export_123',
    userId: 'user_123',
    status: 'processing',
    requestedAt: new Date(),
  }),

  requestDataDeletion: jest.fn().mockResolvedValue({
    id: 'deletion_123',
    userId: 'user_123',
    status: 'scheduled',
    requestedAt: new Date(),
    scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  }),

  getUserConsents: jest.fn().mockResolvedValue([
    {
      consentType: 'analytics',
      granted: true,
      timestamp: new Date(),
    },
    {
      consentType: 'marketing',
      granted: false,
      timestamp: new Date(),
    },
  ]),

  updateConsent: jest.fn().mockResolvedValue({
    success: true,
    consentType: 'analytics',
    granted: true,
  }),
};

export const recordConsent = mockGDPRService.recordConsent;
export const requestDataExport = mockGDPRService.requestDataExport;
export const requestDataDeletion = mockGDPRService.requestDataDeletion;
export const getUserConsents = mockGDPRService.getUserConsents;
export const updateConsent = mockGDPRService.updateConsent;

export default mockGDPRService;
