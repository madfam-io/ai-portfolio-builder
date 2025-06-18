/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';


// Mock a basic editor component for testing
const BasicEditor = ({ portfolio, onUpdate }: any) => {
  return (
    <div data-testid="basic-editor">
      <input
        data-testid="name-input"
        value={portfolio?.name || ''}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Enter name"
      />
      <input
        data-testid="title-input"
        value={portfolio?.title || ''}
        onChange={e => onUpdate({ title: e.target.value })}
        placeholder="Enter title"
      />
      <textarea
        data-testid="bio-input"
        value={portfolio?.bio || ''}
        onChange={e => onUpdate({ bio: e.target.value })}
        placeholder="Enter bio"
      />
      <button data-testid="save-btn">Save</button>
    </div>

};

describe('Basic Editor Functionality', () => {
  it('should render editor inputs', () => {
    const mockPortfolio = {
      name: 'John Doe',
      title: 'Developer',
      bio: 'A developer',
    };

    const mockUpdate = jest.fn();

    render(<BasicEditor portfolio={mockPortfolio} onUpdate={mockUpdate} />);

    expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
    expect(screen.getByTestId('title-input')).toHaveValue('Developer');
    expect(screen.getByTestId('bio-input')).toHaveValue('A developer');
  });

  it('should call onUpdate when inputs change', () => {
    const mockPortfolio = {
      name: 'John Doe',
      title: 'Developer',
      bio: 'A developer',
    };

    const mockUpdate = jest.fn();

    render(<BasicEditor portfolio={mockPortfolio} onUpdate={mockUpdate} />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Jane Doe' });
  });

  it('should handle empty portfolio', () => {
    const mockUpdate = jest.fn();

    render(<BasicEditor portfolio={null} onUpdate={mockUpdate} />);

    expect(screen.getByTestId('name-input')).toHaveValue('');
    expect(screen.getByTestId('title-input')).toHaveValue('');
    expect(screen.getByTestId('bio-input')).toHaveValue('');
  });
});
