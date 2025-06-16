#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CoverageData {
  [filePath: string]: {
    path: string;
    statementMap: any;
    fnMap: any;
    branchMap: any;
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
  };
}

/**
 * Get files with low test coverage
 */
function getUncoveredFiles(): string[] {
  try {
    // Run coverage report and output to JSON
    execSync('pnpm test -- --coverage --coverageReporters=json --silent', {
      stdio: 'pipe',
    });

    const coveragePath = path.join(
      process.cwd(),
      'coverage',
      'coverage-final.json'
    );

    if (!fs.existsSync(coveragePath)) {
      console.error('Coverage report not found. Running tests first...');
      return [];
    }

    const coverageData: CoverageData = JSON.parse(
      fs.readFileSync(coveragePath, 'utf8')
    );
    const uncoveredFiles: string[] = [];

    // Find files with less than 50% coverage
    for (const [filePath, data] of Object.entries(coverageData)) {
      const statements = Object.values(data.s);
      const covered = statements.filter(count => count > 0).length;
      const total = statements.length;
      const coverage = total > 0 ? (covered / total) * 100 : 0;

      if (
        coverage < 50 &&
        !filePath.includes('__tests__') &&
        !filePath.includes('.test.')
      ) {
        uncoveredFiles.push(filePath);
      }
    }

    return uncoveredFiles.sort();
  } catch (error) {
    console.error('Error getting coverage data:', error);
    return [];
  }
}

/**
 * Generate test template for a given file
 */
function generateTestTemplate(filePath: string): string {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = fileName.replace(/\.(ts|tsx|js|jsx)$/, '');
  const isComponent =
    filePath.includes('/components/') || fileName.endsWith('.tsx');
  const isApiRoute = filePath.includes('/api/');
  const relativePath = path.relative(process.cwd(), filePath);

  if (isComponent) {
    return `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${fileNameWithoutExt} } from '@/${relativePath.replace(/\.(ts|tsx)$/, '')}';

describe('${fileNameWithoutExt}', () => {
  it('should render without crashing', () => {
    render(<${fileNameWithoutExt} />);
    // Add specific element checks based on the component
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<${fileNameWithoutExt} />);
    
    // Add interaction tests
  });

  it('should apply correct styles', () => {
    const { container } = render(<${fileNameWithoutExt} />);
    
    // Add style assertions
  });
});`;
  } else if (isApiRoute) {
    return `import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/${relativePath.replace(/\.(ts|tsx)$/, '')}';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('${fileNameWithoutExt} API Route', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('GET', () => {
    it('should handle GET request successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000${filePath}');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000${filePath}');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });
  });
});`;
  } else {
    // Regular TypeScript file
    return `import { ${fileNameWithoutExt} } from '@/${relativePath.replace(/\.(ts|tsx)$/, '')}';

describe('${fileNameWithoutExt}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export expected functions/classes', () => {
    expect(${fileNameWithoutExt}).toBeDefined();
  });

  // Add specific tests based on the module's functionality
});`;
  }
}

/**
 * Create test file for a given source file
 */
function createTestFile(filePath: string): void {
  const relativePath = path.relative(process.cwd(), filePath);
  const testDir = path.join(
    process.cwd(),
    '__tests__',
    path.dirname(relativePath)
  );
  const fileName = path.basename(filePath);
  const testFileName = fileName.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1');
  const testFilePath = path.join(testDir, testFileName);

  // Skip if test already exists
  if (fs.existsSync(testFilePath)) {
    console.log(`Test already exists: ${testFilePath}`);
    return;
  }

  // Create directory if it doesn't exist
  fs.mkdirSync(testDir, { recursive: true });

  // Generate and write test template
  const testContent = generateTestTemplate(filePath);
  fs.writeFileSync(testFilePath, testContent);

  console.log(`Created test: ${testFilePath}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🧪 Generating tests for uncovered files...\n');

  const uncoveredFiles = getUncoveredFiles();

  if (uncoveredFiles.length === 0) {
    console.log('No files with low coverage found!');
    return;
  }

  console.log(`Found ${uncoveredFiles.length} files with < 50% coverage:\n`);

  // Group files by directory
  const filesByDir = uncoveredFiles.reduce(
    (acc, file) => {
      const dir = path.dirname(file);
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Display files and create tests
  let created = 0;
  for (const [dir, files] of Object.entries(filesByDir)) {
    console.log(`\n${dir}:`);
    for (const file of files) {
      console.log(`  - ${path.basename(file)}`);
      try {
        createTestFile(file);
        created++;
      } catch (error) {
        console.error(`  ❌ Error creating test for ${file}:`, error);
      }
    }
  }

  console.log(`\n✅ Created ${created} test files`);
  console.log('\n💡 Next steps:');
  console.log('1. Review and customize the generated tests');
  console.log('2. Run: pnpm test to verify they work');
  console.log('3. Add specific test cases for your business logic');
}

// Run the script
main().catch(console.error);
