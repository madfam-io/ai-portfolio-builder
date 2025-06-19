import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockUseLanguage } from '@/test-utils/mock-i18n';
import { BasicInfoStep } from '@/app/editor/new/components/BasicInfoStep';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';

jest.mock('class-variance-authority', () => ({
jest.mock('@/lib/utils', () => ({
jest.mock('@/lib/i18n/refactored-context', () => ({
jest.mock('lucide-react', () => ({
jest.mock('@/components/ui/button', () => ({
jest.mock('@/components/ui/input', () => ({
jest.mock('@/components/ui/label', () => ({
jest.mock('@/components/ui/textarea', () => ({

// Polyfill FormData for Node environment
global.FormData = class FormData {
  private data: Map<string, any> = new Map();

  append(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key);
  }

  has(key: string) {
    return this.data.has(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }

  *[Symbol.iterator]() {
    yield* this.data;
  }
};

// Mock class-variance-authority

  cva: () => () => '',
  type: {},
}));

// Mock lib utils

  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock i18n

  useLanguage: mockUseLanguage,
}));

// Mock lucide-react icons

  ArrowRight: () => <span>ArrowRight</span>,
}));

// Mock shadcn/ui components to avoid import issues

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

  Input: React.forwardRef<HTMLInputElement, any>(function Input(props, ref) {
    return <input ref={ref} {...props} />;
  }),
}));

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

  Textarea: React.forwardRef<HTMLTextAreaElement, any>(
    function Textarea(props, ref) {
      return <textarea ref={ref} {...props} />;
    }
  ),
}));

// Mock language context

  useLanguage: () => mockUseLanguage(),
}));

const mockPortfolio = {
  id: 'test-portfolio',
  userId: 'test-user',
  name: 'Test Portfolio',
  title: 'Test Title',
  bio: 'Test bio',
  template: 'modern',
  status: 'draft',
  subdomain: 'test',
  contact: {},
  social: {},
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  customization: {},
  aiSettings: {},
  views: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BasicInfoStep', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

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

  it('should render all form fields', async () => {
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

  it('should display initial form values', async () => {
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

  it('should disable next button when required fields are empty', async () => {
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

  it('should enable next button when required fields are filled', async () => {
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