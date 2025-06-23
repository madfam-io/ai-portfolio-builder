# @madfam/rate-limiter

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/%40madfam%2Frate-limiter.svg)](https://www.npmjs.com/package/@madfam/rate-limiter)

Flexible and powerful rate limiting with multiple algorithms and storage adapters.

## Features

- 🚀 **Multiple Algorithms**: Sliding window, token bucket, fixed window, and leaky bucket
- 🗄️ **Multiple Storage Adapters**: Memory, Redis, and database support
- 🔧 **Flexible Key Generation**: IP, user, API key, and custom key generators
- 🌐 **Framework Agnostic**: Works with Express, Koa, Fastify, and any Node.js framework
- 📊 **Comprehensive Headers**: Standard and legacy rate limit headers
- 🎯 **TypeScript First**: Full TypeScript support with comprehensive types
- ⚡ **High Performance**: Optimized for high-throughput applications
- 🛡️ **Production Ready**: Battle-tested in production environments

## Installation

```bash
npm install @madfam/rate-limiter
```

For Redis support:
```bash
npm install @madfam/rate-limiter ioredis
```

## Quick Start

### Basic Usage

```typescript
import { RateLimiter, MemoryStore } from '@madfam/rate-limiter';

const limiter = new RateLimiter({
  max: 100,                    // Maximum 100 requests
  windowMs: 60 * 1000,        // Per 1 minute
  algorithm: 'sliding-window', // Algorithm to use
  store: new MemoryStore(),    // Storage adapter
});

// Express middleware
app.use(limiter.middleware());

// Manual checking
const result = await limiter.checkLimit('user-123');
if (!result.allowed) {
  console.log(`Rate limit exceeded. Retry after ${result.retryAfter} seconds`);
}
```

### Redis Store

```typescript
import { RateLimiter, RedisStore } from '@madfam/rate-limiter';

const limiter = new RateLimiter({
  max: 1000,
  windowMs: 60 * 1000,
  algorithm: 'token-bucket',
  store: new RedisStore({
    redis: 'redis://localhost:6379',
    prefix: 'api_limit:',
  }),
});
```

## Algorithms

### Sliding Window

Most accurate algorithm that tracks individual requests over a sliding time window.

```typescript
import { slidingWindow, MemoryStore } from '@madfam/rate-limiter';

const limiter = slidingWindow({
  max: 100,
  windowMs: 60 * 1000,
  store: new MemoryStore(),
});
```

### Token Bucket

Great for allowing bursts of traffic while maintaining average rate limits.

```typescript
import { tokenBucket, RedisStore } from '@madfam/rate-limiter';

const limiter = tokenBucket({
  max: 100,        // Bucket capacity
  windowMs: 60000, // Refill interval
  store: new RedisStore({ redis: 'redis://localhost:6379' }),
});
```

### Fixed Window

Simple and memory-efficient algorithm that resets counters at fixed intervals.

```typescript
import { fixedWindow, MemoryStore } from '@madfam/rate-limiter';

const limiter = fixedWindow({
  max: 100,
  windowMs: 60 * 1000,
  store: new MemoryStore(),
});
```

## Key Generators

### Built-in Generators

```typescript
import { 
  RateLimiter, 
  ipKeyGenerator, 
  userKeyGenerator,
  apiKeyGenerator,
  compositeKeyGenerator 
} from '@madfam/rate-limiter';

// IP-based rate limiting
const ipLimiter = new RateLimiter({
  max: 100,
  windowMs: 60000,
  keyGenerator: ipKeyGenerator,
});

// User-based rate limiting
const userLimiter = new RateLimiter({
  max: 1000,
  windowMs: 60000,
  keyGenerator: userKeyGenerator,
});

// API key-based rate limiting
const apiLimiter = new RateLimiter({
  max: 10000,
  windowMs: 60000,
  keyGenerator: apiKeyGenerator,
});

// Composite key (IP + User)
const compositeLimiter = new RateLimiter({
  max: 500,
  windowMs: 60000,
  keyGenerator: compositeKeyGenerator([ipKeyGenerator, userKeyGenerator]),
});
```

### Custom Key Generators

```typescript
const customLimiter = new RateLimiter({
  max: 100,
  windowMs: 60000,
  keyGenerator: (req) => `${req.ip}:${req.headers['user-agent']}`,
});
```

## Storage Adapters

### Memory Store

```typescript
import { MemoryStore } from '@madfam/rate-limiter';

const store = new MemoryStore({
  maxKeys: 10000,        // Maximum keys to store
  cleanupInterval: 60000, // Cleanup interval in ms
});
```

### Redis Store

```typescript
import { RedisStore } from '@madfam/rate-limiter';

const store = new RedisStore({
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'your-password',
  },
  prefix: 'rate_limit:',
  ttl: 3600, // TTL in seconds
});
```

## Advanced Usage

### Custom Error Handling

```typescript
const limiter = new RateLimiter({
  max: 100,
  windowMs: 60000,
  message: (limit) => `Rate limit exceeded. ${limit.remaining} requests remaining.`,
  handler: (req, res, limit) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      limit: limit.limit,
      remaining: limit.remaining,
      resetTime: new Date(limit.resetTime).toISOString(),
    });
  },
});
```

### Skip Conditions

```typescript
const limiter = new RateLimiter({
  max: 100,
  windowMs: 60000,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false,    // Count failed requests
});
```

### Headers Configuration

```typescript
const limiter = new RateLimiter({
  max: 100,
  windowMs: 60000,
  standardHeaders: true,  // Include standard rate limit headers
  legacyHeaders: false,   // Include legacy X-RateLimit-* headers
});
```

### Function Wrapping

```typescript
const rateLimitedFunction = limiter.wrap(
  async (userId: string, data: any) => {
    // Your function logic
    return processData(data);
  },
  (userId) => userId // Key generator for the function
);

try {
  const result = await rateLimitedFunction('user-123', { some: 'data' });
} catch (error) {
  if (error.rateLimitInfo) {
    console.log('Rate limited:', error.rateLimitInfo);
  }
}
```

## Framework Integration

### Express

```typescript
import express from 'express';
import { RateLimiter, ipKeyGenerator } from '@madfam/rate-limiter';

const app = express();

const limiter = new RateLimiter({
  max: 100,
  windowMs: 60000,
  keyGenerator: ipKeyGenerator,
});

app.use('/api', limiter.middleware());
```

### Koa

```typescript
import Koa from 'koa';
import { RateLimiter } from '@madfam/rate-limiter';

const app = new Koa();
const limiter = new RateLimiter({ max: 100, windowMs: 60000 });

app.use(async (ctx, next) => {
  const result = await limiter.checkLimit(ctx.ip);
  
  if (!result.allowed) {
    ctx.status = 429;
    ctx.body = { error: 'Rate limit exceeded' };
    return;
  }
  
  await next();
});
```

### Fastify

```typescript
import Fastify from 'fastify';
import { RateLimiter } from '@madfam/rate-limiter';

const fastify = Fastify();
const limiter = new RateLimiter({ max: 100, windowMs: 60000 });

fastify.addHook('preHandler', async (request, reply) => {
  const result = await limiter.checkLimit(request.ip);
  
  if (!result.allowed) {
    reply.code(429).send({ error: 'Rate limit exceeded' });
    return;
  }
});
```

## API Reference

### RateLimiter

#### Constructor Options

- `max`: Maximum number of requests allowed
- `windowMs`: Time window in milliseconds
- `algorithm`: Rate limiting algorithm ('sliding-window', 'token-bucket', 'fixed-window')
- `store`: Storage adapter instance
- `keyGenerator`: Function to generate keys from requests
- `message`: Custom error message or function
- `handler`: Custom error handler
- `standardHeaders`: Include standard rate limit headers
- `legacyHeaders`: Include legacy headers

#### Methods

- `checkLimit(identifier: string)`: Check if request should be allowed
- `resetLimit(identifier: string)`: Reset rate limit for identifier
- `getStatus(identifier: string)`: Get current rate limit status
- `middleware()`: Create Express-compatible middleware
- `wrap(fn, keyGenerator)`: Wrap function with rate limiting
- `close()`: Close store connections

### Stores

#### MemoryStore

In-memory storage with automatic cleanup.

#### RedisStore

Redis-based storage with Lua scripts for atomic operations.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📧 Email: support@madfam.io
- 🐛 Issues: [GitHub Issues](https://github.com/madfam-io/rate-limiter/issues)
- 📖 Documentation: [Full Documentation](https://madfam.io/packages/rate-limiter)