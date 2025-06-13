// Mock implementations for services
export const mockPortfolioService = {
  getPortfolios: jest.fn().mockResolvedValue([]),
  getPortfolioById: jest.fn().mockResolvedValue(null),
  createPortfolio: jest.fn().mockResolvedValue({ id: 'new-id' }),
  updatePortfolio: jest.fn().mockResolvedValue({ id: 'updated-id' }),
  deletePortfolio: jest.fn().mockResolvedValue(true),
  publishPortfolio: jest.fn().mockResolvedValue({ subdomain: 'test' }),
};

export const mockPortfolioRepository = {
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({ id: 'new-id' }),
  update: jest.fn().mockResolvedValue({ id: 'updated-id' }),
  delete: jest.fn().mockResolvedValue(true),
};

export const mockFeatureFlagService = {
  isEnabled: jest.fn().mockReturnValue(true),
  getVariant: jest.fn().mockReturnValue('control'),
  getAllFlags: jest.fn().mockReturnValue({}),
};

export const mockLazyLoader = {
  load: jest.fn().mockResolvedValue({ default: () => null }),
};
