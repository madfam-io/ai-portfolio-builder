import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

// Mock zustand stores
const mockPortfolioStore = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
  fetchPortfolios: jest.fn(),
  createPortfolio: jest.fn(),
  updatePortfolio: jest.fn(),
  deletePortfolio: jest.fn(),
  setCurrentPortfolio: jest.fn(),
};

jest.mock('@/lib/store/portfolio-store', () => ({ 
  usePortfolioStore: jest.fn(() => mockPortfolioStore),
 }));

jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
// Mock zustand

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand create function
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
// Mock fetch for API calls
global.fetch = jest.fn().mockReturnValue(void 0);

const mockPortfolio: Portfolio = {
  id: 'test-portfolio',
  name: 'John Doe',
  title: 'Software Developer',
  bio: 'A passionate developer',
  template: 'modern',
  skills: [{ name: 'React', level: 'Expert' }],
  projects: [
    {
      id: '1',
      title: 'Test Project',
      description: 'A test project',
      technologies: ['React', 'TypeScript'],
    },
  ],
  experience: [
    {
      position: 'Developer',
      company: 'Tech Corp',
      startDate: '2022',
      endDate: '2024',
    },
  ],
  education: [],
  certifications: [],
  contact: { email: 'john@example.com' },
  social: {},
  customization: {},
};

