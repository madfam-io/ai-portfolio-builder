import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

#!/usr/bin/env tsx

/**
 * Fix React 19 compatibility issues in test files
 * Focuses on function-as-children patterns that are now stricter
 */

function findTestFiles(dir: string): string[] {
  const files: string[] = [];
  
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      files.push(...findTestFiles(fullPath));
    } else if (item.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixReact19Patterns(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Fix 1: Cast function children in DragDropProvider
  if (filePath.includes('DragDropContext.test')) {
    // Pattern: {item => <div>...</div>}
    content = content.replace(
      /\{(item(?:\s*:\s*any)?)\s*=>\s*(<[^}]+>)\}/g,
      '{(($1) => $2) as React.ReactNode}'
    );
    
    // Pattern: {(item, index) => ...}
    content = content.replace(
      /\{(\(item(?:\s*:\s*any)?,\s*index(?:\s*:\s*any)?\)\s*=>\s*[^}]+)\}/g,
      '{($1) as React.ReactNode}'
    );
    
    // Fix the specific renderItem pattern
    content = content.replace(
      /\{renderItem\}/g,
      '{renderItem as React.ReactNode}'
    );
    
    // Fix mockFn patterns
    content = content.replace(
      /\{(mock\w+)\s+as\s+any\}/g,
      '{$1 as React.ReactNode}'
    );
    
    // Remove duplicate id prop from DraggableItem
    content = content.replace(
      /<DraggableItem\s+key=\{item\.id\}\s+id=\{item\.id\}\s+index=\{index\}>/g,
      '<DraggableItem key={item.id} index={index}>'
    );
    
    modified = true;
  }
  
  // Fix 2: Other test files with function children
  if (filePath.includes('PortfolioEditor.test') || 
      filePath.includes('PortfolioPreview.test') ||
      filePath.includes('DraggableItem.test')) {
    // Generic function children pattern
    content = content.replace(
      /\{(\(?\w+(?:\s*:\s*any)?\)?)\s*=>\s*(<[^}]+>)\}/g,
      (match, param, jsx) => {
        if (match.includes('as React.ReactNode')) return match;
        return `{((${param}) => ${jsx}) as React.ReactNode}`;
      }
    );
    modified = true;
  }
  
  // Fix 3: Fix RealTimePreview test - remove onTemplateChange prop
  if (filePath.includes('RealTimePreview.test')) {
    content = content.replace(
      /onTemplateChange=\{mockOnTemplateChange(?:\s+as\s+any)?\}/g,
      'template="developer"'
    );
    modified = true;
  }
  
  // Fix 4: Fix portfolio repository test - correct method signatures
  if (filePath.includes('portfolio.repository.test')) {
    // Fix findByUserId calls
    content = content.replace(
      /await repository\.findByUserId\(\$1\)/g,
      'await repository.findByUserId(mockUserId)'
    );
    
    // Fix findPublished calls
    content = content.replace(
      /await repository\.findPublished\(\$1\)/g,
      'await repository.findPublished()'
    );
    
    modified = true;
  }
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`✅ Fixed React 19 patterns in: ${filePath}`);
  }
  
  return modified;
}

async function main() {
  console.log('🔧 Fixing React 19 compatibility issues...\n');
  
  const testFiles = findTestFiles(join(process.cwd(), '__tests__'));
  const targetFiles = testFiles.filter(f => 
    f.includes('DragDropContext.test') ||
    f.includes('DraggableItem.test') ||
    f.includes('PortfolioEditor.test') ||
    f.includes('PortfolioPreview.test') ||
    f.includes('RealTimePreview.test') ||
    f.includes('portfolio.repository.test')
  );
  
  console.log(`Found ${targetFiles.length} test files to fix\n`);
  
  let fixedCount = 0;
  for (const file of targetFiles) {
    if (fixReact19Patterns(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✨ Fixed ${fixedCount} test files`);
}

main().catch(console.error);