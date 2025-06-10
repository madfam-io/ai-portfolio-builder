import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { portfolioService } from '@/lib/services/portfolioService';
import { Portfolio } from '@/types/portfolio';

// Mock the portfolio service
jest.mock('@/lib/services/portfolioService');

const mockPortfolioService = portfolioService as jest.Mocked<typeof portfolioService>;

const mockPortfolio: Portfolio = {
  id: 'test-portfolio-1',
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Test Title',
  bio: 'Test bio',
  contact: { email: 'test@example.com' },
  social: {},
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  template: 'developer',
  customization: {},
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with undefined lastSaved', () => {
    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, false)
    );

    expect(result.current.lastSaved).toBeUndefined();
  });

  it('should provide autoSave function', () => {
    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, false)
    );

    expect(typeof result.current.autoSave).toBe('function');
  });

  it('should call portfolioService.autoSave when autoSave is called', async () => {
    mockPortfolioService.autoSave.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, true)
    );

    await act(async () => {
      const success = await result.current.autoSave(mockPortfolio);
      expect(success).toBe(true);
    });

    expect(mockPortfolioService.autoSave).toHaveBeenCalledWith('portfolio-1', {
      name: mockPortfolio.name,
      title: mockPortfolio.title,
      bio: mockPortfolio.bio,
      tagline: mockPortfolio.tagline,
      avatarUrl: mockPortfolio.avatarUrl,
      contact: mockPortfolio.contact,
      social: mockPortfolio.social,
      experience: mockPortfolio.experience,
      education: mockPortfolio.education,
      projects: mockPortfolio.projects,
      skills: mockPortfolio.skills,
      certifications: mockPortfolio.certifications,
      customization: mockPortfolio.customization,
      aiSettings: mockPortfolio.aiSettings,
    });
  });

  it('should update lastSaved on successful save', async () => {
    mockPortfolioService.autoSave.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, true)
    );

    await act(async () => {
      await result.current.autoSave(mockPortfolio);
    });

    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('should not update lastSaved on failed save', async () => {
    mockPortfolioService.autoSave.mockResolvedValue(false);

    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, true)
    );

    await act(async () => {
      const success = await result.current.autoSave(mockPortfolio);
      expect(success).toBe(false);
    });

    expect(result.current.lastSaved).toBeUndefined();
  });

  it('should handle save errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPortfolioService.autoSave.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, true)
    );

    await act(async () => {
      const success = await result.current.autoSave(mockPortfolio);
      expect(success).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Auto-save failed:',
      expect.any(Error)
    );
    expect(result.current.lastSaved).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });

  it('should prevent concurrent saves', async () => {
    let resolveFirst: () => void;
    const firstSavePromise = new Promise<boolean>(resolve => {
      resolveFirst = () => resolve(true);
    });

    mockPortfolioService.autoSave
      .mockReturnValueOnce(firstSavePromise)
      .mockResolvedValue(true);

    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, true)
    );

    // Start first save
    const firstSaveResultPromise = act(async () => {
      return result.current.autoSave(mockPortfolio);
    });

    // Try to start second save while first is in progress
    await act(async () => {
      const secondResult = await result.current.autoSave(mockPortfolio);
      expect(secondResult).toBe(false); // Should be rejected
    });

    // Complete first save
    act(() => {
      resolveFirst();
    });

    const firstResult = await firstSaveResultPromise;
    expect(firstResult).toBe(true);

    // Service should only be called once
    expect(mockPortfolioService.autoSave).toHaveBeenCalledTimes(1);
  });

  it('should not save if portfolio has no id', async () => {
    const portfolioWithoutId = { ...mockPortfolio, id: '' };

    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', portfolioWithoutId, true)
    );

    await act(async () => {
      const success = await result.current.autoSave(portfolioWithoutId);
      expect(success).toBe(false);
    });

    expect(mockPortfolioService.autoSave).not.toHaveBeenCalled();
  });

  it('should provide clearAutoSave function', () => {
    const { result } = renderHook(() =>
      useAutoSave('portfolio-1', mockPortfolio, false)
    );

    expect(typeof result.current.clearAutoSave).toBe('function');
  });
});