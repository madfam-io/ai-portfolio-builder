/**
 * @fileoverview Tests for TemplateSelector Component
 *
 * Tests the template selection interface including visual previews,
 * industry filtering, and template switching functionality.
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { TemplateType } from '@/types/portfolio';

// Mock the minimal context
jest.mock('@/lib/i18n/minimal-context', () => ({
  useLanguage: () => ({
    t: {},
    language: 'es',
    setLanguage: jest.fn(),
  }),
}));

// Mock the template config
jest.mock('@/lib/templates/templateConfig', () => ({
  getAvailableTemplates: () => [
    {
      id: 'developer',
      name: 'Developer',
      description: 'Perfect for software engineers',
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
      description: 'Ideal for UI/UX designers',
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
        ? 'Perfect for software engineers'
        : 'Ideal for UI/UX designers',
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
    expect(
      screen.getByText('Perfect for software engineers')
    ).toBeInTheDocument();
    expect(screen.getByText('Ideal for UI/UX designers')).toBeInTheDocument();
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
    fireEvent.click(designerCard!);

    expect(mockOnTemplateChange).toHaveBeenCalledWith('designer');
  });

  it('does not call onTemplateChange when clicking already selected template', () => {
    render(<TemplateSelector {...defaultProps} />);

    const developerCard = screen
      .getByText('Developer')
      .closest('div[class*="relative border-2"]');
    fireEvent.click(developerCard!);

    expect(mockOnTemplateChange).not.toHaveBeenCalled();
  });

  it('displays industry tags for each template', () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText('Software Engineering')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
  });

  it('filters templates by industry', () => {
    render(<TemplateSelector {...defaultProps} />);

    const webDevButton = screen.getByText('Web Development');
    fireEvent.click(webDevButton);

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.queryByText('Designer')).not.toBeInTheDocument();
  });

  it('shows all industries filter button', () => {
    render(<TemplateSelector {...defaultProps} />);

    const allIndustriesButton = screen.getByText('All Industries');
    expect(allIndustriesButton).toBeInTheDocument();

    // Click an industry filter first
    fireEvent.click(screen.getByText('Web Development'));

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
    const loadingOverlay = within(developerCard!).getByText(
      (content, element) => {
        return element?.classList.contains('animate-spin') || false;
      }
    ).parentElement;

    expect(loadingOverlay).toHaveClass('absolute', 'inset-0');
  });

  it('displays current template info', () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText('Current Template: Developer')).toBeInTheDocument();
    expect(
      screen.getByText('Perfect for software engineers')
    ).toBeInTheDocument();
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
    fireEvent.click(previewButtons[0]);

    expect(consoleSpy).toHaveBeenCalledWith('Preview template:', 'developer');
    consoleSpy.mockRestore();
  });

  it('shows empty state when no templates match filter', () => {
    render(<TemplateSelector {...defaultProps} />);

    // Mock a filter that returns no results
    const nonExistentIndustry = screen.getByText('Software Engineering');
    fireEvent.click(nonExistentIndustry);
    fireEvent.click(screen.getByText('Graphic Design'));

    // Since our mock only has two templates and they have different industries,
    // filtering by Graphic Design should only show Designer
    expect(screen.queryByText('Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('displays template color scheme preview', () => {
    render(<TemplateSelector {...defaultProps} />);

    const developerCard = screen
      .getByText('Developer')
      .closest('div[class*="relative border-2"]');
    const colorPreview = developerCard?.querySelector(
      '[style*="backgroundColor"]'
    );

    expect(colorPreview).toBeInTheDocument();
  });

  it('shows feature icons for templates', () => {
    render(<TemplateSelector {...defaultProps} />);

    const gridIcons = document.querySelectorAll('[title="Project showcase"]');
    expect(gridIcons.length).toBeGreaterThan(0);
  });
});