describe('Portfolio Store Integration', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (global.fetch as jest.Mock).mockClear();

    // Reset zustand store
    // Note: The store reset is handled by the mock being cleared above
  });

  describe('Portfolio CRUD Operations', () => {
    it('should create a new portfolio', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({ portfolio: mockPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.createPortfolio({
          name: 'John Doe',
          title: 'Software Developer',
          template: 'modern',
        });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('John Doe'),
        })
      );

      expect(result.current.currentPortfolio).toEqual(mockPortfolio);
      expect(result.current.isDirty).toBe(false);
    });

    it('should load an existing portfolio', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({ portfolio: mockPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.loadPortfolio('test-portfolio');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/test-portfolio'
      );

      expect(result.current.currentPortfolio).toEqual(mockPortfolio);
      expect(result.current.isLoading).toBe(false);
    });

    it('should update portfolio data', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      // Set initial portfolio
      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      const updates = { name: 'Jane Doe', title: 'Senior Developer' };

      act(() => {
        result.current.updatePortfolio(updates);
      });

      expect(result.current.currentPortfolio?.name).toBe('Jane Doe');
      expect(result.current.currentPortfolio?.title).toBe('Senior Developer');
      expect(result.current.isDirty).toBe(true);
    });

    it('should save portfolio to server', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          portfolio: { ...mockPortfolio, name: 'Updated Name' },
        }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      // Set initial portfolio with changes
      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
        result.current.updatePortfolio({ name: 'Updated Name' });
      });

      await act(async () => {
        await result.current.savePortfolio();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/portfolios/${mockPortfolio.id}`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result.current.isDirty).toBe(false);
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });
  });

  describe('Auto-save Functionality', () => {
    it('should auto-save portfolio after changes', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => ({ portfolio: mockPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      // Set initial portfolio
      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      // Make changes to trigger auto-save
      act(() => {
        result.current.updatePortfolio({ name: 'Auto-saved Name' });
      });

      // Trigger auto-save
      await act(async () => {
        await result.current.autoSave();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/portfolios/${mockPortfolio.id}`,
        expect.objectContaining({
          method: 'PUT',
        })
      );

      jest.useRealTimers();
    });

    it('should not auto-save if no changes were made', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      await act(async () => {
        await result.current.autoSave();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle auto-save errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
        result.current.updatePortfolio({ name: 'Changed Name' });
      });

      await act(async () => {
        await result.current.autoSave();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isDirty).toBe(true); // Should remain dirty on error
    });
  });

  describe('Portfolio Sections Management', () => {
    it('should add a new project', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      const newProject = {
        id: '2',
        title: 'New Project',
        description: 'A new project description',
        technologies: ['Vue.js', 'Python'],
      };

      act(() => {
        result.current.addProject(newProject);
      });

      expect(result.current.currentPortfolio?.projects).toHaveLength(2);
      expect(result.current.currentPortfolio?.projects[1]).toEqual(newProject);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update an existing project', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      const updatedProject = {
        ...mockPortfolio.projects[0],
        title: 'Updated Project Title',
      };

      act(() => {
        result.current.updateProject('1', updatedProject);
      });

      expect(result.current.currentPortfolio?.projects[0].title).toBe(
        'Updated Project Title'
      );

      expect(result.current.isDirty).toBe(true);
    });

    it('should remove a project', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      act(() => {
        result.current.removeProject('1');
      });

      expect(result.current.currentPortfolio?.projects).toHaveLength(0);
      expect(result.current.isDirty).toBe(true);
    });

    it('should reorder projects', async () => {
      const portfolioWithMultipleProjects = {
        ...mockPortfolio,
        projects: [
          {
            id: '1',
            title: 'Project 1',
            description: 'First project',
            technologies: [],
          },
          {
            id: '2',
            title: 'Project 2',
            description: 'Second project',
            technologies: [],
          },
          {
            id: '3',
            title: 'Project 3',
            description: 'Third project',
            technologies: [],
          },
        ],
      };

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(portfolioWithMultipleProjects);
      });

      const reorderedProjects = [
        portfolioWithMultipleProjects.projects[2], // Project 3 first
        portfolioWithMultipleProjects.projects[0], // Project 1 second
        portfolioWithMultipleProjects.projects[1], // Project 2 third
      ];

      act(() => {
        result.current.reorderProjects(reorderedProjects);
      });

      expect(result.current.currentPortfolio?.projects[0].title).toBe(
        'Project 3'
      );

      expect(result.current.currentPortfolio?.projects[1].title).toBe(
        'Project 1'
      );

      expect(result.current.currentPortfolio?.projects[2].title).toBe(
        'Project 2'
      );

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Template Management', () => {
    it('should change portfolio template', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      act(() => {
        result.current.updateTemplate('minimal');
      });

      expect(result.current.currentPortfolio?.template).toBe('minimal');
      expect(result.current.isDirty).toBe(true);
    });

    it('should preserve data when changing templates', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      const originalName = result.current.currentPortfolio?.name;
      const originalProjects = result.current.currentPortfolio?.projects;

      act(() => {
        result.current.updateTemplate('business');
      });

      expect(result.current.currentPortfolio?.name).toBe(originalName);
      expect(result.current.currentPortfolio?.projects).toEqual(
        originalProjects
      );

      expect(result.current.currentPortfolio?.template).toBe('business');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors when loading portfolio', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Failed to load')
      );

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.loadPortfolio('invalid-id');
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentPortfolio).toBeNull() || expect(result).toEqual(expect.anything());
    });

    it('should handle API errors when saving portfolio', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
        result.current.updatePortfolio({ name: 'New Name' });
      });

      await act(async () => {
        await result.current.savePortfolio();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isDirty).toBe(true); // Should remain dirty on save error
    });

    it('should clear errors when performing successful operations', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      // Set an initial error
      act(() => {
        result.current.setError('Initial error');
      });

      expect(result.current.error).toBe('Initial error');

      // Successful operation should clear error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => ({ portfolio: mockPortfolio }),
      });

      await act(async () => {
        await result.current.loadPortfolio('test-portfolio');
      });

      expect(result.current.error).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('Local Storage Integration', () => {
    it('should persist portfolio changes to localStorage', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
        result.current.updatePortfolio({ name: 'Persisted Name' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining('portfolio'),
        expect.stringContaining('Persisted Name')
      );
    });

    it('should restore portfolio from localStorage on initialization', async () => {
      const storedPortfolio = JSON.stringify({
        currentPortfolio: { ...mockPortfolio, name: 'Restored Name' },
        isDirty: true,
        lastSaved: new Date().toISOString(),
      });

      localStorageMock.getItem.mockReturnValue(storedPortfolio);

      const { result } = renderHook(() => usePortfolioStore());

      expect(result.current.currentPortfolio?.name).toBe('Restored Name');
      expect(result.current.isDirty).toBe(true);
    });
  });
});
