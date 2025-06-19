import {
  describe,
  test,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 250ms (half the delay)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still be the initial value
    expect(result.current).toBe('initial');

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    );

    // Make rapid changes
    rerender({ value: 'second', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'third', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'fourth', delay: 500 });

    // Advance time to just before the last timeout completes
    act(() => {
      jest.advanceTimersByTime(499);
    });

    // Should still be the initial value
    expect(result.current).toBe('first');

    // Complete the last timeout
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Should now be the last value
    expect(result.current).toBe('fourth');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    // Change both value and delay
    rerender({ value: 'updated', delay: 200 });

    act(() => {
      jest.advanceTimersByTime(199);
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should work with different data types', () => {
    // Test with number
    const { result: numberResult } = renderHook(() => useDebounce(42, 500));
    expect(numberResult.current).toBe(42);

    // Test with object
    const obj = { foo: 'bar' };
    const { result: objectResult } = renderHook(() => useDebounce(obj, 500));
    expect(objectResult.current).toBe(obj);

    // Test with array
    const arr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 500));
    expect(arrayResult.current).toBe(arr);

    // Test with boolean
    const { result: boolResult } = renderHook(() => useDebounce(true, 500));
    expect(boolResult.current).toBe(true);

    // Test with null
    const { result: nullResult } = renderHook(() => useDebounce(null, 500));
    expect(nullResult.current).toBe(null);
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    );

    rerender({ value: 'updated', delay: 0 });

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current).toBe('updated');
  });

  it('should clean up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Trigger a timeout
    rerender({ value: 'updated', delay: 500 });

    // Unmount before timeout completes
    unmount();

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('should handle rapid consecutive updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 300 },
      }
    );

    // Simulate rapid updates like typing
    for (let i = 1; i <= 10; i++) {
      rerender({ value: i, delay: 300 });
      act(() => {
        jest.advanceTimersByTime(50); // Advance 50ms between each update
      });
    }

    // Total time passed: 500ms, but each update resets the 300ms timer
    expect(result.current).toBe(0); // Still initial value

    // Advance to complete the last debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(10); // Final value
  });

  it('should handle changing delay while debouncing', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Change delay mid-debounce
    rerender({ value: 'updated', delay: 200 });

    // Original timeout should be cancelled, new one started
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  it('should maintain referential equality for unchanged object values', () => {
    const obj = { count: 0 };
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: obj, delay: 500 },
      }
    );

    const initialReference = result.current;

    // Update with the same object reference
    rerender({ value: obj, delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should still be the same reference
    expect(result.current).toBe(initialReference);
  });
});
