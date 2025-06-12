
import { lazyLoad } from '@/lib/ai/lazy-loader';

describe('Lazy Loader', () => {
  it('should lazy load a module', async () => {
    const TestComponent = () => <div>Test Component</div>;
    const mockModule = { default: TestComponent };
    
    const loader = () => Promise.resolve(mockModule);
    const LazyComponent = lazyLoad(loader);
    
    expect(LazyComponent).toBeDefined();
    expect(LazyComponent.$$typeof).toBeDefined(); // React lazy component
  });

  it('should handle loading errors', async () => {
    const loader = () => Promise.reject(new Error('Failed to load'));
    const LazyComponent = lazyLoad(loader);
    
    expect(LazyComponent).toBeDefined();
  });
});
