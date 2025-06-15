import { EditorHeader } from '@/components/editor/EditorHeader';

describe('Debug Component Import', () => {
  it('should check what EditorHeader exports', () => {
    console.log('EditorHeader type:', typeof EditorHeader);
    console.log('EditorHeader value:', EditorHeader);
    console.log('EditorHeader constructor:', EditorHeader.constructor);
    console.log('EditorHeader toString:', EditorHeader.toString());
    
    expect(typeof EditorHeader).toBe('function');
  });
});