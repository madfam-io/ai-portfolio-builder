const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  moduleNameMapper: {
    // Handle module aliases (this will match tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    // Mock lucide-react icons
    'lucide-react/dist/esm/icons/(.*)': '<rootDir>/__mocks__/lucide-react.js',
    'lucide-react': '<rootDir>/__mocks__/lucide-react.js',
    // Mock Redis cache
    '^@/lib/cache/redis-cache$': '<rootDir>/__mocks__/lib/cache/redis-cache.ts',
    // Mock new services
    '^@/lib/services/auth/mfa-service$':
      '<rootDir>/__mocks__/lib/services/auth/mfa-service.ts',
    '^@/lib/services/stripe/stripe-enhanced$':
      '<rootDir>/__mocks__/lib/services/stripe/stripe-enhanced.ts',
    '^@/lib/services/audit/audit-logger$':
      '<rootDir>/__mocks__/lib/services/audit/audit-logger.ts',
    '^@/lib/services/gdpr/gdpr-service$':
      '<rootDir>/__mocks__/lib/services/gdpr/gdpr-service.ts',
    '^@/lib/cache/redis-client$':
      '<rootDir>/__mocks__/lib/cache/redis-client.ts',
    '^@/lib/ui/toast$': '<rootDir>/__mocks__/lib/ui/toast.ts',
    '^@/lib/services/error/error-logger$':
      '<rootDir>/__mocks__/lib/services/error/error-logger.ts',
    // Mock UI components
    '^@/components/ui/button$': '<rootDir>/__mocks__/components/ui/button.tsx',
    '^@/components/ui/card$': '<rootDir>/__mocks__/components/ui/card.tsx',
    // Mock external dependencies
    otpauth: '<rootDir>/__mocks__/otpauth.ts',
    qrcode: '<rootDir>/__mocks__/qrcode.ts',
    ioredis: '<rootDir>/__mocks__/ioredis.ts',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
    '!playwright.config.ts',
    '!next.config.js',
    '!tailwind.config.js',
    '!postcss.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
  // Coverage goals to track progress:
  // - 3 months: 30% coverage
  // - 6 months: 60% coverage
  // - 1 year: 80% coverage
  testTimeout: 10000,
  maxWorkers: 4,
  workerIdleMemoryLimit: '512MB',
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-string-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // Enable manual mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
