/**
 * Mock Audit Logger for testing
 */

export const mockAuditLogger = {
  logAction: jest.fn().mockResolvedValue({
    id: 'audit_123',
    timestamp: new Date(),
    action: 'test_action',
    userId: 'user_123',
    success: true,
  }),

  getAuditLogs: jest.fn().mockResolvedValue([
    {
      id: 'audit_123',
      timestamp: new Date(),
      action: 'auth.login',
      userId: 'user_123',
      success: true,
      riskLevel: 'low',
    },
  ]),

  exportAuditLogs: jest.fn().mockResolvedValue(Buffer.from('CSV content')),
};

export const logAction = mockAuditLogger.logAction;
export const getAuditLogs = mockAuditLogger.getAuditLogs;
export const exportAuditLogs = mockAuditLogger.exportAuditLogs;

export default mockAuditLogger;
