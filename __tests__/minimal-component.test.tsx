import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock all lucide-react icons very simply
jest.mock('lucide-react', () => new Proxy({}, {
  get: () => (props: any) => React.createElement('div', { 'data-testid': 'mock-icon', ...props })
}));

const TestComponent = () => {
  return <div>Test Component</div>;
};

describe('Minimal Component Test', () => {
  it('should render a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});