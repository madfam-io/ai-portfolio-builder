# Prompt Template: Performance Optimization

## Context
You're optimizing the PRISMA portfolio builder to ensure fast load times, smooth interactions, and efficient resource usage while maintaining the sub-30-second portfolio generation target.

## Current Performance Metrics

### Targets
- Portfolio generation: <30 seconds ✅
- Page load: <3 seconds (90+ Lighthouse)
- AI processing: <5 seconds per request
- Bundle size: <200KB gzipped
- Time to Interactive: <3.5 seconds

### Common Performance Issues
1. Large JavaScript bundles
2. Unoptimized images
3. Blocking resources
4. Inefficient re-renders
5. Memory leaks
6. Slow API calls

## Optimization Strategies

### 1. Bundle Size Optimization

#### Analyze Bundle
```bash
# Generate bundle analysis
pnpm build
pnpm analyze

# Check individual route sizes
ANALYZE=true pnpm build
```

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton className="h-64" />,
    ssr: false // Skip SSR for client-only components
  }
);

// Route-based splitting (automatic in Next.js)
// Page components are automatically code-split
```

#### Tree Shaking
```typescript
// ❌ Bad: Imports entire library
import * as Icons from 'react-icons';

// ✅ Good: Import only what's needed
import { FaGithub, FaLinkedIn } from 'react-icons/fa';

// For utilities
// ❌ Bad
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ Good
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);
```

### 2. Image Optimization

#### Next.js Image Component
```typescript
import Image from 'next/image';

// Optimized image with blur placeholder
<Image
  src="/hero-image.jpg"
  alt="Portfolio hero"
  width={1200}
  height={600}
  priority // Load immediately for above-fold images
  placeholder="blur"
  blurDataURL={generateBlurDataURL()}
  sizes="(max-width: 640px) 100vw, 
         (max-width: 1024px) 50vw, 
         33vw"
/>

// Lazy load below-fold images
<Image
  src={project.image}
  alt={project.title}
  width={600}
  height={400}
  loading="lazy"
  className="rounded-lg"
/>
```

#### Image Format Optimization
```typescript
// components/ui/OptimizedImage.tsx
export function OptimizedImage({ src, ...props }: ImageProps) {
  // Cloudinary or similar service for format conversion
  const optimizedSrc = `${CDN_URL}/f_auto,q_auto/${src}`;
  
  return <Image src={optimizedSrc} {...props} />;
}
```

### 3. React Performance

#### Memoization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize components
const MemoizedComponent = memo(({ data }) => {
  return <ExpensiveComponent data={data} />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  // Handle click
}, [dependency]);
```

#### Virtualization for Long Lists
```typescript
// Use react-window for long lists
import { FixedSizeList } from 'react-window';

function ProjectList({ projects }: { projects: Project[] }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={projects.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

#### Optimize Re-renders
```typescript
// Use specific store selectors
// ❌ Bad: Subscribes to entire store
const store = usePortfolioStore();

// ✅ Good: Subscribe only to needed data
const projects = usePortfolioStore(state => state.projects);
const updateProject = usePortfolioStore(state => state.updateProject);

// Split components to isolate re-renders
function ProjectSection() {
  return (
    <>
      <ProjectList />      {/* Only re-renders when projects change */}
      <ProjectForm />      {/* Only re-renders when form state changes */}
    </>
  );
}
```

### 4. API Performance

#### Request Optimization
```typescript
// Parallel requests
const loadDashboardData = async () => {
  const [portfolio, analytics, feedback] = await Promise.all([
    fetchPortfolio(),
    fetchAnalytics(),
    fetchFeedback()
  ]);
  
  return { portfolio, analytics, feedback };
};

// Request deduplication
const requestCache = new Map();

async function deduplicatedFetch(url: string) {
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }
  
  const promise = fetch(url).then(r => r.json());
  requestCache.set(url, promise);
  
  // Clear cache after response
  promise.finally(() => {
    setTimeout(() => requestCache.delete(url), 100);
  });
  
  return promise;
}
```

#### Response Caching
```typescript
// API route caching
export async function GET(request: NextRequest) {
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300',
      }
    });
  }
  
  // Fetch data
  const data = await fetchData();
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  
  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=300',
    }
  });
}
```

### 5. Database Optimization

#### Query Optimization
```typescript
// Use indexes for common queries
// In your schema:
// CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
// CREATE INDEX idx_portfolios_subdomain ON portfolios(subdomain);

// Optimize N+1 queries
// ❌ Bad: N+1 query
const portfolios = await db.portfolio.findMany();
for (const portfolio of portfolios) {
  portfolio.projects = await db.project.findMany({
    where: { portfolioId: portfolio.id }
  });
}

// ✅ Good: Single query with includes
const portfolios = await db.portfolio.findMany({
  include: {
    projects: true,
    user: {
      select: { name: true, email: true }
    }
  }
});
```

#### Connection Pooling
```typescript
// lib/db/client.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
```

### 6. Caching Strategy

#### Multi-Level Caching
```typescript
// lib/cache/multi-level.ts
class MultiLevelCache {
  private memory = new Map();
  private memoryTTL = 60 * 1000; // 1 minute
  
