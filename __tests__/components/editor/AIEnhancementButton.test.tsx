import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AIEnhancementButton,
  ModelSelectionModal,
} from '@/components/editor/AIEnhancementButton';
import { aiClient } from '@/lib/ai/client';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { showToast } from '@/lib/utils/toast';
import { logger } from '@/lib/utils/logger';


// Mock dependencies
jest.mock('@/lib/ai/client');
jest.mock('@/lib/i18n/refactored-context');
jest.mock('@/lib/utils/toast');
jest.mock('@/lib/utils/logger');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader: ({ className }: any) => <span className={className}>Loading...</span>,
  Sparkles: ({ className }: any) => <span className={className}>Sparkles</span>,
}));

describe('AIEnhancementButton', () => {
  const mockT = {
    enhanceBioWithAI: 'Enhance bio with AI',
    enhanceProjectWithAI: 'Enhance project with AI',
    enhance: 'Enhance',
    enhancing: 'Enhancing...',
    enhanced: 'Enhanced!',
    aiEnhancementFailed: 'AI enhancement failed',
    aiEnhancementRequiresAuth: 'Authentication required for AI enhancement',
    aiQuotaExceeded: 'AI quota exceeded',
  };

  const mockOnEnhanced = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({ t: mockT });
    (logger.error as jest.Mock).mockImplementation(() => {});
    (showToast.error as jest.Mock).mockImplementation(() => {});
  });

  describe('Bio Enhancement', () => {
    const bioContext = {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'senior' as const,
    };

    it('should render bio enhancement button', () => {
      render(
        <AIEnhancementButton
          type="bio"
          content="Original bio content"
          context={bioContext}
          onEnhanced={mockOnEnhanced}
        />

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', mockT.enhanceBioWithAI);
      expect(screen.getByText(mockT.enhance)).toBeInTheDocument();
    });

    it('should disable button when content is empty', () => {
      render(
        <AIEnhancementButton
          type="bio"
          content=""
          context={bioContext}
          onEnhanced={mockOnEnhanced}
        />

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should disable button when disabled prop is true', () => {
      render(
        <AIEnhancementButton
          type="bio"
          content="Bio content"
          context={bioContext}
          onEnhanced={mockOnEnhanced}
          disabled={true}
        />

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should enhance bio successfully', async () => {
      const mockEnhancedContent = {
        content: 'Enhanced bio with improved clarity',
        suggestions: ['Add specific achievements', 'Include metrics'],
      };

      (aiClient.enhanceBio as jest.Mock).mockResolvedValue(mockEnhancedContent);

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="bio"
          content="Original bio"
          context={bioContext}
          onEnhanced={mockOnEnhanced}
        />

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show loading state
      expect(screen.getByText(mockT.enhancing)).toBeInTheDocument();
      expect(button).toBeDisabled();

      // Wait for enhancement to complete
      await waitFor(() => {
        expect(aiClient.enhanceBio).toHaveBeenCalledWith(
          'Original bio',
          bioContext

        expect(mockOnEnhanced).toHaveBeenCalledWith(
          mockEnhancedContent.content,
          mockEnhancedContent.suggestions

      });

      // Should show enhanced state
      expect(screen.getByText(mockT.enhanced)).toBeInTheDocument();
    });

    it('should handle enhancement error', async () => {
      (aiClient.enhanceBio as jest.Mock).mockRejectedValue(
        new Error('Enhancement failed')

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="bio"
          content="Original bio"
          context={bioContext}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(
          'AI enhancement failed',
          expect.objectContaining({
            error: 'Enhancement failed',
            type: 'bio',
            content: 'Original bio',
          })

        expect(showToast.error).toHaveBeenCalledWith(mockT.aiEnhancementFailed);
      });

      // Button should be enabled again
      expect(screen.getByRole('button')).toBeEnabled();
      expect(screen.getByText(mockT.enhance)).toBeInTheDocument();
    });

    it('should handle authentication error', async () => {
      (aiClient.enhanceBio as jest.Mock).mockRejectedValue(
        new Error('Authentication required')

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="bio"
          content="Original bio"
          context={bioContext}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(showToast.error).toHaveBeenCalledWith(
          mockT.aiEnhancementRequiresAuth

      });
    });

    it('should handle quota exceeded error', async () => {
      (aiClient.enhanceBio as jest.Mock).mockRejectedValue(
        new Error('Quota exceeded')

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="bio"
          content="Original bio"
          context={bioContext}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(showToast.error).toHaveBeenCalledWith(mockT.aiQuotaExceeded);
      });
    });
  });

  describe('Project Enhancement', () => {
    const projectContext = {
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform',
      technologies: ['React', 'Node.js', 'MongoDB'],
    };

    it('should render project enhancement button', () => {
      render(
        <AIEnhancementButton
          type="project"
          content="Project description"
          context={projectContext}
          onEnhanced={mockOnEnhanced}
        />

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', mockT.enhanceProjectWithAI);
    });

    it('should enhance project successfully', async () => {
      const mockEnhancedContent = {
        enhanced: 'Enhanced project description with metrics',
        keyAchievements: [
          'Increased performance by 50%',
          'Reduced costs by 30%',
        ],
      };

      (aiClient.optimizeProject as jest.Mock).mockResolvedValue(
        mockEnhancedContent

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="project"
          content="Original description"
          context={projectContext}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(aiClient.optimizeProject).toHaveBeenCalledWith(
          projectContext.description,
          projectContext.technologies,
          projectContext.title

        expect(mockOnEnhanced).toHaveBeenCalledWith(
          mockEnhancedContent.enhanced,
          mockEnhancedContent.keyAchievements

      });
    });

    it('should use content when context description is missing', async () => {
      const mockEnhancedContent = {
        enhanced: 'Enhanced content',
        keyAchievements: [],
      };

      (aiClient.optimizeProject as jest.Mock).mockResolvedValue(
        mockEnhancedContent

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="project"
          content="Fallback description"
          context={{ technologies: ['React'] }}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(aiClient.optimizeProject).toHaveBeenCalledWith(
          'Fallback description',
          ['React'],
          undefined

      });
    });
  });

  describe('Visual States', () => {
    it('should show loading state during enhancement', async () => {
      (aiClient.enhanceBio as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves

      const user = userEvent.setup();
      render(
        <AIEnhancementButton
          type="bio"
          content="Bio content"
          context={{ title: 'Developer', skills: [] }}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Loading...')).toHaveClass('animate-spin');
      expect(screen.getByText(mockT.enhancing)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <AIEnhancementButton
          type="bio"
          content="Bio content"
          context={{ title: 'Developer', skills: [] }}
          onEnhanced={mockOnEnhanced}
          className="custom-class"
        />

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should show enhanced state with green styling', async () => {
      (aiClient.enhanceBio as jest.Mock).mockResolvedValue({
        content: 'Enhanced content',
        suggestions: [],
      });

      const user = userEvent.setup();
      const { rerender } = render(
        <AIEnhancementButton
          type="bio"
          content="Original content"
          context={{ title: 'Developer', skills: [] }}
          onEnhanced={mockOnEnhanced}
        />

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnEnhanced).toHaveBeenCalled();
      });

      // Re-render with the enhanced content to show the enhanced state
      rerender(
        <AIEnhancementButton
          type="bio"
          content="Enhanced content"
          context={{ title: 'Developer', skills: [] }}
          onEnhanced={mockOnEnhanced}
        />

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-100', 'text-green-700');
      expect(screen.getByText(mockT.enhanced)).toBeInTheDocument();
    });
  });
});

describe('ModelSelectionModal', () => {
  const mockT = {
    selectModelFor: 'Select Model for',
    recommended: 'Recommended',
    close: 'Close',
  };

  const mockOnClose = jest.fn();
  const mockOnModelChange = jest.fn();

  const mockModels = [
    {
      id: 'model-1',
      name: 'Fast Model',
      capabilities: ['bio', 'project'],
      costPerRequest: 0.001,
      avgResponseTime: 1000,
      qualityRating: 0.85,
      isRecommended: true,
    },
    {
      id: 'model-2',
      name: 'Quality Model',
      capabilities: ['bio', 'project', 'template'],
      costPerRequest: 0.005,
      avgResponseTime: 3000,
      qualityRating: 0.95,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({ t: mockT });
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  it('should not render when closed', () => {
    render(
      <ModelSelectionModal
        isOpen={false}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    expect(screen.queryByText(mockT.selectModelFor)).not.toBeInTheDocument();
  });

  it('should render modal when open', () => {
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    expect(screen.getByText(`${mockT.selectModelFor} bio`)).toBeInTheDocument();
  });

  it('should load and display available models', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for models to load
    await waitFor(() => {
      expect(aiClient.getAvailableModels).toHaveBeenCalled();
      expect(screen.getByText('Fast Model')).toBeInTheDocument();
      expect(screen.getByText('Quality Model')).toBeInTheDocument();
    });

    // Should show recommended badge
    expect(screen.getByText(mockT.recommended)).toBeInTheDocument();

    // Should show model details
    expect(screen.getByText('$0.0010/request')).toBeInTheDocument();
    expect(screen.getByText('1.0s avg')).toBeInTheDocument();
    expect(screen.getByText('85% quality')).toBeInTheDocument();
  });

  it('should filter models by capability', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockResolvedValue([
      ...mockModels,
      {
        id: 'model-3',
        name: 'Template Only Model',
        capabilities: ['template'],
        costPerRequest: 0.002,
        avgResponseTime: 2000,
        qualityRating: 0.9,
      },
    ]);

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await waitFor(() => {
      expect(screen.getByText('Fast Model')).toBeInTheDocument();
      expect(screen.getByText('Quality Model')).toBeInTheDocument();
      expect(screen.queryByText('Template Only Model')).not.toBeInTheDocument();
    });
  });

  it('should highlight current model', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await waitFor(() => {
      const selectedModel = screen
        .getByText('Fast Model')
        .closest('div')?.parentElement;
      expect(selectedModel).toHaveClass('border-blue-500', 'bg-blue-50');
    });
  });

  it('should select new model and close', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);
    (aiClient.updateModelSelection as jest.Mock).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await waitFor(() => {
      expect(screen.getByText('Quality Model')).toBeInTheDocument();
    });

    const qualityModel = screen
      .getByText('Quality Model')
      .closest('div')?.parentElement;
    await user.click(qualityModel!);

    await waitFor(() => {
      expect(aiClient.updateModelSelection).toHaveBeenCalledWith(
        'bio',
        'model-2'

      expect(mockOnModelChange).toHaveBeenCalledWith('model-2');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle model selection error', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);
    (aiClient.updateModelSelection as jest.Mock).mockRejectedValue(
      new Error('Update failed')

    const user = userEvent.setup();
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await waitFor(() => {
      expect(screen.getByText('Quality Model')).toBeInTheDocument();
    });

    await user.click(
      screen.getByText('Quality Model').closest('div')?.parentElement!

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to update AI model selection',
        expect.any(Error)

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('should close modal with close button', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    const user = userEvent.setup();
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await waitFor(() => {
      expect(screen.getByText(mockT.close)).toBeInTheDocument();
    });

    await user.click(screen.getByText(mockT.close));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal with X button', async () => {
    const user = userEvent.setup();
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await user.click(screen.getByText('×'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle loading error', async () => {
    (aiClient.getAvailableModels as jest.Mock).mockRejectedValue(
      new Error('Failed to load models')

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="bio"
        currentModel="model-1"
        onModelChange={mockOnModelChange}
      />

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load AI models',
        expect.any(Error)

    });
  });
});
