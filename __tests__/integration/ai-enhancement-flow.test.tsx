import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import type { Mock, MockedClass } from 'jest-mock';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Portfolio } from '@/types/portfolio';



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

jest.mock('@/lib/ai/huggingface-service', () => ({
jest.mock('@/lib/supabase/client', () => ({

jest.setTimeout(30000);

// Mock HuggingFace service
const mockHuggingFaceService = {
  healthCheck: jest.fn().mockResolvedValue(true),
  enhanceBio: jest.fn().mockResolvedValue({
    enhancedBio: 'Enhanced bio',
    wordCount: 10,
    tone: 'professional',
  }),
  optimizeProject: jest.fn().mockResolvedValue({
    optimizedTitle: 'Optimized Title',
    optimizedDescription: 'Optimized description',
  }),
  getAvailableModels: jest.fn().mockResolvedValue([
    { id: 'model-1', name: 'Model 1' },
    { id: 'model-2', name: 'Model 2' },
  ]),
};

  HuggingFaceService: jest.fn().mockImplementation(() => mockHuggingFaceService),
}));

// Mock Supabase client

  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));

// Mock HuggingFace service

  HuggingFaceService: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue(true),
    enhanceBio: jest.fn().mockResolvedValue({
      enhancedBio: 'Enhanced professional bio',
      wordCount: 10,
      tone: 'professional',
    }),
    optimizeProject: jest.fn().mockResolvedValue({
      optimizedTitle: 'Optimized Title',
      optimizedDescription: 'Optimized description',
    }),
  })),
}));

/**
 * @jest-environment jsdom
 */

// Mock fetch for API calls
global.fetch = jest.fn().mockReturnValue(void 0);

