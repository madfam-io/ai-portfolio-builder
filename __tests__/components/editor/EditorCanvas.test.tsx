/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('EditorCanvas', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Software Developer',
    tagline: 'Building amazing web applications',
    bio: 'Experienced developer with passion for creating user-friendly applications.',
    contact: { email: 'test@example.com' },
    social: {},
    experience: [],
    education: [],
    projects: [
      {
        id: 'project-1',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce application built with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'],
        link: 'https://github.com/user/ecommerce',
      },
    ],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnDataChange = jest.fn();

  const mockTranslations = {
    editingPortfolio: 'Editing Portfolio',
    heroSection: 'Hero Section',
    headline: 'Headline',
    enterHeadline: 'Enter your headline',
    tagline: 'Tagline',
    enterTagline: 'A short, memorable tagline',
    aboutSection: 'About Section',
    aboutMe: 'About Me',
    tellAboutYourself: 'Tell us about yourself...',
    projectsSection: 'Projects',
    addProject: '+ Add Project',
    addNewProject: 'Add New Project',
    projectTitle: 'Project Title',
    enterProjectTitle: 'Enter project title',
    projectDescription: 'Description',
    describeProject: 'Describe your project...',
    projectLink: 'Project Link (optional)',
    cancel: 'Cancel',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
    } as any);
  });

  const renderEditorCanvas = (portfolio = mockPortfolio) => {
    return render(
      <EditorCanvas
        portfolio={portfolio}
        onDataChange={mockOnDataChange}
      />
    );
  };

  describe('Initial Rendering', () => {
    it('should render the main editor canvas', () => {
      renderEditorCanvas();

      expect(screen.getByText('Editing Portfolio: Test Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
      expect(screen.getByText('About Section')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should render hero section fields with current values', () => {
      renderEditorCanvas();

      const headlineInput = screen.getByDisplayValue('Software Developer');
      const taglineInput = screen.getByDisplayValue('Building amazing web applications');

      expect(headlineInput).toBeInTheDocument();
      expect(taglineInput).toBeInTheDocument();
    });

    it('should render about section with bio content', () => {
      renderEditorCanvas();

      const bioTextarea = screen.getByDisplayValue(
        'Experienced developer with passion for creating user-friendly applications.'
      );
      expect(bioTextarea).toBeInTheDocument();
    });

    it('should render existing projects', () => {
      renderEditorCanvas();

      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(screen.getByText(/Full-stack e-commerce application/)).toBeInTheDocument();
    });

    it('should render add project button', () => {
      renderEditorCanvas();

      expect(screen.getByText('+ Add Project')).toBeInTheDocument();
    });
  });

  describe('Hero Section Editing', () => {
    it('should update headline when input changes', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const headlineInput = screen.getByDisplayValue('Software Developer');
      
      await user.clear(headlineInput);
      await user.type(headlineInput, 'Full Stack Developer');

      expect(mockOnDataChange).toHaveBeenLastCalledWith({
        title: 'Full Stack Developer',
      });
    });

    it('should update tagline when input changes', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const taglineInput = screen.getByDisplayValue('Building amazing web applications');
      
      await user.clear(taglineInput);
      await user.type(taglineInput, 'Creating innovative solutions');

      expect(mockOnDataChange).toHaveBeenLastCalledWith({
        tagline: 'Creating innovative solutions',
      });
    });

    it('should handle empty headline input', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const headlineInput = screen.getByDisplayValue('Software Developer');
      
      await user.clear(headlineInput);

      expect(mockOnDataChange).toHaveBeenCalledWith({
        title: '',
      });
    });
  });

  describe('About Section Editing', () => {
    it('should update bio when textarea changes', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const bioTextarea = screen.getByDisplayValue(/Experienced developer/);
      
      await user.clear(bioTextarea);
      await user.type(bioTextarea, 'New bio content');

      expect(mockOnDataChange).toHaveBeenLastCalledWith({
        bio: 'New bio content',
      });
    });

    it('should handle multiline bio content', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const bioTextarea = screen.getByDisplayValue(/Experienced developer/);
      
      await user.clear(bioTextarea);
      await user.type(bioTextarea, 'Line 1{enter}Line 2{enter}Line 3');

      expect(mockOnDataChange).toHaveBeenLastCalledWith({
        bio: 'Line 1\nLine 2\nLine 3',
      });
    });
  });

  describe('Projects Section', () => {
    it('should display existing projects correctly', () => {
      renderEditorCanvas();

      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(screen.getByText(/Full-stack e-commerce application/)).toBeInTheDocument();
    });

    it('should open project modal when add button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const addButton = screen.getByText('+ Add Project');
      await user.click(addButton);

      expect(screen.getByText('Add New Project')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter project title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe your project...')).toBeInTheDocument();
    });

    it('should close project modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      // Open modal
      const addButton = screen.getByText('+ Add Project');
      await user.click(addButton);

      // Close modal
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Add New Project')).not.toBeInTheDocument();
    });

    it('should handle portfolio with no projects', () => {
      const emptyPortfolio = { ...mockPortfolio, projects: [] };
      renderEditorCanvas(emptyPortfolio);

      expect(screen.getByText('+ Add Project')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
    });
  });

  describe('Add Project Modal', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderEditorCanvas();
      
      const addButton = screen.getByText('+ Add Project');
      await user.click(addButton);
    });

    it('should render all project form fields', () => {
      expect(screen.getByPlaceholderText('Enter project title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe your project...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
    });

    it('should update project title input', async () => {
      const user = userEvent.setup();
      
      const titleInput = screen.getByPlaceholderText('Enter project title');
      await user.type(titleInput, 'New Project');

      expect(titleInput).toHaveValue('New Project');
    });

    it('should update project description textarea', async () => {
      const user = userEvent.setup();
      
      const descriptionTextarea = screen.getByPlaceholderText('Describe your project...');
      await user.type(descriptionTextarea, 'This is a new project description');

      expect(descriptionTextarea).toHaveValue('This is a new project description');
    });

    it('should update project link input', async () => {
      const user = userEvent.setup();
      
      const linkInput = screen.getByPlaceholderText('https://...');
      await user.type(linkInput, 'https://github.com/user/project');

      expect(linkInput).toHaveValue('https://github.com/user/project');
    });

    it('should disable add button when required fields are empty', () => {
      const addButton = screen.getByRole('button', { name: /Add Project/ });
      expect(addButton).toBeDisabled();
    });

    it('should enable add button when required fields are filled', async () => {
      const user = userEvent.setup();
      
      const titleInput = screen.getByPlaceholderText('Enter project title');
      const descriptionTextarea = screen.getByPlaceholderText('Describe your project...');
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionTextarea, 'Test Description');

      const addButton = screen.getByRole('button', { name: /Add Project/ });
      expect(addButton).toBeEnabled();
    });

    it('should add project when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      
      const titleInput = screen.getByPlaceholderText('Enter project title');
      const descriptionTextarea = screen.getByPlaceholderText('Describe your project...');
      const linkInput = screen.getByPlaceholderText('https://...');
      
      await user.type(titleInput, 'New Test Project');
      await user.type(descriptionTextarea, 'A comprehensive test project');
      await user.type(linkInput, 'https://example.com');

      const addButton = screen.getByRole('button', { name: /Add Project/ });
      await user.click(addButton);

      expect(mockOnDataChange).toHaveBeenCalledWith({
        projects: [
          ...mockPortfolio.projects,
          {
            id: expect.stringMatching(/^project-\d+$/),
            title: 'New Test Project',
            description: 'A comprehensive test project',
            technologies: [],
            link: 'https://example.com',
          },
        ],
      });
    });

    it('should close modal after successful project addition', async () => {
      const user = userEvent.setup();
      
      const titleInput = screen.getByPlaceholderText('Enter project title');
      const descriptionTextarea = screen.getByPlaceholderText('Describe your project...');
      
      await user.type(titleInput, 'New Project');
      await user.type(descriptionTextarea, 'Description');

      const addButton = screen.getByRole('button', { name: /Add Project/ });
      await user.click(addButton);

      expect(screen.queryByText('Add New Project')).not.toBeInTheDocument();
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      
      // Fill and submit form
      const titleInput = screen.getByPlaceholderText('Enter project title');
      const descriptionTextarea = screen.getByPlaceholderText('Describe your project...');
      
      await user.type(titleInput, 'Project 1');
      await user.type(descriptionTextarea, 'Description 1');

      const addButton = screen.getByRole('button', { name: /Add Project/ });
      await user.click(addButton);

      // Open modal again
      const addProjectButton = screen.getByText('+ Add Project');
      await user.click(addProjectButton);

      // Check form is cleared
      const newTitleInput = screen.getByPlaceholderText('Enter project title');
      const newDescriptionTextarea = screen.getByPlaceholderText('Describe your project...');
      
      expect(newTitleInput).toHaveValue('');
      expect(newDescriptionTextarea).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderEditorCanvas();

      expect(screen.getByLabelText('Headline')).toBeInTheDocument();
      expect(screen.getByLabelText('Tagline')).toBeInTheDocument();
      expect(screen.getByLabelText('About Me')).toBeInTheDocument();
    });

    it('should have proper modal accessibility', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const addButton = screen.getByText('+ Add Project');
      await user.click(addButton);

      // Modal should be focusable
      const modal = screen.getByRole('dialog', { hidden: true }) || screen.getByText('Add New Project').closest('div');
      expect(modal).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderEditorCanvas();

      const headlineInput = screen.getByDisplayValue('Software Developer');
      const taglineInput = screen.getByDisplayValue('Building amazing web applications');

      // Tab navigation
      headlineInput.focus();
      fireEvent.keyDown(headlineInput, { key: 'Tab' });
      
      expect(document.activeElement).toBe(taglineInput);
    });
  });

  describe('Edge Cases', () => {
    it('should handle portfolio with missing optional fields', () => {
      const minimalPortfolio = {
        ...mockPortfolio,
        title: '',
        tagline: '',
        bio: '',
        projects: [],
      };

      renderEditorCanvas(minimalPortfolio);

      expect(screen.getByPlaceholderText('Enter your headline')).toHaveValue('');
      expect(screen.getByPlaceholderText('A short, memorable tagline')).toHaveValue('');
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toHaveValue('');
    });

    it('should handle extremely long text input', () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const longText = 'A'.repeat(100); // Reduced for test performance
      const bioTextarea = screen.getByDisplayValue(/Experienced developer/);
      
      await user.clear(bioTextarea);
      await user.type(bioTextarea, longText);

      expect(mockOnDataChange).toHaveBeenLastCalledWith({
        bio: longText,
      });
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const specialText = 'Special chars: !@#$%^&*()_+-=';
      const headlineInput = screen.getByDisplayValue('Software Developer');
      
      await user.clear(headlineInput);
      await user.type(headlineInput, specialText);

      expect(mockOnDataChange).toHaveBeenLastCalledWith({
        title: specialText,
      });
    });

    it('should handle rapid successive changes', async () => {
      const user = userEvent.setup();
      renderEditorCanvas();

      const headlineInput = screen.getByDisplayValue('Software Developer');
      
      // Rapid changes
      await user.clear(headlineInput);
      await user.type(headlineInput, 'Dev');
      await user.type(headlineInput, 'eloper');
      await user.type(headlineInput, ' & Designer');

      // Should have called onDataChange multiple times
      expect(mockOnDataChange).toHaveBeenCalled();
      expect(mockOnDataChange.mock.calls.length).toBeGreaterThan(5);
    });
  });

  describe('Internationalization', () => {
    it('should use translated text from language hook', () => {
      renderEditorCanvas();

      expect(screen.getByText('Editing Portfolio: Test Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
      expect(screen.getByText('About Section')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your headline')).toBeInTheDocument();
    });

    it('should fallback gracefully when translations are missing', () => {
      mockUseLanguage.mockReturnValue({
        t: {},
      } as any);

      renderEditorCanvas();

      // Should still render without translations (using fallbacks)
      expect(screen.getByText('Editing: Test Portfolio')).toBeInTheDocument();
    });
  });
});