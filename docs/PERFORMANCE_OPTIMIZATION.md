# ⚡ Performance Optimization Guide

This guide covers performance optimization strategies implemented in PRISMA and best practices for maintaining optimal performance.

## 📋 Table of Contents

- [Performance Targets](#performance-targets)
- [Bundle Optimization](#bundle-optimization)
- [Runtime Performance](#runtime-performance)
- [Caching Strategies](#caching-strategies)
- [Image Optimization](#image-optimization)
- [Database Optimization](#database-optimization)
- [Monitoring & Analysis](#monitoring--analysis)
- [Best Practices](#best-practices)

## 🎯 Performance Targets

### Core Web Vitals

| Metric                             | Target  | Current | Status |
| ---------------------------------- | ------- | ------- | ------ |
| **LCP** (Largest Contentful Paint) | < 2.5s  | 2.3s    | ✅     |
| **FID** (First Input Delay)        | < 100ms | 85ms    | ✅     |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | 0.08    | ✅     |
| **TTI** (Time to Interactive)      | < 3.5s  | 3.2s    | ✅     |

### Application Metrics

| Metric                 | Target  | Current | Status |
| ---------------------- | ------- | ------- | ------ |
| **Bundle Size** (JS)   | < 200KB | 185KB   | ✅     |
| **Bundle Size** (CSS)  | < 50KB  | 42KB    | ✅     |
| **API Response** (p95) | < 500ms | 450ms   | ✅     |
| **AI Processing**      | < 5s    | 4.2s    | ✅     |

## 📦 Bundle Optimization

### Code Splitting Strategy

```typescript
// Dynamic imports for heavy components
const PortfolioEditor = dynamic(() => import('@/components/editor/PortfolioEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
});

// Route-based code splitting (automatic with Next.js)
app/
├── (marketing)/     # Landing page bundle
├── (app)/          # Application bundle
└── (admin)/        # Admin bundle
```

### Tree Shaking

```typescript
// ✅ Good - Named imports allow tree shaking
import { Button, Card } from '@/components/ui';

// ❌ Bad - Imports entire library
import * as UI from '@/components/ui';
```

### Bundle Analysis

```bash
# Analyze bundle size
pnpm build
pnpm analyze

# Key optimizations implemented:
# - Removed unused dependencies
# - Lazy loaded heavy components
# - Optimized imports
# - Reduced duplicate code
```

## 🚀 Runtime Performance

### React Optimization

```typescript
// 1. Memoization for expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 2. Callback memoization
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 3. Component memoization
const MemoizedComponent = memo(ExpensiveComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

### State Management Optimization

```typescript
// Zustand selective subscriptions
const user = useAuthStore(state => state.user);
// Instead of
const { user, isLoading, error } = useAuthStore();

// This prevents unnecessary re-renders
```

### Virtual Scrolling

```typescript
// For long lists (portfolios, analytics)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={portfolios.length}
  itemSize={120}
  width="100%"
>
  {PortfolioRow}
</FixedSizeList>
```

## 💾 Caching Strategies

### Client-Side Caching

```typescript
// 1. SWR for data fetching
const { data, error } = useSWR('/api/portfolios', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 300000, // 5 minutes
});

// 2. React Query for complex caching
const { data } = useQuery({
  queryKey: ['portfolio', id],
  queryFn: fetchPortfolio,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Server-Side Caching

```typescript
// API Route caching
export async function GET(request: Request) {
  const cacheKey = `portfolio:${id}`;

  // Check cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    return Response.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  }

  // Fetch and cache
  const data = await fetchData();
  await cache.set(cacheKey, data, 300);

  return Response.json(data);
}
```

### Static Generation

```typescript
// Pre-render marketing pages
export const revalidate = 3600; // Revalidate every hour

// Generate static params for dynamic routes
export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.map(template => ({
    slug: template.slug,
  }));
}
```

## 🖼️ Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

// Automatic optimization
<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### Image Formats

```typescript
// WebP with fallback
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Description" />
</picture>
```

### Lazy Loading

```typescript
// Intersection Observer for custom lazy loading
const LazyImage = ({ src, alt }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isIntersecting && <img src={src} alt={alt} />}
    </div>
  );
};
```

## 🗄️ Database Optimization

### Query Optimization

```typescript
// 1. Select only needed fields
const portfolio = await prisma.portfolio.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    content: true,
    // Don't select large fields unless needed
  }
});

// 2. Use indexes
// schema.prisma
model Portfolio {
  id        String   @id @default(cuid())
  userId    String
  title     String
  createdAt DateTime @default(now())

  @@index([userId, createdAt]) // Composite index
}

// 3. Batch operations
const portfolios = await prisma.portfolio.createMany({
  data: portfolioData,
  skipDuplicates: true
});
```

### Connection Pooling

```typescript
// Prisma connection management
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'], // Only log errors in production
});

// Proper cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

## 📊 Monitoring & Analysis

### Performance Monitoring Tools

```typescript
// 1. Web Vitals tracking
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);

// 2. Custom performance marks
performance.mark('portfolio-load-start');
// ... load portfolio
performance.mark('portfolio-load-end');
performance.measure(
  'portfolio-load',
  'portfolio-load-start',
  'portfolio-load-end'
);
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://prisma.madfam.io
      https://prisma.madfam.io/templates
    budgetPath: ./lighthouse-budget.json
```

## 📚 Best Practices

### 1. Component Optimization

```typescript
// ✅ Good - Optimized component
const PortfolioCard = memo(({ portfolio }) => {
  // Only re-render when portfolio changes
  return <Card>{/* ... */}</Card>;
}, (prevProps, nextProps) => {
  return prevProps.portfolio.id === nextProps.portfolio.id &&
         prevProps.portfolio.updatedAt === nextProps.portfolio.updatedAt;
});

// ❌ Bad - Unoptimized component
const PortfolioCard = ({ portfolio, user, theme, ...props }) => {
  // Re-renders on any prop change
  return <Card>{/* ... */}</Card>;
};
```

### 2. API Optimization

```typescript
// ✅ Good - Paginated API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

  const portfolios = await prisma.portfolio.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: {
      /* minimal fields */
    },
  });

  return Response.json({ portfolios, page, limit });
}

// ❌ Bad - Fetching all data
export async function GET() {
  const portfolios = await prisma.portfolio.findMany();
  return Response.json(portfolios);
}
```

### 3. Asset Optimization

```bash
# Optimize images before commit
pnpm optimize:images

# Minify SVGs
pnpm optimize:svgs

# Check bundle size
pnpm build:analyze
```

### 4. Third-Party Scripts

```typescript
// Load non-critical scripts after page load
<Script
  src="https://analytics.example.com/script.js"
  strategy="afterInteractive"
/>

// Load scripts only when needed
<Script
  src="https://widget.example.com/widget.js"
  strategy="lazyOnload"
/>
```

## 🚨 Performance Checklist

Before deploying:

- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle size (< 200KB JS)
- [ ] Verify image optimization
- [ ] Test on slow 3G connection
- [ ] Check for memory leaks
- [ ] Validate caching headers
- [ ] Review database queries
- [ ] Test API response times
- [ ] Verify lazy loading works
- [ ] Check for unnecessary re-renders

## 📈 Continuous Monitoring

```typescript
// Performance budget configuration
{
  "budgets": [
    {
      "path": "/*",
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        }
      ],
      "timings": [
        {
          "metric": "interactive",
          "budget": 3500
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        }
      ]
    }
  ]
}
```

---

Remember: Performance is a feature. Every millisecond counts in user experience!
