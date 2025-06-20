import '../../../../setup/api-setup';

// Mock monitoring modules
jest.mock('@/lib/monitoring/health-check', () => ({
  handleHealthCheck: jest.fn().mockResolvedValue({
    status: 200,
    json: jest.fn().mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        cache: 'up',
      },
    }),
  }),
}));

jest.mock('@/lib/monitoring/error-tracking', () => ({
  withErrorTracking: jest.fn((handler) => handler),
}));

jest.mock('@/lib/monitoring/apm', () => ({
  withAPMTracking: jest.fn((handler) => handler),
}));

describe('/api/v1/health', () => {
  it('should return health status', async () => {
    // Import after mocks are set up
    const { GET } = await import('@/app/api/v1/health/route');
    
    const response = await GET();

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });

  it('should handle HEAD requests', async () => {
    const { HEAD } = await import('@/app/api/v1/health/route');
    
    const response = await HEAD();

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});