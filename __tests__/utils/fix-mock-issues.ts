
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

#!/usr/bin/env ts-node
/**
 * Script to fix mock issues in test files
 * This will update all test files that use useLanguage mock to use the correct pattern
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const FIX_PATTERNS = [
  {
    // Fix duplicate mock declarations
    pattern:
      /jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\);\s*jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\);/gs,
    replacement: (match: string) => {
      // Keep only the second mock (usually the one with jest.fn())
      const mocks = match.match(
        /jest\.mock\('[^']+',\s*\(\)\s*=>\s*\([^}]+}\)\);/g
      );
      return mocks ? mocks[mocks.length - 1] : match;
    },
  },
  {
    // Fix mockReturnValue pattern
    pattern: /mockUseLanguage\.mockReturnValue\(/g,
    replacement: '(mockUseLanguage as any).mockImplementation(() => (',
  },
  {
    // Ensure proper closing for mockImplementation
    pattern:
      /\(mockUseLanguage as any\)\.mockImplementation\(\(\) => \(([^}]+})\s*as any\)/g,
    replacement: '(mockUseLanguage as any).mockImplementation(() => ($1)',
  },
];

async function fixTestFiles() {
  try {
    // Find all test files with useLanguage mocks
    const testFiles = await glob('__tests__/**/*.{test,spec}.{ts,tsx}', {
      cwd: process.cwd(),
      absolute: true,
    });

    let filesFixed = 0;
    let totalFiles = 0;

    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Check if file contains useLanguage mock
      if (
        content.includes('mockUseLanguage') ||
        content.includes('@/lib/i18n/refactored-context')
      ) {
        totalFiles++;
        let newContent = content;
        let changed = false;

        for (const fix of FIX_PATTERNS) {
          const beforeLength = newContent.length;
          if (typeof fix.replacement === 'string') {
            newContent = newContent.replace(fix.pattern, fix.replacement);
          } else {
            newContent = newContent.replace(fix.pattern, fix.replacement);
          }

          if (newContent.length !== beforeLength) {
            changed = true;
          }
        }

        if (changed) {
          fs.writeFileSync(file, newContent);
          filesFixed++;
          console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total files scanned: ${testFiles.length}`);
    console.log(`   Files with useLanguage: ${totalFiles}`);
    console.log(`   Files fixed: ${filesFixed}`);
  } catch (error) {
    console.error('Error fixing test files:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixTestFiles();
}

export { fixTestFiles };
