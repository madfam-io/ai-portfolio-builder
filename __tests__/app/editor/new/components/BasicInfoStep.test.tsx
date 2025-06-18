import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicInfoStep } from '@/app/editor/new/components/BasicInfoStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span>ArrowRight</span>,
}));

// Mock shadcn/ui components to avoid import issues
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

describe('BasicInfoStep', () => {
  const mockT = {
    letsGetStarted: "Let's get started",
    basicInfoDescription: 'Tell us a bit about yourself and your portfolio',
    portfolioName: 'Portfolio Name',
    portfolioNamePlaceholder: 'My Professional Portfolio',
    yourTitle: 'Your Professional Title',
    titlePlaceholder: 'Senior Software Engineer',
    shortBio: 'Short Bio',
    bioPlaceholder:
      'Tell us about your experience and what makes you unique...',
    continueButton: 'Continue',
  };

  const mockFormData = {
    name: '',
    title: '',
    bio: '',
  };

  const mockUpdateFormData = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    expect(screen.getByLabelText(mockT.portfolioName)).toBeInTheDocument();
    expect(screen.getByLabelText(mockT.yourTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(mockT.shortBio)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue/ })
    ).toBeInTheDocument();
  });

  it('should display initial form values', () => {
    const filledFormData = {
      name: 'John Doe',
      title: 'Software Engineer',
      bio: 'Experienced developer',
    };

    render(
      <BasicInfoStep
        formData={filledFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    expect(screen.getByLabelText(mockT.portfolioName)).toHaveValue('John Doe');
    expect(screen.getByLabelText(mockT.yourTitle)).toHaveValue(
      'Software Engineer'
    );
    expect(screen.getByLabelText(mockT.shortBio)).toHaveValue(
      'Experienced developer'
    );
  });

  it('should update form data on input change', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nameInput = screen.getByLabelText(mockT.portfolioName);
    const titleInput = screen.getByLabelText(mockT.yourTitle);
    const bioInput = screen.getByLabelText(mockT.shortBio);

    await user.type(nameInput, 'J');
    expect(mockUpdateFormData).toHaveBeenCalledWith({ name: 'J' });

    await user.type(titleInput, 'U');
    expect(mockUpdateFormData).toHaveBeenCalledWith({ title: 'U' });

    await user.type(bioInput, 'C');
    expect(mockUpdateFormData).toHaveBeenCalledWith({ bio: 'C' });
  });

  it('should disable next button when required fields are empty', () => {
    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nextButton = screen.getByRole('button', { name: /Continue/ });
    expect(nextButton).toBeDisabled();
  });

  it('should enable next button when required fields are filled', () => {
    const filledFormData = {
      name: 'John Doe',
      title: 'Software Engineer',
      bio: '',
    };

    render(
      <BasicInfoStep
        formData={filledFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nextButton = screen.getByRole('button', { name: /Continue/ });
    expect(nextButton).toBeEnabled();
  });

  it('should call onNext when form is valid and button is clicked', async () => {
    const user = userEvent.setup();
    const filledFormData = {
      name: 'John Doe',
      title: 'Software Engineer',
      bio: 'Experienced developer',
    };

    render(
      <BasicInfoStep
        formData={filledFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nextButton = screen.getByRole('button', { name: /Continue/ });
    await user.click(nextButton);

    expect(mockOnNext).toHaveBeenCalled();
  });
});
