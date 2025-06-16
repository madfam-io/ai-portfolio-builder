import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/lib/store/ui-store';

// Mock the UI store
jest.mock('@/lib/store/ui-store');

describe('useToast', () => {
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUIStore as jest.MockedFunction<typeof useUIStore>).mockReturnValue({
      showToast: mockShowToast,
      // Add other store properties if needed
    } as any);
  });

  it('should call showToast with correct parameters for default toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Success!',
        description: 'Operation completed successfully',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Success!',
      description: 'Operation completed successfully',
      type: 'success',
      duration: 5000,
    });
  });

  it('should call showToast with error type for destructive variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Error!',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Error!',
      description: 'Something went wrong',
      type: 'error',
      duration: 5000,
    });
  });

  it('should use custom duration when provided', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Custom duration',
        duration: 10000,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Custom duration',
      description: undefined,
      type: 'success',
      duration: 10000,
    });
  });

  it('should handle toast without description', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Simple notification',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Simple notification',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
  });

  it('should maintain stable toast function reference', () => {
    const { result, rerender } = renderHook(() => useToast());

    const firstToast = result.current.toast;

    // Re-render the hook
    rerender();

    expect(result.current.toast).toBe(firstToast);
  });

  it('should handle variant default explicitly', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Default variant',
        variant: 'default',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Default variant',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
  });

  it('should work with all options combined', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Complete toast',
        description: 'With all options',
        variant: 'destructive',
        duration: 3000,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Complete toast',
      description: 'With all options',
      type: 'error',
      duration: 3000,
    });
  });

  it('should handle multiple toast calls', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
      result.current.toast({ title: 'Third toast' });
    });

    expect(mockShowToast).toHaveBeenCalledTimes(3);
    expect(mockShowToast).toHaveBeenNthCalledWith(1, {
      title: 'First toast',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
    expect(mockShowToast).toHaveBeenNthCalledWith(2, {
      title: 'Second toast',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
    expect(mockShowToast).toHaveBeenNthCalledWith(3, {
      title: 'Third toast',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
  });

  it('should update toast function when showToast changes', () => {
    const { result, rerender } = renderHook(() => useToast());

    const firstToast = result.current.toast;

    // Change the mock implementation
    const newMockShowToast = jest.fn();
    (useUIStore as jest.MockedFunction<typeof useUIStore>).mockReturnValue({
      showToast: newMockShowToast,
    } as any);

    // Re-render the hook
    rerender();

    // Function reference should change when dependency changes
    expect(result.current.toast).not.toBe(firstToast);

    // New function should use new showToast
    act(() => {
      result.current.toast({ title: 'New toast' });
    });

    expect(newMockShowToast).toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New toast' })
    );
  });

  it('should handle empty title gracefully', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: '',
        description: 'Description without title',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: '',
      description: 'Description without title',
      type: 'success',
      duration: 5000,
    });
  });

  it('should handle very long messages', () => {
    const { result } = renderHook(() => useToast());

    const longTitle = 'A'.repeat(200);
    const longDescription = 'B'.repeat(500);

    act(() => {
      result.current.toast({
        title: longTitle,
        description: longDescription,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: longTitle,
      description: longDescription,
      type: 'success',
      duration: 5000,
    });
  });

  it('should handle duration of 0', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Persistent toast',
        duration: 0,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Persistent toast',
      description: undefined,
      type: 'success',
      duration: 0,
    });
  });
});