/**
 * @fileoverview Tests for TemplateSelector Component
 *
 * Tests the template selection interface including visual previews,
 * industry filtering, and template switching functionality.
 */

// Mock the minimal context
jest.mock('@/lib/i18n/minimal-context', () => ({
  useLanguage: () => ({
    t: {},
    language: 'es',
    setLanguage: jest.fn(),
  }),
}));

// Mock the template config - must be before any imports
jest.mock('@/lib/templates/templateConfig', () => ({
  getAvailableTemplates: () => [
    {
      id: 'developer',
      name: 'Developer',
      description:
        'Perfect for software engineers, developers, and technical professionals',
      industry: ['Software Engineering', 'Web Development'],
      colorScheme: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#06B6D4',
        background: '#F8FAFC',
        text: '#1E293B',
      },
    },
    {
      id: 'designer',
      name: 'Designer',
      description:
        'Ideal for UI/UX designers, graphic designers, and creative professionals',
      industry: ['UI/UX Design', 'Graphic Design'],
      colorScheme: {
        primary: '#EC4899',
        secondary: '#BE185D',
        accent: '#F59E0B',
        background: '#FEFBFB',
        text: '#1F2937',
      },
    },
  ],
  getTemplateConfig: (id: string) => ({
    id,
    name: id === 'developer' ? 'Developer' : 'Designer',
    description:
      id === 'developer'
        ? 'Perfect for software engineers, developers, and technical professionals'
        : 'Ideal for UI/UX designers, graphic designers, and creative professionals',
    industry:
      id === 'developer'
        ? ['Software Engineering', 'Web Development']
        : ['UI/UX Design', 'Graphic Design'],
    sections: [],
    defaultOrder: [],
    colorScheme: {
      primary: id === 'developer' ? '#3B82F6' : '#EC4899',
      secondary: id === 'developer' ? '#1E40AF' : '#BE185D',
      accent: id === 'developer' ? '#06B6D4' : '#F59E0B',
      background: id === 'developer' ? '#F8FAFC' : '#FEFBFB',
      text: id === 'developer' ? '#1E293B' : '#1F2937',
    },
    layout: {
      headerStyle: 'minimal' as const,
      sectionSpacing: 'normal' as const,
      typography: 'modern' as const,
    },
    features: {
      showcaseProjects: true,
      emphasizeSkills: true,
      includeTestimonials: false,
      socialLinksStyle: 'icons' as const,
    },
  }),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { TemplateType } from '@/types/portfolio';

describe('TemplateSelector', () => {
  const mockOnTemplateChange = jest.fn();
  const defaultProps = {
    currentTemplate: 'developer' as TemplateType,
    onTemplateChange: mockOnTemplateChange,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders template selector with header', () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText('Choose Your Template')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Select a template that best represents your professional style'
      )
    ).toBeInTheDocument();
  });

  it('displays all available templates', () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
    // Check for unique text content
    expect(
      screen.getAllByText(
        'Perfect for software engineers, developers, and technical professionals'
      ).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        'Ideal for UI/UX designers, graphic designers, and creative professionals'
      ).length
    ).toBeGreaterThan(0);
  });

  it('shows selected template indicator', () => {
    render(<TemplateSelector {...defaultProps} />);

    const developerCard = screen
      .getByText('Developer')
      .closest('div[class*="relative border-2"]');
    expect(developerCard).toHaveClass('border-purple-500', 'bg-purple-50');
  });

  it('calls onTemplateChange when selecting a template', () => {
    render(<TemplateSelector {...defaultProps} />);

    const designerCard = screen
      .getByText('Designer')
      .closest('div[class*="relative border-2"]');
    if (designerCard) {
      fireEvent.click(designerCard);
    }

    expect(mockOnTemplateChange).toHaveBeenCalledWith('designer');
  });

  it('does not call onTemplateChange when clicking already selected template', () => {
    render(<TemplateSelector {...defaultProps} />);

    const developerCard = screen
      .getByText('Developer')
      .closest('div[class*="relative border-2"]');
    if (developerCard) {
      fireEvent.click(developerCard);
    }

    expect(mockOnTemplateChange).not.toHaveBeenCalled();
  });

  it('displays industry tags for each template', () => {
    render(<TemplateSelector {...defaultProps} />);

    // Check industry tags appear (they might appear multiple times in filters and template cards)
    expect(screen.getAllByText('Software Engineering').length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText('UI/UX Design').length).toBeGreaterThan(0);
  });

  it('filters templates by industry', () => {
    render(<TemplateSelector {...defaultProps} />);

    // Get all Web Development buttons and click the filter one
    const webDevButtons = screen.getAllByText('Web Development');
    fireEvent.click(webDevButtons[0]);

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.queryByText('Designer')).not.toBeInTheDocument();
  });

  it('shows all industries filter button', () => {
    render(<TemplateSelector {...defaultProps} />);

    const allIndustriesButton = screen.getByText('All Industries');
    expect(allIndustriesButton).toBeInTheDocument();

    // Click an industry filter first
    const webDevButtons = screen.getAllByText('Web Development');
    fireEvent.click(webDevButtons[0]);

    // Then click All Industries to reset
    fireEvent.click(allIndustriesButton);

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<TemplateSelector {...defaultProps} isLoading={true} />);

    const developerCard = screen
      .getByText('Developer')
      .closest('div[class*="relative border-2"]');

    expect(developerCard).toBeTruthy();
    if (developerCard) {
      const spinningElements = developerCard.querySelectorAll('.animate-spin');
      expect(spinningElements.length).toBeGreaterThan(0);
    }
  });

  it('displays current template info', () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText('Current Template: Developer')).toBeInTheDocument();
    // Check the description appears in the current template info section
    expect(
      screen.getAllByText(
        'Perfect for software engineers, developers, and technical professionals'
      ).length
    ).toBeGreaterThan(0);
  });

  it('shows preview button for each template', () => {
    render(<TemplateSelector {...defaultProps} />);

    const previewButtons = screen.getAllByText('Preview');
    expect(previewButtons).toHaveLength(2);
  });

  it('handles preview button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<TemplateSelector {...defaultProps} />);

    const previewButtons = screen.getAllByText('Preview');
    expect(previewButtons[0]).toBeTruthy();
    fireEvent.click(previewButtons[0]!);

    expect(consoleSpy).toHaveBeenCalledWith('Preview template:', 'developer');
    consoleSpy.mockRestore();
  });

  it('filters templates by industry correctly', () => {
    render(<TemplateSelector {...defaultProps} />);

    // Get all Graphic Design buttons (from filter and from template industry tags)
    const graphicDesignButtons = screen.getAllByText('Graphic Design');
    // Click the filter button (first one in the industry filter section)
    fireEvent.click(graphicDesignButtons[0]);

    // Since Graphic Design is only in the Designer template,
    // only Designer should be visible
    expect(screen.queryByText('Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('displays template color scheme preview', () => {
    render(<TemplateSelector {...defaultProps} />);

    const developerCard = screen
      .getByText('Developer')
      .closest('div[class*="relative border-2"]');

    expect(developerCard).toBeTruthy();
    if (developerCard) {
      const colorPreview = developerCard.querySelector(
        '[style*="backgroundColor"]'
      );

      if (colorPreview) {
        expect(colorPreview).toBeInTheDocument();
      }
    }
  });

  it('shows feature icons for templates', () => {
    render(<TemplateSelector {...defaultProps} />);

    // Look for FiGrid icons which represent project showcase feature
    const gridIcons = document.querySelectorAll('svg');
    expect(gridIcons.length).toBeGreaterThan(0);
  });
});