// Mock AI Enhancement Flow component
const MockAIEnhancementFlow = () => {
  const [portfolio, setPortfolio] = React.useState<Partial<Portfolio>>({
    name: 'John Doe',
    title: 'Software Developer',
    bio: 'I am a developer',
    skills: [{ name: 'React', level: 'Intermediate' }],
    projects: [
      {
        id: '1',
        title: 'Basic App',
        description: 'A simple app',
        technologies: ['React'],
      },
    ],
  });

  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [enhancementStep, setEnhancementStep] = React.useState<
    'bio' | 'projects' | 'complete' | null
  >(null);
  const [enhancementResults, setEnhancementResults] = React.useState<any>({});

  const handleEnhanceAll = async () => {
    setIsEnhancing(true);
    setEnhancementStep('bio');

    try {
      // Enhance bio
      const bioResponse = await fetch('/api/v1/ai/enhance-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: portfolio.bio,
          context: {
            title: portfolio.title,
            skills:
              portfolio.skills?.map(s =>
                typeof s === 'string' ? s : s.name
              ) || [],
          },
        }),
      });

      if (bioResponse.ok) {
        const bioData = await bioResponse.json();
        setEnhancementResults(prev => ({ ...prev, bio: bioData.enhancedBio }));

        // Transition to projects phase
        setEnhancementStep('projects');

        // Small delay to ensure state update
        await new Promise(resolve => setTimeout(resolve, 0));

        // Enhance projects
        for (const project of portfolio.projects || []) {
          const projectResponse = await fetch('/api/v1/ai/optimize-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: project.title,
              description: project.description,
              technologies: project.technologies,
            }),
          });

          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            setEnhancementResults(prev => ({
              ...prev,
              projects: [
                ...(prev.projects || []),
                projectData.optimizedProject,
              ],
            }));
          }
        }

        setEnhancementStep('complete');
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyEnhancements = () => {
    setPortfolio(prev => ({
      ...prev,
      bio: enhancementResults.bio || prev.bio,
      projects: enhancementResults.projects || prev.projects,
    }));
    setEnhancementStep(null);
    setEnhancementResults({});
  };

  const handleRejectEnhancements = () => {
    setEnhancementStep(null);
    setEnhancementResults({});
  };

  return (
    <div data-testid="ai-enhancement-flow">
      <div data-testid="portfolio-content">
        <h2>{portfolio.name}</h2>
        <h3>{portfolio.title}</h3>
        <p data-testid="current-bio">{portfolio.bio}</p>

        <div data-testid="current-projects">
          {portfolio.projects?.map(project => (
            <div key={project.id} data-testid={`project-${project.id}`}>
              <h4>{project.title}</h4>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div data-testid="enhancement-controls">
        <button
          data-testid="enhance-all-btn"
          onClick={handleEnhanceAll}
          disabled={isEnhancing}
        >
          {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
        </button>

        {enhancementStep && (
          <div data-testid="enhancement-progress">
            <div data-testid="progress-indicator">Step: {enhancementStep}</div>

            {enhancementStep === 'bio' && (
              <div data-testid="bio-enhancement">Enhancing bio...</div>
            )}

            {enhancementStep === 'projects' && (
              <div data-testid="projects-enhancement">
                Enhancing projects...
              </div>
            )}

            {enhancementStep === 'complete' && (
              <div data-testid="enhancement-results">
                <h3>Enhancement Complete!</h3>

                {enhancementResults.bio && (
                  <div data-testid="enhanced-bio">
                    <h4>Enhanced Bio:</h4>
                    <p>{enhancementResults.bio}</p>
                  </div>
                )}

                {enhancementResults.projects && (
                  <div data-testid="enhanced-projects">
                    <h4>Enhanced Projects:</h4>
                    {enhancementResults.projects.map(
                      (project: any, index: number) => (
                        <div
                          key={index}
                          data-testid={`enhanced-project-${index}`}
                        >
                          <h5>{project.title}</h5>
                          <p>{project.description}</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div data-testid="enhancement-actions">
                  <button
                    data-testid="apply-enhancements-btn"
                    onClick={handleApplyEnhancements}
                  >
                    Apply Enhancements
                  </button>
                  <button
                    data-testid="reject-enhancements-btn"
                    onClick={handleRejectEnhancements}
                  >
                    Keep Original
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

};

describe('AI Enhancement Flow Integration', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Enhancement Trigger', () => {
    it('should render initial portfolio content', async () => {
      render(<MockAIEnhancementFlow />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByTestId('current-bio')).toHaveTextContent(
        'I am a developer'
      );
      expect(screen.getByText('Basic App')).toBeInTheDocument();
    });

    it('should show enhance button', async () => {
      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      expect(enhanceButton).toBeInTheDocument();
      expect(enhanceButton).toHaveTextContent('Enhance with AI');
      expect(enhanceButton).not.toBeDisabled();
    });

    it('should disable button and show loading state when enhancement starts', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      expect(enhanceButton).toBeDisabled();
      expect(enhanceButton).toHaveTextContent('Enhancing...');
      expect(screen.getByTestId('enhancement-progress')).toBeInTheDocument();
    });
  });

  describe('Bio Enhancement Flow', () => {
    it('should make bio enhancement API call with correct data', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            enhancedBio:
              'I am a passionate software developer with expertise in modern web technologies.',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            optimizedProject: {
              id: '1',
              title: 'Advanced React Application',
              description:
                'A sophisticated web application built with React, featuring modern UI/UX patterns.',
              technologies: ['React', 'TypeScript', 'Redux'],
            },
          }),
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/ai/enhance-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bio: 'I am a developer',
            context: {
              title: 'Software Developer',
              skills: ['React'],
            },
          }),
        });
      });
    });

    it('should show bio enhancement progress', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 50))

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      expect(screen.getByTestId('bio-enhancement')).toBeInTheDocument();
      expect(screen.getByText('Enhancing bio...')).toBeInTheDocument();
      expect(screen.getByTestId('progress-indicator')).toHaveTextContent(
        'Step: bio'

    });
  });

  describe('Project Enhancement Flow', () => {
    it('should enhance projects after bio enhancement', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            enhancedBio: 'Enhanced bio content',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            optimizedProject: {
              id: '1',
              title: 'Advanced React Application',
              description: 'A sophisticated web application built with React.',
              technologies: ['React', 'TypeScript'],
            },
          }),
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(screen.getByTestId('projects-enhancement')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/ai/optimize-project',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Basic App',
              description: 'A simple app',
              technologies: ['React'],
            }),
          }

      });
    });

    it('should show project enhancement progress', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ enhancedBio: 'Enhanced bio' }),
        })
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 50))

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(screen.getByTestId('projects-enhancement')).toBeInTheDocument();
        expect(screen.getByText('Enhancing projects...')).toBeInTheDocument();
      });
    });
  });

  describe('Enhancement Results Display', () => {
    it('should display enhancement results when complete', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            enhancedBio:
              'I am a passionate software developer with expertise in modern web technologies and a track record of building scalable applications.',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            optimizedProject: {
              id: '1',
              title: 'Advanced React Application',
              description:
                'A sophisticated, responsive web application built with React and TypeScript, featuring modern UI/UX patterns, state management with Redux, and comprehensive testing coverage.',
              technologies: ['React', 'TypeScript', 'Redux', 'Jest'],
            },
          }),
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(screen.getByTestId('enhancement-results')).toBeInTheDocument();
      });

      expect(screen.getByText('Enhancement Complete!')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-bio')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-projects')).toBeInTheDocument();

      // Check enhanced content
      expect(
        screen.getByText(/passionate software developer/)
      ).toBeInTheDocument();
      expect(
        screen.getByText('Advanced React Application')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/sophisticated, responsive web application/)
      ).toBeInTheDocument();
    });

    it('should show apply and reject buttons for enhancements', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ enhancedBio: 'Enhanced bio' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            optimizedProject: {
              id: '1',
              title: 'Enhanced Project',
              description: 'Enhanced description',
              technologies: ['React'],
            },
          }),
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(screen.getByTestId('enhancement-actions')).toBeInTheDocument();
      });

      expect(screen.getByTestId('apply-enhancements-btn')).toBeInTheDocument();
      expect(screen.getByTestId('reject-enhancements-btn')).toBeInTheDocument();
    });
  });

  describe('Enhancement Application', () => {
    it('should apply enhancements to portfolio when accepted', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            enhancedBio: 'Enhanced professional bio',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            optimizedProject: {
              id: '1',
              title: 'Enhanced Project Title',
              description: 'Enhanced project description',
              technologies: ['React', 'TypeScript'],
            },
          }),
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('apply-enhancements-btn')
        ).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('apply-enhancements-btn');
      fireEvent.click(applyButton);

      // Check that original content is updated
      expect(screen.getByTestId('current-bio')).toHaveTextContent(
        'Enhanced professional bio'

      expect(screen.getByText('Enhanced Project Title')).toBeInTheDocument();

      // Enhancement UI should be hidden
      expect(
        screen.queryByTestId('enhancement-results')
      ).not.toBeInTheDocument();
    });

    it('should keep original content when enhancements are rejected', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ enhancedBio: 'Enhanced bio' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            optimizedProject: {
              id: '1',
              title: 'Enhanced Project',
              description: 'Enhanced description',
              technologies: ['React'],
            },
          }),
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('reject-enhancements-btn')
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByTestId('reject-enhancements-btn');
      fireEvent.click(rejectButton);

      // Original content should remain
      expect(screen.getByTestId('current-bio')).toHaveTextContent(
        'I am a developer'
      );
      expect(screen.getByText('Basic App')).toBeInTheDocument();

      // Enhancement UI should be hidden
      expect(
        screen.queryByTestId('enhancement-results')
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle bio enhancement API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Bio enhancement failed')

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(enhanceButton).not.toBeDisabled();
      });

      // Should not show enhancement results
      expect(
        screen.queryByTestId('enhancement-results')
      ).not.toBeInTheDocument();
    });

    it('should handle project enhancement API errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ enhancedBio: 'Enhanced bio' }),
        })
        .mockRejectedValueOnce(new Error('Project enhancement failed'));

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(enhanceButton).not.toBeDisabled();
      });

      // Should still show what was successfully enhanced
      expect(
        screen.queryByTestId('enhancement-results')
      ).not.toBeInTheDocument();
    });

    it('should handle partial enhancement failures gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ enhancedBio: 'Enhanced bio' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(enhanceButton).not.toBeDisabled();
      });

      // Should handle gracefully without breaking the UI
      expect(screen.getByTestId('ai-enhancement-flow')).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should show progress through enhancement steps', async () => {
      (global.fetch as jest.Mock)
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ enhancedBio: 'Enhanced bio' }),
                  }),
                50
              )
            )
        )
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({
                      optimizedProject: {
                        id: '1',
                        title: 'Enhanced Project',
                        description: 'Enhanced description',
                        technologies: ['React'],
                      },
                    }),
                  }),
                50
              )
            )

      render(<MockAIEnhancementFlow />);

      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      // Should show bio enhancement first
      expect(screen.getByTestId('progress-indicator')).toHaveTextContent(
        'Step: bio'

      await waitFor(() => {
        expect(screen.getByTestId('progress-indicator')).toHaveTextContent(
          'Step: projects'

      });

      await waitFor(() => {
        expect(screen.getByTestId('progress-indicator')).toHaveTextContent(
          'Step: complete'

      });
    });

    it('should allow re-enhancement after applying or rejecting', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ enhancedBio: 'Enhanced bio' }),
      });

      render(<MockAIEnhancementFlow />);

      // First enhancement
      const enhanceButton = screen.getByTestId('enhance-all-btn');
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('apply-enhancements-btn')
        ).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('apply-enhancements-btn');
      fireEvent.click(applyButton);

      // Should be able to enhance again
      expect(screen.getByTestId('enhance-all-btn')).toBeInTheDocument();
      expect(screen.getByTestId('enhance-all-btn')).not.toBeDisabled();
    });
  });
});