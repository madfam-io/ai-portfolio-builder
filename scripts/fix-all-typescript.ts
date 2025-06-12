#!/usr/bin/env tsx

/**
 * Comprehensive TypeScript fix for all test files
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function findTestFiles(dir: string): string[] {
  const files: string[] = [];
  
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      files.push(...findTestFiles(fullPath));
    } else if (item.endsWith('.test.tsx') || item.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixTypeScriptIssues(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Fix 1: DragDropContext specific fixes
  if (filePath.includes('DragDropContext.test')) {
    // First, revert the broken changes
    content = content.replace(/as React\.ReactNode/g, 'as any');
    
    // Fix function children properly
    content = content.replace(
      /<DragDropProvider items=\{mockItems as any\} onReorder=\{(\w+)\}>\s*\{(item(?:\s*:\s*any)?)\s*=>/g,
      '<DragDropProvider items={mockItems as any} onReorder={$1}>\n          {(($2: any) =>'
    );
    
    content = content.replace(
      /\{renderItem as any\}/g,
      '{renderItem as any}'
    );
    
    // Fix the broken DraggableItem line
    content = content.replace(
      /key=\{item\.id\) as React\.ReactNode\}/g,
      'key={item.id}'
    );
    
    // Fix the integration test
    content = content.replace(
      /\{\(\(item, index: any\) => \(/g,
      '{((item: any, index: any) => ('
    );
    
    // Add missing closing parenthesis
    content = content.replace(
      /\)\}\s*<\/DragDropProvider>/g,
      ')) as any}\n        </DragDropProvider>'
    );
  }
  
  // Fix 2: Performance test specific
  if (filePath.includes('performance.test')) {
    // Already fixed by previous script
  }
  
  // Fix 3: Portfolio repository test
  if (filePath.includes('portfolio.repository.test')) {
    // Fix the findPublished call
    content = content.replace(
      /await repository\.findPublished\(\$1\)/g,
      'await repository.findPublished()'
    );
  }
  
  // Fix 4: RealTimePreview test
  if (filePath.includes('RealTimePreview.test')) {
    // onTemplateChange was already removed
  }
  
  // Fix 5: Add type annotations to all render prop patterns
  content = content.replace(
    /\{(item|child|children)\s*=>\s*\(/g,
    '{($1: any) => ('
  );
  
  // Fix 6: Fix mock function children
  content = content.replace(
    /<(\w+)[^>]*>\s*\{(mock\w+|jest\.fn\([^)]*\))\}\s*<\/\1>/g,
    '<$1>{$2 as any}</$1>'
  );
  
  // Fix 7: Type all jest.fn() calls
  content = content.replace(
    /const (mock\w+) = jest\.fn\(\)/g,
    'const $1 = jest.fn() as jest.Mock'
  );
  
  if (content !== originalContent) {
    writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🔧 Comprehensive TypeScript fix...\n');
  
  const testFiles = findTestFiles(join(process.cwd(), '__tests__'));
  console.log(`Found ${testFiles.length} test files\n`);
  
  let fixedCount = 0;
  for (const file of testFiles) {
    if (fixTypeScriptIssues(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✨ Fixed ${fixedCount} test files`);
  
  console.log('\nNow checking TypeScript errors...');
}

main().catch(console.error);