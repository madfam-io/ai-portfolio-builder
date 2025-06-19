import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockUseLanguage } from '@/test-utils/mock-i18n';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditorContent } from '@/components/editor/EditorContent';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useUIStore } from '@/lib/store/ui-store';
/**
 * @jest-environment jsdom
 */

import {  
// Mock i18n

// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: mockUseLanguage,
}));

  useLanguage: () => mockUseLanguage(),
}));

describe, test, it, expect, beforeEach, jest  } from '@jest/globals';

// Mock the stores

// Mock useLanguage hook
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: {
      welcomeMessage: 'Welcome',
      heroTitle: 'Create Your Portfolio',
      getStarted: 'Get Started',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      enhanceWithAI: 'Enhance with AI',
      publish: 'Publish',
      preview: 'Preview',
      // Add more translations as needed
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/store/ui-store');

// Mock the template selector
jest.mock('@/components/editor/TemplateSelector', () => ({
  TemplateSelector: () => (
    <div data-testid="template-selector">Template Selector</div>
  ),
}));

// Mock the sections
jest.mock('@/components/editor/sections/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

jest.mock('@/components/editor/sections/ProjectsSection', () => ({
  ProjectsSection: () => (
    <div data-testid="projects-section">Projects Section</div>
  ),
}));

jest.mock('@/components/editor/sections/ExperienceSection', () => ({
  ExperienceSection: () => (
    <div data-testid="experience-section">Experience Section</div>
  ),
}));

jest.mock('@/components/editor/sections/SkillsSection', () => ({
  SkillsSection: () => <div data-testid="skills-section">Skills Section</div>,
}));

jest.mock('@/components/editor/sections/EducationSection', () => ({
  EducationSection: () => (
    <div data-testid="education-section">Education Section</div>
  ),
}));

jest.mock('@/components/editor/sections/CertificationsSection', () => ({
  CertificationsSection: () => (
    <div data-testid="certifications-section">Certifications Section</div>
  ),
}));

jest.mock('@/components/editor/sections/ContactSection', () => ({
  ContactSection: () => (
    <div data-testid="contact-section">Contact Section</div>
  ),
}));

// Mock fetch for AI enhancement
global.fetch = jest.fn();

const mockPortfolioStore = {
  currentPortfolio: {
    id: 'test-portfolio',
    name: 'John Doe',
    title: 'Software Developer',
    bio: 'A passionate developer',
    template: 'modern',
    skills: ['React', 'TypeScript'],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    contact: { email: 'john@example.com' },
    social: {},
  },
  updatePortfolio: jest.fn(),
  autoSave: jest.fn(),
  isLoading: false,
  lastSaved: new Date(),
  isDirty: false,
};

const mockUIStore = {
  deviceMode: 'desktop' as const,
  setDeviceMode: jest.fn(),
  isAIProcessing: false,
  setIsAIProcessing: jest.fn(),
};

describe('EditorContent', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (usePortfolioStore as jest.Mock).mockReturnValue(mockPortfolioStore);
    (useUIStore as jest.Mock).mockReturnValue(mockUIStore);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render the main editor layout', async () => {
      render(<EditorContent />);

      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('projects-section')).toBeInTheDocument();
      expect(screen.getByTestId('experience-section')).toBeInTheDocument();
      expect(screen.getByTestId('skills-section')).toBeInTheDocument();
      expect(screen.getByTestId('education-section')).toBeInTheDocument();
      expect(screen.getByTestId('certifications-section')).toBeInTheDocument();
      expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('should render device mode controls', async () => {
      render(<EditorContent />);

      expect(screen.getByLabelText('Desktop view')).toBeInTheDocument();
      expect(screen.getByLabelText('Tablet view')).toBeInTheDocument();
      expect(screen.getByLabelText('Mobile view')).toBeInTheDocument();
    });

    it('should render AI enhancement button', async () => {
      render(<EditorContent />);

      expect(
        screen.getByRole('button', { name: /enhance with ai/i })
      ).toBeInTheDocument();
    });

    it('should render save status', async () => {
      render(<EditorContent />);

      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });

  describe('Device Mode Switching', () => {
    it('should switch to tablet mode when tablet button is clicked', async () => {
      render(<EditorContent />);

      const tabletButton = screen.getByLabelText('Tablet view');
      fireEvent.click(tabletButton);

      expect(mockUIStore.setDeviceMode).toHaveBeenCalledWith('tablet');
    });

    it('should switch to mobile mode when mobile button is clicked', async () => {
      render(<EditorContent />);

      const mobileButton = screen.getByLabelText('Mobile view');
      fireEvent.click(mobileButton);

      expect(mockUIStore.setDeviceMode).toHaveBeenCalledWith('mobile');
    });

    it('should apply correct viewport classes based on device mode', async () => {
      const { rerender } = render(<EditorContent />);

      // Test desktop mode
      expect(screen.getByTestId('editor-preview')).toHaveClass('w-full');

      // Test tablet mode
      (useUIStore as jest.Mock).mockReturnValue({
        ...mockUIStore,
        deviceMode: 'tablet',
      });
      rerender(<EditorContent />);
      expect(screen.getByTestId('editor-preview')).toHaveClass('max-w-2xl');

      // Test mobile mode
      (useUIStore as jest.Mock).mockReturnValue({
        ...mockUIStore,
        deviceMode: 'mobile',
      });
      rerender(<EditorContent />);
      expect(screen.getByTestId('editor-preview')).toHaveClass('max-w-sm');
    });
  });

  describe('AI Enhancement', () => {
    it('should call AI enhancement API when enhance button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          enhancedBio: 'Enhanced bio content',
          enhancedProjects: [],
        }),
      });

      render(<EditorContent />);

      const enhanceButton = screen.getByRole('button', {
        name: /enhance with ai/i,
      });
      fireEvent.click(enhanceButton);

      expect(mockUIStore.setIsAIProcessing).toHaveBeenCalledWith(true);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/ai/enhance-bio',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('A passionate developer')
  })
};
    });

    it('should show loading state during AI processing', async () => {
      (useUIStore as jest.Mock).mockReturnValue({
        ...mockUIStore,
        isAIProcessing: true,
      });

      render(<EditorContent />);

      const enhanceButton = screen.getByRole('button', { name: /enhancing/i });
      expect(enhanceButton).toBeDisabled();
    });

    it('should handle AI enhancement errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<EditorContent />);

      const enhanceButton = screen.getByRole('button', {
        name: /enhance with ai/i,
      });
      fireEvent.click(enhanceButton);

      await waitFor(() => {
        expect(mockUIStore.setIsAIProcessing).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('should trigger auto-save when portfolio changes', async () => {
      render(<EditorContent />);

      // Simulate portfolio change
      const updatedPortfolio = {
        ...mockPortfolioStore.currentPortfolio,
        name: 'Jane Doe',
      };

      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: updatedPortfolio,
        isDirty: true,
      });

      // Re-render to trigger useEffect
      render(<EditorContent />);

      expect(mockPortfolioStore.autoSave).toHaveBeenCalled();
    });

    it('should show unsaved changes indicator when portfolio is dirty', async () => {
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        isDirty: true,
      });

      render(<EditorContent />);

      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should save portfolio when Ctrl+S is pressed', async () => {
      render(<EditorContent />);

      fireEvent.keyDown(document, {
        key: 's',
        ctrlKey: true,
        preventDefault: jest.fn(),
      });

      expect(mockPortfolioStore.autoSave).toHaveBeenCalled();
    });

    it('should prevent default browser save behavior', async () => {
      render(<EditorContent />);

      const preventDefault = jest.fn();
      fireEvent.keyDown(document, {
        key: 's',
        ctrlKey: true,
        preventDefault,
      });

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing portfolio gracefully', async () => {
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: null,
      });

      render(<EditorContent />);

      expect(screen.getByText(/no portfolio selected/i)).toBeInTheDocument();
    });

    it('should show loading state when portfolio is loading', async () => {
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        isLoading: true,
      });

      render(<EditorContent />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for device mode controls', async () => {
      render(<EditorContent />);

      expect(screen.getByLabelText('Desktop view')).toHaveAttribute(
        'aria-pressed'

      expect(screen.getByLabelText('Tablet view')).toHaveAttribute(
        'aria-pressed'

      expect(screen.getByLabelText('Mobile view')).toHaveAttribute(
        'aria-pressed'

    });

    it('should have proper focus management', async () => {
      render(<EditorContent />);

      const enhanceButton = screen.getByRole('button', {
        name: /enhance with ai/i,
      });
      enhanceButton.focus();

      expect(enhanceButton).toHaveFocus();
    });
  });
});
