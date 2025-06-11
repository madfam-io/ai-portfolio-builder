/**
 * Tests for SectionEditor component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SectionEditor from '@/components/editor/SectionEditor';
import DragDropProvider from '@/components/editor/DragDropContext';
import type { Portfolio } from '@/types/portfolio';

// Mock the language context
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => ({
    t: {
      experience: 'Experience',
      education: 'Education',
      projects: 'Projects',
      skills: 'Skills',
      certifications: 'Certifications',
      add: 'Add',
      save: 'Save',
      cancel: 'Cancel',
      present: 'Present',
      gpaLabel: 'GPA',
      expires: 'Expires',
      formImplementation: 'Form implementation for',
    },
    language: 'en',
  }),
}));

// Mock the error boundary
jest.mock('@/components/shared/error-boundaries', () => ({
  WidgetErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock DraggableItem
jest.mock('@/components/editor/DraggableItem', () => ({
  DraggableItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="draggable-item">{children}</div>
  ),
}));

const mockPortfolio: Partial<Portfolio> = {
  experience: [
    {
      id: '1',
      position: 'Software Engineer',
      company: 'Tech Corp',
      startDate: '2020-01',
      endDate: '2023-12',
      description: 'Built amazing software',
      location: 'San Francisco',
    },
  ],
  projects: [
    {
      id: '1',
      title: 'Awesome Project',
      description: 'A really cool project',
      technologies: ['React', 'TypeScript'],
      url: 'https://example.com',
      github: 'https://github.com/example/project',
    },
  ],
  skills: [
    {
      id: '1',
      name: 'JavaScript',
      level: 'advanced',
      category: 'technical',
    },
  ],
};

const mockOnChange = jest.fn();

const renderSectionEditor = (section: any, portfolio = mockPortfolio) => {
  return render(
    <DragDropProvider>
      <SectionEditor
        portfolio={portfolio as Portfolio}
        section={section}
        onChange={mockOnChange}
      />
    </DragDropProvider>
  );
};

describe('SectionEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with error boundary', () => {
      renderSectionEditor('experience');
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should render section title and count', () => {
      renderSectionEditor('experience');
      
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('(1)')).toBeInTheDocument();
    });

    it('should render add button', () => {
      renderSectionEditor('experience');
      
      expect(screen.getByText('Add')).toBeInTheDocument();
    });
  });

  describe('Section Icons', () => {
    it('should render experience icon', () => {
      renderSectionEditor('experience');
      
      const icon = document.querySelector('.lucide-briefcase');
      expect(icon).toBeInTheDocument();
    });

    it('should render education icon', () => {
      renderSectionEditor('education');
      
      const icon = document.querySelector('.lucide-graduation-cap');
      expect(icon).toBeInTheDocument();
    });

    it('should render projects icon', () => {
      renderSectionEditor('projects');
      
      const icon = document.querySelector('.lucide-code');
      expect(icon).toBeInTheDocument();
    });

    it('should render skills icon', () => {
      renderSectionEditor('skills');
      
      const icon = document.querySelector('.lucide-award');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Items Display', () => {
    it('should render experience items', () => {
      renderSectionEditor('experience');
      
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    it('should render project items', () => {
      renderSectionEditor('projects');
      
      expect(screen.getByText('Awesome Project')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('should render skill items', () => {
      renderSectionEditor('skills');
      
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('advanced')).toBeInTheDocument();
    });

    it('should render draggable items', () => {
      renderSectionEditor('experience');
      
      expect(screen.getByTestId('draggable-item')).toBeInTheDocument();
    });
  });

  describe('Adding Items', () => {
    it('should show add form when add button is clicked', () => {
      renderSectionEditor('experience');
      
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Form implementation for experience')).toBeInTheDocument();
    });

    it('should show save and cancel buttons in add form', () => {
      renderSectionEditor('experience');
      
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Empty Sections', () => {
    it('should handle empty sections', () => {
      renderSectionEditor('experience', { experience: [] });
      
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    it('should handle undefined sections', () => {
      renderSectionEditor('experience', {});
      
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });
  });

  describe('Item Actions', () => {
    it('should render edit buttons for items', () => {
      renderSectionEditor('experience');
      
      const editButton = document.querySelector('.lucide-edit-2');
      expect(editButton).toBeInTheDocument();
    });

    it('should render delete buttons for items', () => {
      renderSectionEditor('experience');
      
      const deleteButton = document.querySelector('.lucide-trash-2');
      expect(deleteButton).toBeInTheDocument();
    });
  });
});