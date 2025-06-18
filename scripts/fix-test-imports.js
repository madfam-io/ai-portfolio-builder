#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**']
});

console.log(`Found ${testFiles.length} test files to process`);

// Process each file
testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const isComponentTest = filePath.endsWith('.tsx');
  const fileName = path.basename(filePath);

  // 1. Fix @jest/globals import
  if (!content.includes('@jest/globals')) {
    const jestImports = [];
    
    // Check which jest globals are used
    if (content.includes('describe(') || content.includes('describe.')) {
      jestImports.push('describe');
    }
    if (content.includes('test(') || content.includes('it(') || content.includes('test.') || content.includes('it.')) {
      jestImports.push('test');
      if (content.includes('it(')) jestImports.push('it');
    }
    if (content.includes('expect(')) {
      jestImports.push('expect');
    }
    if (content.includes('beforeEach(')) {
      jestImports.push('beforeEach');
    }
    if (content.includes('afterEach(')) {
      jestImports.push('afterEach');
    }
    if (content.includes('beforeAll(')) {
      jestImports.push('beforeAll');
    }
    if (content.includes('afterAll(')) {
      jestImports.push('afterAll');
    }
    if (content.includes('jest.')) {
      jestImports.push('jest');
    }

    if (jestImports.length > 0) {
      const importStatement = `import { ${jestImports.join(', ')} } from '@jest/globals';\n`;
      
      // Find the right place to insert the import
      const jsdomMatch = content.match(/\/\*\*\s*\n\s*\*\s*@jest-environment\s+jsdom\s*\n\s*\*\/\s*\n/);
      if (jsdomMatch) {
        // Insert after jsdom comment
        content = content.replace(jsdomMatch[0], jsdomMatch[0] + '\n' + importStatement);
      } else {
        // Insert at the beginning
        content = importStatement + content;
      }
      modified = true;
      console.log(`Added @jest/globals import to ${fileName}`);
    }
  }

  // 2. Fix createClient imports for API route tests
  if (content.includes("from '@/lib/supabase/server'") && 
      content.includes('createClient') && 
      !content.includes('setupCommonMocks')) {
    
    // Add setupCommonMocks import
    if (!content.includes('api-route-test-helpers')) {
      const importLine = "import { setupCommonMocks, createMockRequest } from '@/tests/utils/api-route-test-helpers';\n";
      
      // Find where to insert it
      const lastImportMatch = content.match(/^import.*from.*;$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const insertPos = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertPos) + '\n' + importLine + content.slice(insertPos);
      }
    }

    // Remove direct createClient mock
    content = content.replace(/jest\.mock\('@\/lib\/supabase\/server'[^}]+}\);?\s*\n?/gs, '');
    
    // Add setupCommonMocks() call in beforeEach or at the top of describe
    if (!content.includes('setupCommonMocks()')) {
      // Find describe block
      const describeMatch = content.match(/describe\([^{]+{\s*\n/);
      if (describeMatch) {
        const insertPos = content.indexOf(describeMatch[0]) + describeMatch[0].length;
        content = content.slice(0, insertPos) + '  setupCommonMocks();\n\n' + content.slice(insertPos);
      }
    }
    
    modified = true;
    console.log(`Fixed createClient usage in ${fileName}`);
  }

  // 3. Fix act() imports for component tests
  if (content.includes('act(') && !content.includes("from '@testing-library/react'") && !content.includes('act }')) {
    // Check if already importing from RTL
    const rtlImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]@testing-library\/react['"]/);
    if (rtlImportMatch) {
      const imports = rtlImportMatch[1];
      if (!imports.includes('act')) {
        content = content.replace(
          rtlImportMatch[0],
          `import { ${imports.trim()}, act } from '@testing-library/react'`
        );
        modified = true;
        console.log(`Added act import to existing RTL import in ${fileName}`);
      }
    } else if (isComponentTest) {
      // Add new RTL import with act
      const importLine = "import { act } from '@testing-library/react';\n";
      const lastImportMatch = content.match(/^import.*from.*;$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const insertPos = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertPos) + '\n' + importLine + content.slice(insertPos);
        modified = true;
        console.log(`Added act import to ${fileName}`);
      }
    }
  }

  // 4. Fix component test mocks
  if (isComponentTest && !fileName.includes('test-utils') && !fileName.includes('mock')) {
    // Check if useLanguage is used but not mocked
    if ((content.includes('useLanguage') || content.includes('EditorContent') || 
         content.includes('EditorSidebar') || content.includes('Dashboard')) && 
        !content.includes("jest.mock('@/lib/i18n/refactored-context')")) {
      
      // Add useLanguage mock
      const mockCode = `
// Mock useLanguage hook
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: {
      welcomeMessage: 'Welcome',
      heroTitle: 'Create Your Portfolio',
      getStarted: 'Get Started',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      enhanceWithAI: 'Enhance with AI',
      publish: 'Publish',
      preview: 'Preview',
      // Add more translations as needed
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
`;
      
      // Find where to insert mock (after imports, before first jest.mock or describe)
      const firstMockMatch = content.match(/jest\.mock\(/);
      const describeMatch = content.match(/describe\(/);
      
      let insertPos;
      if (firstMockMatch) {
        insertPos = content.indexOf(firstMockMatch[0]);
      } else if (describeMatch) {
        insertPos = content.indexOf(describeMatch[0]);
      } else {
        // Insert after imports
        const lastImportMatch = content.match(/^import.*from.*;$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          insertPos = content.indexOf(lastImport) + lastImport.length + 1;
        }
      }
      
      if (insertPos) {
        content = content.slice(0, insertPos) + mockCode + '\n' + content.slice(insertPos);
        modified = true;
        console.log(`Added useLanguage mock to ${fileName}`);
      }
    }

    // Check if useApp is used but not mocked
    if (content.includes('useApp') && !content.includes("jest.mock('@/hooks/useApp')")) {
      const mockCode = `
// Mock useApp hook
jest.mock('@/hooks/useApp', () => ({
  useApp: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
    error: null,
  }),
}));
`;
      
      // Insert after useLanguage mock or after imports
      const languageMockMatch = content.match(/jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\);?\s*\n?/gs);
      let insertPos;
      
      if (languageMockMatch) {
        insertPos = content.indexOf(languageMockMatch[0]) + languageMockMatch[0].length;
      } else {
        const lastImportMatch = content.match(/^import.*from.*;$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          insertPos = content.indexOf(lastImport) + lastImport.length + 1;
        }
      }
      
      if (insertPos) {
        content = content.slice(0, insertPos) + mockCode + content.slice(insertPos);
        modified = true;
        console.log(`Added useApp mock to ${fileName}`);
      }
    }
  }

  // Write the file if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileName}`);
  }
});

console.log('\nDone! All test files have been processed.');