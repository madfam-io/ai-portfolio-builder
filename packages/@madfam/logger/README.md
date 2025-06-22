# @madfam/logger

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.0-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/coverage-95%25-brightgreen.svg" alt="Coverage" />
</p>

<p align="center">
  <strong>Production-ready logging with beautiful formatting, structured logs, and automatic PII redaction</strong>
</p>

<p align="center">
  The logging system that makes debugging a joy in development and provides enterprise-grade observability in production.
</p>

## ✨ Features

### 🎯 Core Features
- **Beautiful Console Output** - Colored, formatted logs for development
- **Structured JSON Logs** - Machine-readable logs for production
- **Automatic PII Redaction** - Protect sensitive data automatically
- **Multiple Transports** - Console, file, cloud services, custom
- **Type-Safe Events** - Full TypeScript support with event types
- **Performance Tracking** - Built-in timing and performance metrics
- **Error Fingerprinting** - Group similar errors automatically

### 🚀 Advanced Features
- **Context Propagation** - Maintain context across async operations
- **Log Sampling** - Reduce volume while maintaining visibility
- **Async Transports** - Non-blocking log shipping
- **Batching** - Efficient bulk operations
- **Multi-Environment** - Works in Node.js, Browser, Edge, React Native
- **Framework Agnostic** - Use with any JavaScript framework

## 📦 Installation

```bash
npm install @madfam/logger
# or
yarn add @madfam/logger
# or
pnpm add @madfam/logger
```

## 🚀 Quick Start

```typescript
import { createLogger } from '@madfam/logger';

// Create a logger instance
const logger = createLogger({
  service: 'my-app',
  level: 'info',
  pretty: process.env.NODE_ENV === 'development',
});

// Simple logging
logger.info('Server started', { port: 3000 });
logger.error('Database connection failed', new Error('Connection timeout'));

// Structured logging with type safety
logger.info('user.signed_in', {
  userId: 'user123',
  method: 'oauth',
  provider: 'google',
  duration: 234, // ms
});
```

## 📖 Usage

### Basic Configuration

```typescript
const logger = createLogger({
  // Service name for identifying logs
  service: 'api-gateway',
  
  // Minimum log level
  level: 'debug', // 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  
  // Pretty print for development
  pretty: true,
  
  // Automatic PII redaction
  redact: ['password', 'token', 'ssn', 'email', 'phone'],
  
  // Custom fields added to every log
  defaultFields: {
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
});
```

### Log Levels

```typescript
// Trace - Detailed debugging information
logger.trace('Entering function', { args: [1, 2, 3] });

// Debug - Debugging information
logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });

// Info - General information
logger.info('Request completed', { method: 'GET', path: '/users', status: 200 });

// Warn - Warning messages
logger.warn('Deprecated API used', { endpoint: '/v1/users', useInstead: '/v2/users' });

// Error - Error messages
logger.error('Request failed', new Error('Invalid token'), { userId: 'user123' });

// Fatal - Fatal errors that require immediate attention
logger.fatal('System critical error', new Error('Out of memory'));
```

### Child Loggers

```typescript
// Create child loggers with additional context
const requestLogger = logger.child({
  requestId: 'req123',
  userId: 'user456',
});

requestLogger.info('Processing request');
// Logs include requestId and userId automatically
```

### Performance Tracking

```typescript
// Start a timer
const timer = logger.startTimer();

// Do some work
await someAsyncOperation();

// Log with duration
timer.done('Operation completed', { operation: 'data_processing' });
// Logs: "Operation completed" with duration: 234ms
```

### Error Logging with Context

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'payment_processing',
    userId: user.id,
    amount: 100.50,
    currency: 'USD',
    // These help with error grouping and debugging
    fingerprint: ['payment', error.code],
  });
}
```

## 🔧 Transports

### Console Transport (Default)

```typescript
const logger = createLogger({
  transports: [
    {
      type: 'console',
      level: 'debug',
      pretty: true,
    },
  ],
});
```

### File Transport

```typescript
const logger = createLogger({
  transports: [
    {
      type: 'file',
      level: 'info',
      filename: 'app.log',
      maxSize: '10m',
      maxFiles: 5,
      compress: true,
    },
  ],
});
```

### Cloud Transports

```typescript
const logger = createLogger({
  transports: [
    // Datadog
    {
      type: 'datadog',
      apiKey: process.env.DATADOG_API_KEY,
      service: 'my-app',
      batchSize: 100,
      flushInterval: 5000,
    },
    
    // CloudWatch
    {
      type: 'cloudwatch',
      region: 'us-east-1',
      logGroup: '/aws/lambda/my-function',
      logStream: 'production',
    },
    
    // Custom HTTP endpoint
    {
      type: 'http',
      url: 'https://logs.example.com/ingest',
      headers: {
        'X-API-Key': process.env.LOG_API_KEY,
      },
      batchSize: 50,
    },
  ],
});
```

### Custom Transport

```typescript
import { Transport, LogEntry } from '@madfam/logger';

