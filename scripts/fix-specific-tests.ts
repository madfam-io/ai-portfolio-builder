import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

#!/usr/bin/env tsx

/**
 * Fix specific test issues that weren't caught by the first pass
 */

const fixes = [
  {
    // Fix HuggingFaceService import
    file: '__tests__/ai/huggingface-service.test.ts',
    fixes: [
      {
        old: `import HuggingFaceService from '@/lib/services/ai/huggingface';`,
        new: `import { HuggingFaceService } from '@/lib/ai/huggingface-service';`,
      },
    ],
  },
  {
    // Fix ai-store test
    file: '__tests__/lib/store/ai-store.test.ts',
    fixes: [
      {
        old: 'resetPreferences',
        new: 'resetModelPreferences',
      },
    ],
  },
  {
    // Fix portfolio-store test
    file: '__tests__/lib/store/portfolio-store.test.ts',
    fixes: [
      {
        old: 'reset()',
        new: 'clearPortfolios()',
      },
    ],
  },
  {
    // Fix ui-store test  
    file: '__tests__/lib/store/ui-store.test.ts',
    fixes: [
      {
        old: 'isSidebarOpen',
        new: 'sidebarOpen',
      },
      {
        old: 'closeSidebar',
        new: 'setSidebarOpen',
      },
    ],
  },
  {
    // Fix auth-store test
    file: '__tests__/lib/store/auth-store.test.ts',
    fixes: [
      {
        old: 'signOut()',
        new: 'logout()',
      },
    ],
  },
  {
    // Fix performance test
    file: '__tests__/lib/monitoring/performance.test.ts',
    fixes: [
      {
        old: 'mockFetch!',
        new: 'mockFetch',
      },
      {
        old: 'consoleSpy!',
        new: 'consoleSpy',
      },
    ],
  },
  {
    // Fix DraggableItem test
    file: '__tests__/components/editor/DraggableItem.test.tsx',
    fixes: [
      {
        old: 'screen.container.firstChild',
        new: 'screen.getByTestId("draggable-item")',
      },
    ],
  },
];

// Fix fetch mock patterns
const fixFetchMocks = (content: string): string => {
  // Fix response mock to include json method
  content = content.replace(
    /mockFetch\.mockResolvedValue\(\s*\{([^}]+)\}\s*\)/g,
    (match, props) => {
      if (!props.includes('json:')) {
        const newProps = props.trim().endsWith(',') ? props : props + ',';
        return `mockFetch.mockResolvedValue({\n${newProps}\n      json: async () => ({}),\n    })`;
      }
      return match;
    }
  );

  return content;
};

// Fix localStorage usage
const fixLocalStorage = (content: string): string => {
  if (content.includes('localStorage') && !content.includes('global.localStorage')) {
    // Add mock at the beginning of describe block
    content = content.replace(
      /describe\([^,]+,\s*\(\)\s*=>\s*\{/g,
      match => `${match}
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(), 
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  (global as unknown).localStorage = localStorageMock;
`
    );
  }
  return content;
};

// Fix matchMedia usage
const fixMatchMedia = (content: string): string => {
  if ((content.includes('matchMedia') || content.includes('useTheme')) && 
      !content.includes('window.matchMedia')) {
    content = content.replace(
      /describe\([^,]+,\s*\(\)\s*=>\s*\{/g,
      match => `${match}
  // Mock matchMedia
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
`
    );
  }
  return content;
};

// Main execution
async function main() {
  console.log('🔧 Fixing specific test issues...\n');

  // Fix specific files
  for (const fileConfig of fixes) {
    const filePath = join(process.cwd(), fileConfig.file);
    try {
      let content = readFileSync(filePath, 'utf-8');
      let modified = false;

      for (const fix of fileConfig.fixes) {
        if (content.includes(fix.old)) {
          content = content.replace(new RegExp(fix.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.new);
          modified = true;
        }
      }

      // Apply general fixes
      content = fixFetchMocks(content);
      content = fixLocalStorage(content);
      content = fixMatchMedia(content);

      if (modified || content !== readFileSync(filePath, 'utf-8')) {
        writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${fileConfig.file}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fileConfig.file}:`, error);
    }
  }

  // Fix all test files for common patterns
  const testFiles = [
    '__tests__/app/dashboard/page.test.tsx',
    '__tests__/components/landing/Features.test.tsx',
    '__tests__/components/landing/HowItWorks.test.tsx',
    '__tests__/components/landing/Templates.test.tsx',
  ];

  for (const file of testFiles) {
    const filePath = join(process.cwd(), file);
    try {
      let content = readFileSync(filePath, 'utf-8');
      const originalContent = content;

      content = fixFetchMocks(content);
      content = fixLocalStorage(content);
      content = fixMatchMedia(content);

      if (content !== originalContent) {
        writeFileSync(filePath, content);
        console.log(`✅ Fixed common patterns in: ${file}`);
      }
    } catch (error) {
      // File might not exist
    }
  }

  console.log('\n✨ Specific test fixes applied');
}

main().catch(console.error);