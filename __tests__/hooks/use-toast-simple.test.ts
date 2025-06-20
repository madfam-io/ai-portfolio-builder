import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';

// Simple mock for testing
const mockShowToast = jest.fn();

jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: () => ({
    showToast: mockShowToast,
  }),
}));

describe('useToast - Simple', () => {
  beforeEach(() => {
    mockShowToast.mockClear();
  });

  it('should call showToast when toast is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test',
        description: 'Test description',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Test',
      description: 'Test description',
      type: 'success',
      duration: 5000,
    });
  });

  it('should handle destructive variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Error',
        variant: 'destructive',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Error',
      description: undefined,
      type: 'error',
      duration: 5000,
    });
  });

  it('should handle custom duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Custom',
        duration: 3000,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Custom',
      description: undefined,
      type: 'success',
      duration: 3000,
    });
  });
});