class MyCustomTransport implements Transport {
  async log(entry: LogEntry): Promise<void> {
    // Send log to your custom destination
    await sendToMyService(entry);
  }
  
  async flush(): Promise<void> {
    // Flush any buffered logs
  }
}

const logger = createLogger({
  transports: [
    new MyCustomTransport(),
  ],
});
```

## 🎨 Pretty Printing

In development, logs are beautifully formatted:

```
[2024-01-15 10:23:45] INFO (my-app/worker): User signed in
  userId: "user123"
  method: "oauth"
  provider: "google"
  duration: 234ms

[2024-01-15 10:23:46] ERROR (my-app/worker): Database query failed
  Error: Connection timeout
    at Database.query (db.js:123:45)
    at UserService.findUser (user.js:23:20)
  
  query: "SELECT * FROM users WHERE id = ?"
  duration: 5023ms
  retries: 3
```

## 🔒 PII Redaction

Automatically redact sensitive information:

```typescript
const logger = createLogger({
  redact: ['password', 'token', 'ssn', 'creditCard'],
  redactPaths: ['user.email', 'payment.cardNumber'],
});

logger.info('User registered', {
  user: {
    id: '123',
    email: 'user@example.com', // Will be redacted
    password: 'secret123', // Will be redacted
  },
  token: 'abc123', // Will be redacted
});

// Output:
// User registered { user: { id: '123', email: '[REDACTED]', password: '[REDACTED]' }, token: '[REDACTED]' }
```

## 📊 Structured Logging

For production environments, use structured JSON logs:

```typescript
const logger = createLogger({
  pretty: false, // Disable pretty printing
  json: true,    // Enable JSON output
});

logger.info('order.completed', {
  orderId: 'order123',
  userId: 'user456',
  total: 99.99,
  items: 3,
});

// Output (single line):
// {"timestamp":"2024-01-15T10:23:45.123Z","level":"info","service":"my-app","event":"order.completed","orderId":"order123","userId":"user456","total":99.99,"items":3}
```

## 🎯 Type-Safe Event Logging

Define your event types for better type safety:

```typescript
// Define your events
interface LogEvents {
  'user.signed_in': {
    userId: string;
    method: 'email' | 'oauth';
    provider?: string;
  };
  'order.completed': {
    orderId: string;
    userId: string;
    total: number;
    items: number;
  };
  'payment.failed': {
    orderId: string;
    reason: string;
    amount: number;
  };
}

// Create typed logger
const logger = createLogger<LogEvents>({
  service: 'my-app',
});

// Now you get type checking and autocompletion
logger.info('user.signed_in', {
  userId: 'user123',
  method: 'oauth',
  provider: 'google',
}); // ✅ Type safe

logger.info('user.signed_in', {
  userId: 'user123',
  // method is missing - TypeScript error!
}); // ❌ Type error
```

## 🌍 Environment Support

### Node.js

```typescript
import { createLogger } from '@madfam/logger/node';

const logger = createLogger({
  // Node-specific features
  processInfo: true,
  systemInfo: true,
});
```

### Browser

```typescript
import { createLogger } from '@madfam/logger/browser';

const logger = createLogger({
  // Browser-specific features
  userAgent: true,
  sendToServer: {
    url: '/api/logs',
    batchSize: 20,
  },
});
```

### Edge Workers

```typescript
import { createLogger } from '@madfam/logger';

export default {
  async fetch(request: Request) {
    const logger = createLogger({
      service: 'edge-worker',
      request, // Automatically extract request context
    });
    
    logger.info('Request received', {
      method: request.method,
      url: request.url,
    });
    
    return new Response('Hello');
  },
};
```

## 📈 Performance

- **Zero Dependencies** in production build (chalk is dev only)
- **< 5KB** gzipped for browser bundle
- **Non-blocking** async transports
- **Efficient batching** for network transports
- **Minimal overhead** - typically < 1ms per log

## 🧪 Testing

```typescript
import { createMockLogger } from '@madfam/logger/testing';

test('user registration', () => {
  const logger = createMockLogger();
  
  registerUser({ email: 'test@example.com' }, logger);
  
  expect(logger.logs).toContainEqual({
    level: 'info',
    message: 'User registered',
    data: { email: 'test@example.com' },
  });
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🏆 Built by MADFAM

Part of the MADFAM ecosystem of world-class developer tools.

---

<p align="center">
  <a href="https://madfam.io">Website</a> •
  <a href="https://github.com/madfam-io/logger">GitHub</a> •
  <a href="https://docs.madfam.io/logger">Documentation</a> •
  <a href="https://madfam.io/support">Support</a>
</p>