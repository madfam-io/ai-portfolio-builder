// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioEditor from '@/components/editor/PortfolioEditor';
import { Portfolio, TemplateType } from '@/types/portfolio';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { portfolioService } from '@/lib/services/portfolioService';

// Mock the language context
jest.mock('@/lib/i18n/refactored-context');

// Mock the portfolio service
jest.mock('@/lib/services/portfolioService', () => ({
  portfolioService: {
    getPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    publishPortfolio: jest.fn(),
    unpublishPortfolio: jest.fn(),
    autoSave: jest.fn(),
    updateTemplate: jest.fn(),
  },
}));

// Mock the custom hooks
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn(value => value),
}));

jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: jest.fn(() => ({
    autoSave: jest.fn(),
    lastSaved: new Date(),
  })),
}));

jest.mock('@/hooks/useEditorHistory', () => ({
  useEditorHistory: jest.fn(() => ({
    pushToHistory: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: false,
    canRedo: false,
  })),
}));

// Mock portfolio data
const mockPortfolio: Portfolio = {
  id: '1',
  userId: 'user-1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with a passion for creating scalable applications.',
  tagline: 'Building the future, one line at a time',
  avatarUrl: '/avatar.jpg',
  contact: {
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    availability: 'Available for freelance',
  },
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01',
      current: true,
      description: 'Leading development of cloud-native applications',
      highlights: ['Led team of 5 developers', 'Increased performance by 40%'],
      technologies: ['React', 'Node.js', 'AWS'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      current: false,
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce solution',
      technologies: ['React', 'Node.js', 'MongoDB'],
      highlights: ['100k+ active users', 'Real-time inventory'],
      featured: true,
      order: 1,
    },
  ],
  skills: [
    { name: 'JavaScript', level: 'expert', category: 'Programming' },
    { name: 'React', level: 'advanced', category: 'Frontend' },
    { name: 'Node.js', level: 'advanced', category: 'Backend' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2022-01',
      credentialId: 'ABC123',
    },
  ],
  template: 'developer' as TemplateType,
  customization: {
    primaryColor: '#1a73e8',
    fontFamily: 'Inter',
  },
  status: 'draft',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockTranslations = {
  portfolioEditor: 'Portfolio Editor',
  preview: 'Preview',
  save: 'Save',
  publish: 'Publish',
  basicInfo: 'Basic Information',
  name: 'Name',
  title: 'Title',
  bio: 'Bio',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  addExperience: 'Add Experience',
  addEducation: 'Add Education',
  addProject: 'Add Project',
  template: 'Template',
  customize: 'Customize',
  enhanceWithAI: 'Enhance with AI',
  saving: 'Saving...',
  saved: 'Saved',
  publishPortfolio: 'Publish Portfolio',
  unpublish: 'Unpublish',
  deleteItem: 'Delete',
  editItem: 'Edit',
};

