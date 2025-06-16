import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicInfoStep } from '@/app/editor/new/components/BasicInfoStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <span>User</span>,
  ChevronRight: () => <span>ChevronRight</span>,
}));

describe('BasicInfoStep', () => {
  const mockT = {
    yourName: 'Your Name',
    yourTitle: 'Your Title',
    shortBio: 'Short Bio',
    tellUsAboutYourself: 'Tell us about yourself',
    next: 'Next',
    fieldRequired: 'This field is required',
    nameRequired: 'Name is required',
    titleRequired: 'Title is required',
    bioRequired: 'Bio is required',
  };

  const mockFormData = {
    name: '',
    title: '',
    bio: '',
    template: 'modern' as const,
    importSource: 'manual' as const,
    enhanceContent: true,
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

    expect(screen.getByLabelText(mockT.yourName)).toBeInTheDocument();
    expect(screen.getByLabelText(mockT.yourTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(mockT.shortBio)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: mockT.next })
    ).toBeInTheDocument();
  });

  it('should display initial form values', () => {
    const filledFormData = {
      ...mockFormData,
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

    expect(screen.getByLabelText(mockT.yourName)).toHaveValue('John Doe');
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

    const nameInput = screen.getByLabelText(mockT.yourName);
    const titleInput = screen.getByLabelText(mockT.yourTitle);
    const bioInput = screen.getByLabelText(mockT.shortBio);

    await user.type(nameInput, 'Jane Smith');
    await user.type(titleInput, 'UX Designer');
    await user.type(bioInput, 'Creative professional');

    expect(mockUpdateFormData).toHaveBeenCalledWith({ name: 'Jane Smith' });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ title: 'UX Designer' });
    expect(mockUpdateFormData).toHaveBeenCalledWith({
      bio: 'Creative professional',
    });
  });

  it('should validate required fields before proceeding', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nextButton = screen.getByRole('button', { name: mockT.next });

    // Try to proceed without filling fields
    await user.click(nextButton);

    // Should not call onNext
    expect(mockOnNext).not.toHaveBeenCalled();

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(mockT.nameRequired)).toBeInTheDocument();
      expect(screen.getByText(mockT.titleRequired)).toBeInTheDocument();
      expect(screen.getByText(mockT.bioRequired)).toBeInTheDocument();
    });
  });

  it('should validate individual fields on blur', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nameInput = screen.getByLabelText(mockT.yourName);

    // Focus and blur without entering anything
    await user.click(nameInput);
    await user.tab();

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(mockT.nameRequired)).toBeInTheDocument();
    });
  });

  it('should clear validation errors when fields are filled', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nextButton = screen.getByRole('button', { name: mockT.next });
    const nameInput = screen.getByLabelText(mockT.yourName);

    // Try to proceed without filling fields
    await user.click(nextButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(mockT.nameRequired)).toBeInTheDocument();
    });

    // Fill the name field
    await user.type(nameInput, 'John Doe');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(mockT.nameRequired)).not.toBeInTheDocument();
    });
  });

  it('should proceed when all fields are valid', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    // Fill all fields
    await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
    await user.type(
      screen.getByLabelText(mockT.yourTitle),
      'Software Engineer'
    );
    await user.type(
      screen.getByLabelText(mockT.shortBio),
      'Experienced developer'
    );

    // Click next
    await user.click(screen.getByRole('button', { name: mockT.next }));

    // Should call onNext
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should trim whitespace from inputs', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nameInput = screen.getByLabelText(mockT.yourName);

    // Type with leading/trailing spaces
    await user.type(nameInput, '  John Doe  ');

    // Should trim spaces when calling updateFormData
    expect(mockUpdateFormData).toHaveBeenCalledWith({ name: 'John Doe' });
  });

  it('should have proper character limits', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nameInput = screen.getByLabelText(mockT.yourName) as HTMLInputElement;
    const titleInput = screen.getByLabelText(
      mockT.yourTitle
    ) as HTMLInputElement;
    const bioInput = screen.getByLabelText(
      mockT.shortBio
    ) as HTMLTextAreaElement;

    expect(nameInput.maxLength).toBe(100);
    expect(titleInput.maxLength).toBe(100);
    expect(bioInput.maxLength).toBe(500);
  });

  it('should show character count for bio field', async () => {
    const user = userEvent.setup();

    render(
      <BasicInfoStep
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const bioInput = screen.getByLabelText(mockT.shortBio);

    // Type some text
    await user.type(bioInput, 'This is my bio');

    // Should show character count
    expect(screen.getByText('14/500')).toBeInTheDocument();
  });

  it('should disable next button while processing', async () => {
    const user = userEvent.setup();
    let resolveNext: () => void;
    const nextPromise = new Promise<void>(resolve => {
      resolveNext = resolve;
    });

    mockOnNext.mockImplementation(() => nextPromise);

    render(
      <BasicInfoStep
        formData={{
          ...mockFormData,
          name: 'John Doe',
          title: 'Software Engineer',
          bio: 'Experienced developer',
        }}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        t={mockT}
      />
    );

    const nextButton = screen.getByRole('button', { name: mockT.next });

    // Click next
    await user.click(nextButton);

    // Button should be disabled
    expect(nextButton).toBeDisabled();

    // Resolve the promise
    resolveNext!();
    await nextPromise;

    // Button should be enabled again
    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
  });
});
