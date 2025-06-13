import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

#!/usr/bin/env tsx

async function fixApiTests() {
  console.log('🔧 Fixing API route tests...\n');

  // Find all API test files
  const apiTestFiles = execSync('find __tests__/api -name "*.test.ts" -type f', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  for (const file of apiTestFiles) {
    try {
      const filePath = path.join(process.cwd(), file);
      let content = await fs.readFile(filePath, 'utf-8');
      let modified = false;

      // Fix 1: Add NextRequest/NextResponse imports
      if (!content.includes('import { NextRequest')) {
        content = `import { NextRequest, NextResponse } from 'next/server';\n` + content;
        modified = true;
      }

      // Fix 2: Fix mock request creation
      content = content.replace(
        /const req = \{([^}]+)\}/g,
        `const req = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify($1)
        })`
      );

      // Fix 3: Fix response handling
      content = content.replace(
        /const response = await ([^(]+)\(req\)/g,
        'const response = await $1(req as NextRequest)'
      );

      // Fix 4: Fix response assertions
      content = content.replace(
        /expect\(response\.status\)/g,
        'expect(response.status)'
      );
      
      content = content.replace(
        /const body = await response\.json\(\)/g,
        'const body = await response.json()'
      );

      // Fix 5: Add proper mocks for Supabase
      if (content.includes('@/lib/supabase/server') && !content.includes('mockSupabaseClient')) {
        const supabaseMock = `
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      })
    }),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    })
  }),
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    })
  }
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));
`;
        content = supabaseMock + '\n' + content;
        modified = true;
      }

      // Fix 6: Fix HuggingFace API mocks
      if (content.includes('HUGGINGFACE_API_KEY')) {
        content = content.replace(
          /process\.env\.HUGGINGFACE_API_KEY = undefined/g,
          "delete process.env.HUGGINGFACE_API_KEY"
        );
        
        content = content.replace(
          /process\.env\.HUGGINGFACE_API_KEY = 'test-key'/g,
          "process.env.HUGGINGFACE_API_KEY = 'test-key'"
        );
        modified = true;
      }

      // Fix 7: Add fetch mock if missing
      if (!content.includes('global.fetch') && content.includes('fetch')) {
        const fetchMock = `
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown;

beforeEach(() => {
  mockFetch.mockClear();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ generated_text: 'Mock AI response' }),
    text: async () => 'Mock response',
    headers: new Headers()
  });
});
`;
        content = fetchMock + '\n' + content;
        modified = true;
      }

      if (modified) {
        await fs.writeFile(filePath, content);
        console.log(`✅ Fixed: ${file}`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}:`, error);
    }
  }

  console.log('\n✨ API test fixes applied!');
}

// Run the fixes
fixApiTests().catch(console.error);