import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/experiments/route';
import { authenticateUser, hasPermission } from '@/lib/api/middleware/auth';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

describe('Experiments API Routes', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful authentication by default
    (authenticateUser as jest.Mock).mockResolvedValue(mockUser);
    (hasPermission as jest.Mock).mockReturnValue(true);

    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  describe('GET /api/v1/experiments', () => {
    const mockExperiments = [
      {
        id: 'exp-1',
        name: 'Homepage A/B Test',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        variants: [
          {
            id: 'var-1',
            name: 'Control',
            is_control: true,
            traffic_percentage: 50,
            conversion_rate: 2.5,
            visitor_count: 1000,
            conversion_count: 25,
          },
          {
            id: 'var-2',
            name: 'Variant A',
            is_control: false,
            traffic_percentage: 50,
            conversion_rate: 3.2,
            visitor_count: 1000,
            conversion_count: 32,
          },
        ],
      },
    ];

    it('should return list of experiments successfully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockExperiments,
          error: null,
        }),
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.experiments).toHaveLength(1);
      expect(data.experiments[0]).toMatchObject({
        id: 'exp-1',
        name: 'Homepage A/B Test',
        totalVisitors: 2000,
        totalConversions: 57,
        overallConversionRate: 2.85,
      });
      expect(data.pagination).toEqual({
        limit: 20,
        offset: 0,
        total: 1,
      });
    });

    it('should filter experiments by status', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockQuery.range.mockResolvedValue({
        data: mockExperiments.filter(exp => exp.status === 'active'),
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments?status=active'
      );
      await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should handle pagination parameters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments?limit=10&offset=20'
      );
      await GET(request);

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('should return 401 when not authenticated', async () => {
      (authenticateUser as jest.Mock).mockResolvedValue(null);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments'
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 when lacking permissions', async () => {
      (hasPermission as jest.Mock).mockReturnValue(false);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments'
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it('should handle database connection errors', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Database connection not available');
    });

    it('should handle database query errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch experiments');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle experiments with no variants gracefully', async () => {
      const experimentsNoVariants = [
        {
          id: 'exp-2',
          name: 'Empty Test',
          status: 'draft',
          variants: [],
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: experimentsNoVariants,
          error: null,
        }),
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.experiments[0]).toMatchObject({
        totalVisitors: 0,
        totalConversions: 0,
        overallConversionRate: 0,
      });
    });
  });

  describe('POST /api/v1/experiments', () => {
    const validExperimentData = {
      name: 'New A/B Test',
      description: 'Testing new homepage design',
      hypothesis: 'New design will increase conversions by 20%',
      trafficPercentage: 100,
      targetAudience: { country: ['US', 'CA'] },
      primaryMetric: 'conversion_rate',
      secondaryMetrics: ['bounce_rate', 'time_on_page'],
      variants: [
        {
          name: 'Control',
          description: 'Current homepage',
          isControl: true,
          trafficPercentage: 50,
          components: [
            {
              type: 'hero',
              order: 1,
              visible: true,
              variant: 'default',
              props: { title: 'Welcome' },
            },
          ],
          themeOverrides: {},
        },
        {
          name: 'Variant A',
          description: 'New design',
          isControl: false,
          trafficPercentage: 50,
          components: [
            {
              type: 'hero',
              order: 1,
              visible: true,
              variant: 'modern',
              props: { title: 'Hello' },
            },
          ],
          themeOverrides: { primaryColor: '#0066cc' },
        },
      ],
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-28T23:59:59Z',
    };

    it('should create experiment successfully', async () => {
      const mockExperiment = {
        id: 'exp-new',
        ...validExperimentData,
        status: 'draft',
        created_by: mockUser.id,
      };

      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockExperiment,
          error: null,
        }),
      };

      const mockVariantsInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockExperiment, variants: [] },
          error: null,
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockInsert) // Create experiment
        .mockReturnValueOnce(mockVariantsInsert) // Create variants
        .mockReturnValueOnce(mockSelect); // Fetch complete experiment

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(validExperimentData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.experiment).toBeDefined();
      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validExperimentData.name,
          description: validExperimentData.description,
          created_by: mockUser.id,
        })
      );
    });

    it('should validate traffic percentages sum to 100', async () => {
      const invalidData = {
        ...validExperimentData,
        variants: [
          { ...validExperimentData.variants[0], trafficPercentage: 40 },
          { ...validExperimentData.variants[1], trafficPercentage: 50 },
        ],
      };

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Variant traffic percentages must sum to 100%');
    });

    it('should require at least 2 variants', async () => {
      const invalidData = {
        ...validExperimentData,
        variants: [validExperimentData.variants[0]],
      };

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should rollback experiment on variant creation failure', async () => {
      const mockExperiment = { id: 'exp-rollback' };

      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockExperiment,
          error: null,
        }),
      };

      const mockVariantsInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Variant creation failed'),
        }),
      };

      const mockDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockInsert) // Create experiment
        .mockReturnValueOnce(mockVariantsInsert) // Create variants (fails)
        .mockReturnValueOnce(mockDelete); // Rollback deletion

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(validExperimentData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create experiment variants');
      expect(mockDelete.delete).toHaveBeenCalled();
      expect(mockDelete.eq).toHaveBeenCalledWith('id', 'exp-rollback');
    });

    it('should return 401 when not authenticated', async () => {
      (authenticateUser as jest.Mock).mockResolvedValue(null);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(validExperimentData),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 403 when lacking permissions', async () => {
      (hasPermission as jest.Mock).mockReturnValue(false);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(validExperimentData),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        // Missing required fields
        name: '',
        variants: [],
      };

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/experiments',
        {
          method: 'POST',
          body: JSON.stringify(validExperimentData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Database connection not available');
    });
  });
});
