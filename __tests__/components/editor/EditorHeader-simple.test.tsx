import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple mock for lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  Loader: () => <svg data-testid="loader-icon" />,
  RotateCcw: () => <svg data-testid="rotate-ccw-icon" />,
  RotateCw: () => <svg data-testid="rotate-cw-icon" />,
  Save: () => <svg data-testid="save-icon" />,
  Share2: () => <svg data-testid="share2-icon" />
}));

import { EditorHeader } from '@/components/editor/EditorHeader';

const mockPortfolio = {
  id: 'test-portfolio-1',
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Software Developer',
  bio: 'Experienced software developer',
  contact: { email: 'test@example.com' },
  social: {},
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  template: 'developer' as const,
  customization: {},
  status: 'draft' as const,
  createdAt: new Date(),
  updatedAt: new Date()
};

const defaultProps = {
  portfolio: mockPortfolio,
  isDirty: false,
  isSaving: false,
  onSave: jest.fn(),
  onPublish: jest.fn(),
  onPreview: jest.fn(),
  canUndo: false,
  canRedo: false,
  onUndo: jest.fn(),
  onRedo: jest.fn(),
};

describe('EditorHeader Simple Test', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(<EditorHeader {...defaultProps} />);
    }).not.toThrow();
  });

  it('should display portfolio name', () => {
    render(<EditorHeader {...defaultProps} />);
    expect(screen.getByText('Test Portfolio')).toBeInTheDocument();
  });
});