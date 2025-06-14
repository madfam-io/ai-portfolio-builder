import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSection } from '@/components/editor/sections/HeroSection';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context');
jest.mock('@/components/ui/image-upload', () => ({
  ImageUpload: ({ value, onChange, onRemove }: any) => (
    <div data-testid="image-upload">
      <input
        type="file"
        data-testid="image-input"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onChange(`https://example.com/${e.target.files[0].name}`);
          }
        }}
      />
      {value && (
        <button data-testid="remove-image" onClick={onRemove}>
          Remove
        </button>
      )}
    </div>
  ),
}));

describe('HeroSection', () => {
  const mockOnChange = jest.fn();
  const mockData = {
    name: 'John Doe',
    title: 'Software Developer',
    bio: 'Experienced developer with a passion for creating amazing applications.',
    avatar: null,
  };

  const mockT = {
    name: 'Name',
    jobTitle: 'Job Title',
    bio: 'Bio',
    profileImage: 'Profile Image',
    uploadImage: 'Upload Image',
    removeImage: 'Remove Image',
    namePlaceholder: 'Enter your name',
    jobTitlePlaceholder: 'Enter your job title',
    bioPlaceholder: 'Tell us about yourself',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({
      t: mockT,
    });
  });

  it('renders all form fields with correct labels', () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Profile Image')).toBeInTheDocument();
  });

  it('displays initial data values', () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software Developer')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockData.bio)).toBeInTheDocument();
  });

  it('calls onChange when name is updated', async () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockData,
        name: 'Jane Doe',
      });
    });
  });

  it('calls onChange when title is updated', async () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText('Job Title');
    fireEvent.change(titleInput, { target: { value: 'Senior Developer' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockData,
        title: 'Senior Developer',
      });
    });
  });

  it('calls onChange when bio is updated', async () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    const bioTextarea = screen.getByLabelText('Bio');
    fireEvent.change(bioTextarea, { target: { value: 'New bio text' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockData,
        bio: 'New bio text',
      });
    });
  });

  it('handles image upload', async () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const imageInput = screen.getByTestId('image-input');

    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockData,
        avatar: 'https://example.com/test.png',
      });
    });
  });

  it('handles image removal', async () => {
    const dataWithAvatar = {
      ...mockData,
      avatar: 'https://example.com/profile.jpg',
    };

    render(<HeroSection data={dataWithAvatar} onChange={mockOnChange} />);

    const removeButton = screen.getByTestId('remove-image');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...dataWithAvatar,
        avatar: null,
      });
    });
  });

  it('shows placeholders when fields are empty', () => {
    const emptyData = {
      name: '',
      title: '',
      bio: '',
      avatar: null,
    };

    render(<HeroSection data={emptyData} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your job title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
  });

  it('renders with correct input types', () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const titleInput = screen.getByLabelText('Job Title') as HTMLInputElement;
    const bioTextarea = screen.getByLabelText('Bio') as HTMLTextAreaElement;

    expect(nameInput.type).toBe('text');
    expect(titleInput.type).toBe('text');
    expect(bioTextarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('handles rapid input changes without errors', async () => {
    render(<HeroSection data={mockData} onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText('Name');

    // Simulate rapid typing
    fireEvent.change(nameInput, { target: { value: 'J' } });
    fireEvent.change(nameInput, { target: { value: 'Ja' } });
    fireEvent.change(nameInput, { target: { value: 'Jan' } });
    fireEvent.change(nameInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenLastCalledWith({
        ...mockData,
        name: 'Jane',
      });
    });
  });
});