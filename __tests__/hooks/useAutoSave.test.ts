import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Portfolio } from '@/types/portfolio';

// Mock fetch
global.fetch = jest.fn();

describe('useAutoSave', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    tagline: 'Test tagline',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: { email: 'test@example.com', phone: '123-456-7890', location: 'New York' },
    social: { github: 'https://github.com/test', linkedin: 'https://linkedin.com/in/test' },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    aiSettings: {},
    status: 'draft',
    subdomain: 'test',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with undefined lastSaved', () => {
    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, false)
    );

    expect(result.current.lastSaved).toBeUndefined();
  });

  it('should save portfolio successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, true)
    );

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.autoSave(mockPortfolio);
    });

    expect(saveResult!).toBe(true);
    expect(result.current.lastSaved).toBeInstanceOf(Date);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/portfolio-123',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      }
    );
  });

  it('should handle save failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    });

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, true)
    );

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.autoSave(mockPortfolio);
    });

    expect(saveResult!).toBe(false);
    expect(result.current.lastSaved).toBeUndefined();
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, true)
    );

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.autoSave(mockPortfolio);
    });

    expect(saveResult!).toBe(false);
    expect(result.current.lastSaved).toBeUndefined();
  });

  it('should prevent concurrent saves', async () => {
    let resolveFirst: (value: any) => void;
    const firstCallPromise = new Promise(resolve => {
      resolveFirst = resolve;
    });

    (global.fetch as jest.Mock)
      .mockReturnValueOnce(firstCallPromise)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, true)
    );

    // Start first save (won't complete immediately)
    let firstSavePromise: Promise<boolean>;
    act(() => {
      firstSavePromise = result.current.autoSave(mockPortfolio);
    });

    // Try to start second save while first is in progress
    let secondSaveResult: boolean;
    await act(async () => {
      secondSaveResult = await result.current.autoSave(mockPortfolio);
    });

    // Second save should return false immediately
    expect(secondSaveResult!).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Complete first save
    await act(async () => {
      resolveFirst!({ ok: true, json: async () => ({ success: true }) });
      await firstSavePromise!;
    });
  });

  it('should not save portfolio without ID', async () => {
    const portfolioWithoutId = { ...mockPortfolio, id: '' };

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', portfolioWithoutId, true)
    );

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.autoSave(portfolioWithoutId);
    });

    expect(saveResult!).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should use correct portfolio ID from hook parameter', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => 
      useAutoSave('different-portfolio-456', mockPortfolio, true)
    );

    await act(async () => {
      await result.current.autoSave(mockPortfolio);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/different-portfolio-456',
      expect.any(Object)
    );
  });

  it('should clear timeout on clearAutoSave', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, true)
    );

    act(() => {
      result.current.clearAutoSave();
    });

    // Since we don't have a timeout set in this test, it shouldn't be called
    expect(clearTimeoutSpy).not.toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('should update lastSaved timestamp on successful save', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', mockPortfolio, true)
    );

    const beforeSave = new Date();

    await act(async () => {
      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      await result.current.autoSave(mockPortfolio);
    });

    const afterSave = new Date();

    expect(result.current.lastSaved).toBeDefined();
    expect(result.current.lastSaved!.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
    expect(result.current.lastSaved!.getTime()).toBeLessThanOrEqual(afterSave.getTime());
  });

  it('should handle empty portfolio data gracefully', async () => {
    const emptyPortfolio = {
      ...mockPortfolio,
      contact: {},
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => 
      useAutoSave('portfolio-123', emptyPortfolio, true)
    );

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.autoSave(emptyPortfolio);
    });

    expect(saveResult!).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"experience":[]'),
      })
    );
  });

  it('should maintain autoSave function reference across renders', () => {
    const { result, rerender } = renderHook(
      ({ portfolioId, portfolio, isDirty }) => 
        useAutoSave(portfolioId, portfolio, isDirty),
      {
        initialProps: {
          portfolioId: 'portfolio-123',
          portfolio: mockPortfolio,
          isDirty: false,
        },
      }
    );

    const firstAutoSave = result.current.autoSave;

    // Re-render with same portfolioId
    rerender({
      portfolioId: 'portfolio-123',
      portfolio: { ...mockPortfolio, name: 'Updated Name' },
      isDirty: true,
    });

    expect(result.current.autoSave).toBe(firstAutoSave);

    // Re-render with different portfolioId
    rerender({
      portfolioId: 'portfolio-456',
      portfolio: mockPortfolio,
      isDirty: true,
    });

    expect(result.current.autoSave).not.toBe(firstAutoSave);
  });
});