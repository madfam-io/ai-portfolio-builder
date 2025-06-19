import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock class-variance-authority
jest.mock('class-variance-authority', () => ({
  cva: () => () => '',
  type: {},
}));

// Mock lib utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import { BasicInfoStep } from '@/app/editor/new/components/BasicInfoStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span>ArrowRight</span>,
}));

// Mock shadcn/ui components to avoid import issues
jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef<HTMLButtonElement, any>(function Button(
    { children, ...props },
    ref
  ) {
    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  }),
}));

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(function Input(props, ref) {
    return <input ref={ref} {...props} />;
  }),
}));

jest.mock('@/components/ui/label', () => ({
  Label: React.forwardRef<HTMLLabelElement, any>(function Label(
    { children, ...props },
    ref
  ) {
    return (
      <label ref={ref} {...props}>
        {children}
      </label>
    );
  }),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: React.forwardRef<HTMLTextAreaElement, any>(
    function Textarea(props, ref) {
      return <textarea ref={ref} {...props} />;
    }
  ),
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