describe.skip('PortfolioEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnPublish = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({
      t: mockTranslations,
      language: 'en',
    });

    // Mock portfolio service methods
    (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(
      mockPortfolio
    );
    (portfolioService.updatePortfolio as jest.Mock).mockResolvedValue(
      mockPortfolio
    );
    (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue({
      ...mockPortfolio,
      status: 'published',
    });
    (portfolioService.autoSave as jest.Mock).mockResolvedValue(true);
  });

  describe('Rendering', () => {
    it('should render the portfolio editor with all sections', async () => {
      render(
        <PortfolioEditor
          portfolioId="1"
          userId="user-1"
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      // Wait for portfolio to load
      await waitFor(() => {
        expect(portfolioService.getPortfolio).toHaveBeenCalledWith('1');
      });

      // Check main sections in the sidebar
      await waitFor(() => {
        expect(screen.getByText('Edit Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
        expect(screen.getByText('Experience')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Skills')).toBeInTheDocument();
      });
    });

    it('should display portfolio data in form fields', () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Full Stack Developer')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Experienced developer with a passion for creating scalable applications.'
        )
      ).toBeInTheDocument();
    });

    it('should show preview pane', () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      expect(screen.getByText('Preview')).toBeInTheDocument();
      // Preview should show the portfolio content
      expect(
        screen.getByText('John Doe', { selector: '.preview-name' })
      ).toBeInTheDocument();
    });
  });

  describe('Basic Information Editing', () => {
    it('should update name field', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const nameInput = screen.getByLabelText('Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Smith');

      expect(nameInput).toHaveValue('Jane Smith');
    });

    it('should update bio with character count', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const bioTextarea = screen.getByLabelText('Bio');
      await user.clear(bioTextarea);
      await user.type(bioTextarea, 'New bio text');

      expect(bioTextarea).toHaveValue('New bio text');
      expect(screen.getByText('12 / 500')).toBeInTheDocument(); // Character count
    });
  });

  describe('Experience Section', () => {
    it('should display existing experience items', () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    it('should add new experience item', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const addButton = screen.getByText('Add Experience');
      await user.click(addButton);

      // Modal should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Fill in the form
      await user.type(screen.getByLabelText('Company'), 'New Company');
      await user.type(screen.getByLabelText('Position'), 'Developer');
      await user.type(screen.getByLabelText('Start Date'), '2023-01');

      // Save
      await user.click(screen.getByText('Add'));

      // Should see the new item
      await waitFor(() => {
        expect(screen.getByText('New Company')).toBeInTheDocument();
      });
    });

    it('should delete experience item', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const deleteButton = screen.getByLabelText('Delete experience item');
      await user.click(deleteButton);

      // Confirm deletion
      await user.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument();
      });
    });
  });

  describe('Projects Section', () => {
    it('should reorder projects', async () => {
      const multipleProjects = {
        ...mockPortfolio,
        projects: [
          ...mockPortfolio.projects,
          {
            id: 'proj-2',
            title: 'Mobile App',
            description: 'Native mobile application',
            technologies: ['React Native'],
            highlights: [],
            featured: false,
            order: 2,
          },
        ],
      };

      render(
        <PortfolioEditor
          portfolio={multipleProjects}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      // Implement drag and drop test
      const firstProject = screen.getByText('E-commerce Platform');
      const secondProject = screen.getByText('Mobile App');

      // Simulate drag and drop (simplified for testing)
      fireEvent.dragStart(firstProject);
      fireEvent.dragOver(secondProject);
      fireEvent.drop(secondProject);

      // Order should be swapped
      const projects = screen.getAllByTestId('project-item');
      expect(projects[0]).toHaveTextContent('Mobile App');
      expect(projects[1]).toHaveTextContent('E-commerce Platform');
    });

    it('should mark project as featured', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const featuredToggle = screen.getByLabelText('Mark as featured');
      await user.click(featuredToggle);

      expect(featuredToggle).toBeChecked();
    });
  });

  describe('Skills Management', () => {
    it('should add new skill', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const skillInput = screen.getByPlaceholderText('Add a skill');
      await user.type(skillInput, 'Python{enter}');

      await waitFor(() => {
        expect(screen.getByText('Python')).toBeInTheDocument();
      });
    });

    it('should remove skill', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const removeButton = screen.getByLabelText('Remove JavaScript');
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
      });
    });

    it('should categorize skills', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      // Skills should be grouped by category
      expect(screen.getByText('Programming')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });
  });

  describe('Template Customization', () => {
    it('should change template', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const templateSelect = screen.getByLabelText('Template');
      await user.selectOptions(templateSelect, 'designer');

      expect(templateSelect).toHaveValue('designer');
      // Preview should update
      expect(screen.getByTestId('preview-template')).toHaveClass(
        'template-designer'
      );
    });

    it('should customize colors', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const colorPicker = screen.getByLabelText('Primary Color');
      fireEvent.change(colorPicker, { target: { value: '#ff0000' } });

      // Preview should reflect color change
      expect(screen.getByTestId('preview-container')).toHaveStyle({
        '--primary-color': '#ff0000',
      });
    });
  });

  describe('AI Enhancement', () => {
    it('should show AI enhancement button for bio', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const enhanceButton = screen.getByLabelText('Enhance bio with AI');
      expect(enhanceButton).toBeInTheDocument();

      await user.click(enhanceButton);
      expect(screen.getByText('Enhancing...')).toBeInTheDocument();
    });

    it('should show AI suggestions for projects', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const suggestButton = screen.getByLabelText(
        'Get AI suggestions for project'
      );
      await user.click(suggestButton);

      await waitFor(() => {
        expect(screen.getByText('Suggested highlights:')).toBeInTheDocument();
      });
    });
  });

  describe('Save and Publish', () => {
    it('should save portfolio changes', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      // Make a change
      const nameInput = screen.getByLabelText('Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      // Save
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
        })
      );

      // Should show saving state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should publish portfolio', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const publishButton = screen.getByText('Publish');
      await user.click(publishButton);

      // Confirmation dialog
      expect(screen.getByText('Publish Portfolio')).toBeInTheDocument();
      await user.click(screen.getByText('Confirm'));

      expect(mockOnPublish).toHaveBeenCalled();
    });

    it('should auto-save after changes', async () => {
      jest.useFakeTimers();

      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
          autoSave={true}
        />
      );

      // Make a change
      const bioTextarea = screen.getByLabelText('Bio');
      await user.type(bioTextarea, ' Additional text');

      // Fast-forward time
      jest.advanceTimersByTime(3000); // 3 second debounce

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Real-time Preview', () => {
    it('should update preview as user types', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const nameInput = screen.getByLabelText('Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Live Update');

      // Preview should update immediately
      const previewName = screen.getByTestId('preview-name');
      expect(previewName).toHaveTextContent('Live Update');
    });

    it('should toggle preview visibility', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const toggleButton = screen.getByLabelText('Toggle preview');
      const preview = screen.getByTestId('preview-pane');

      expect(preview).toBeVisible();

      await user.click(toggleButton);
      expect(preview).not.toBeVisible();

      await user.click(toggleButton);
      expect(preview).toBeVisible();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      // Clear required field
      const nameInput = screen.getByLabelText('Name');
      await user.clear(nameInput);

      // Try to save
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should validate URLs', async () => {
      render(
        <PortfolioEditor
          portfolio={mockPortfolio}
          onSave={mockOnSave}
          onPublish={mockOnPublish}
        />
      );

      const linkedinInput = screen.getByLabelText('LinkedIn URL');
      await user.clear(linkedinInput);
      await user.type(linkedinInput, 'not-a-url');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });
  });
});