  async get(key: string): Promise<any> {
    // Check memory cache
    const memoryHit = this.memory.get(key);
    if (memoryHit && memoryHit.expires > Date.now()) {
      return memoryHit.value;
    }
    
    // Check Redis
    try {
      const redisHit = await redis.get(key);
      if (redisHit) {
        const value = JSON.parse(redisHit);
        // Populate memory cache
        this.memory.set(key, {
          value,
          expires: Date.now() + this.memoryTTL
        });
        return value;
      }
    } catch (error) {
      // Redis failure, continue without cache
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl = 3600): Promise<void> {
    // Set in memory
    this.memory.set(key, {
      value,
      expires: Date.now() + this.memoryTTL
    });
    
    // Set in Redis
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      // Log but don't fail
      logger.error('Redis set failed', error);
    }
  }
}
```

### 7. Resource Loading

#### Critical CSS
```typescript
// pages/_document.tsx
import { getCssText } from '@/stitches.config';

<Head>
  <style 
    id="stitches" 
    dangerouslySetInnerHTML={{ __html: getCssText() }} 
  />
</Head>
```

#### Font Optimization
```typescript
// next.config.js
module.exports = {
  optimizeFonts: true,
};

// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Avoid FOIT
  variable: '--font-inter',
});
```

#### Preloading Resources
```typescript
// Preload critical resources
<Head>
  <link 
    rel="preload" 
    href="/api/portfolio" 
    as="fetch" 
    crossOrigin="anonymous" 
  />
  <link 
    rel="preconnect" 
    href="https://api.huggingface.co" 
  />
  <link 
    rel="dns-prefetch" 
    href="https://cdn.prisma.mx" 
  />
</Head>
```

### 8. Client-Side Performance

#### Debouncing and Throttling
```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchPortfolios(query);
  }, 300),
  []
);

// Throttle scroll events
const throttledScroll = useMemo(
  () => throttle(() => {
    updateScrollPosition();
  }, 100),
  []
);
```

#### Intersection Observer for Lazy Loading
```typescript
// hooks/useIntersectionObserver.ts
export function useIntersectionObserver(
  ref: RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isIntersecting;
}

// Usage
function LazySection({ children }) {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });
  
  return (
    <div ref={ref}>
      {isVisible ? children : <Skeleton />}
    </div>
  );
}
```

### 9. Service Worker for PWA

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        // Critical assets
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/offline');
    })
  );
});
```

## Performance Monitoring

### Real User Monitoring (RUM)
```typescript
// lib/performance/monitor.ts
export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      analytics.track('page_performance', {
        domContentLoaded: perfData.domContentLoadedEventEnd,
        loadComplete: perfData.loadEventEnd,
        firstPaint: perfData.fetchStart,
        domInteractive: perfData.domInteractive,
      });
    });
  }
  
  static measureApiCall(name: string, fn: () => Promise<any>) {
    return async (...args: any[]) => {
      const start = performance.now();
      
      try {
        const result = await fn(...args);
        const duration = performance.now() - start;
        
        analytics.track('api_performance', {
          endpoint: name,
          duration,
          success: true,
        });
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        analytics.track('api_performance', {
          endpoint: name,
          duration,
          success: false,
          error: error.message,
        });
        
        throw error;
      }
    };
  }
}
```

### Performance Budget Enforcement
```typescript
// scripts/check-bundle-size.js
const MAX_SIZES = {
  'app.js': 150 * 1024, // 150KB
  'vendor.js': 200 * 1024, // 200KB
  'total': 350 * 1024, // 350KB
};

// Run after build
const checkBundleSize = () => {
  const stats = require('.next/build-stats.json');
  
  Object.entries(MAX_SIZES).forEach(([bundle, maxSize]) => {
    const size = stats[bundle];
    if (size > maxSize) {
      console.error(`❌ ${bundle} exceeds budget: ${size} > ${maxSize}`);
      process.exit(1);
    }
  });
  
  console.log('✅ All bundles within budget');
};
```

## Debugging Performance Issues

### Chrome DevTools
```typescript
// Add performance marks
performance.mark('portfolio-load-start');
await loadPortfolio();
performance.mark('portfolio-load-end');
performance.measure(
  'portfolio-load',
  'portfolio-load-start',
  'portfolio-load-end'
);

// Log slow operations
const measure = (name: string, fn: Function) => {
  return async (...args: any[]) => {
    const start = performance.now();
    const result = await fn(...args);
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.warn(`Slow operation: ${name} took ${duration}ms`);
    }
    
    return result;
  };
};
```

### React DevTools Profiler
```typescript
// Wrap components in Profiler for debugging
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  if (actualDuration > 16) { // More than one frame
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
}

<Profiler id="PortfolioEditor" onRender={onRenderCallback}>
  <PortfolioEditor />
</Profiler>
```

## Checklist for Performance PRs

- [ ] Run bundle analyzer, no unexpected size increases
- [ ] Lighthouse score remains 90+
- [ ] No new render-blocking resources
- [ ] Images use next/image with proper sizing
- [ ] Heavy components are lazy loaded
- [ ] API calls are optimized (parallel, cached)
- [ ] No memory leaks (check with Chrome DevTools)
- [ ] Mobile performance tested
- [ ] Core Web Vitals within targets
- [ ] Performance budget maintained