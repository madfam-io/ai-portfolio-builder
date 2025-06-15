import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    );
    expect(result).toBe('base-class active');
  });

  it('should merge tailwind classes correctly', () => {
    // twMerge should handle conflicting classes
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle arrays', () => {
    const result = cn(['px-2', 'py-1'], 'mt-2');
    expect(result).toBe('px-2 py-1 mt-2');
  });

  it('should handle objects', () => {
    const result = cn({
      'px-2': true,
      'py-1': true,
      'hidden': false,
    });
    expect(result).toBe('px-2 py-1');
  });

  it('should handle mixed inputs', () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      undefined,
      null,
      false,
      'final'
    );
    expect(result).toBe('base array-class object-class final');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle null and undefined', () => {
    const result = cn(null, undefined, 'valid-class');
    expect(result).toBe('valid-class');
  });

  it('should merge responsive classes correctly', () => {
    const result = cn('sm:px-2', 'sm:px-4', 'md:px-6');
    expect(result).toBe('sm:px-4 md:px-6');
  });

  it('should handle hover and other state modifiers', () => {
    const result = cn(
      'hover:bg-blue-500',
      'hover:bg-red-500',
      'focus:outline-none'
    );
    expect(result).toBe('hover:bg-red-500 focus:outline-none');
  });

  it('should preserve important classes', () => {
    const result = cn('!px-2', 'px-4');
    expect(result).toBe('!px-2 px-4');
  });

  it('should handle arbitrary values', () => {
    const result = cn('px-[23px]', 'py-[15px]');
    expect(result).toBe('px-[23px] py-[15px]');
  });

  it('should deduplicate identical classes', () => {
    const result = cn('px-2', 'px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });
});