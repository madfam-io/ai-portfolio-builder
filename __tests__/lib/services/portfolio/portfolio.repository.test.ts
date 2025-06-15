import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';

const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('PortfolioRepository', () => {
  let repository: PortfolioRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PortfolioRepository();
  });

  describe('findAll', () => {
    it('should return all user portfolios', async () => {
      const mockData = [
        { id: '1', name: 'Portfolio 1' },
        { id: '2', name: 'Portfolio 2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await repository.findAll('user-id');

      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create a new portfolio', async () => {
      const newPortfolio = {
        userId: 'user-id',
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Test bio',
        template: 'developer' as const,
      };

      const created = { 
        id: 'new-id', 
        ...newPortfolio,
        subdomain: 'newportfolio',
        status: 'draft',
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      });

      const result = await repository.create(newPortfolio);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(newPortfolio.name);
    });
  });
});
