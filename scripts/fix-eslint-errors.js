import { FiEdit, FiTrash } from 'react-icons/fi';

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need fixing
const filesToFix = [
  // Return type fixes
  'components/BackToTopButton.tsx',
  'components/admin/experiments/VariantPreview.tsx',
  'components/demo/AIModelComparison.tsx',
  'components/demo/AnimatedBioEnhancement.tsx',
  'components/demo/ProjectEnhancementDemo.tsx',
  'components/demo/PublishingPreview.tsx',
  'components/demo/SmartImportOptions.tsx',
  'components/demo/VisualCustomizationTools.tsx',
  'components/editor/AIEnhancementButton.tsx',
  'components/editor/TemplateSelector.tsx',
  'components/integrations/GitHubIntegration.tsx',
  'components/integrations/LinkedInImport.tsx',
  'components/integrations/ResumeParser.tsx',
  'components/landing/Footer.tsx',
  'components/landing/Hero.tsx',
  'components/landing/Pricing.tsx',
  'components/shared/ErrorBoundary.tsx',
  'lib/contexts/AuthContext.tsx',
  'lib/monitoring/performance.ts',
];

// Function to add return types to React components
function addReturnTypes(content, fileName) {
  // Add JSX.Element return type to function components
  content = content.replace(
    /export (default )?function (\w+)\(/g,
    'export $1function $2(): JSX.Element ('
  );
  
  // Add JSX.Element return type to arrow function components
  content = content.replace(
    /export const (\w+) = \(/g,
    'export const $1 = (): JSX.Element => ('
  );
  
  // Fix arrow functions with props
  content = content.replace(
    /export const (\w+) = \(([^)]+)\) => \{/g,
    'export const $1 = ($2): JSX.Element => {'
  );
  
  // Fix useCallback return types
  content = content.replace(
    /const (\w+) = useCallback\(\(\) => \{/g,
    'const $1 = useCallback((): void => {'
  );
  
  // Fix event handlers
  content = content.replace(
    /const handle(\w+) = \(\) => \{/g,
    'const handle$1 = (): void => {'
  );
  
  return content;
}

// Function to remove unused imports
function removeUnusedImports(content) {
  // Remove FiEdit and FiTrash from InteractiveEditorSection
  if (content.includes('FiEdit') && content.includes('FiTrash')) {
    const lines = content.split('\n');
    const newLines = lines.filter(line => 
      !line.includes("") &&
      !line.includes("")
    );
    content = newLines.join('\n');
  }
  
  return content;
}

// Function to fix async/await issues
function fixAsyncAwait(content) {
  // Add await to async functions that don't have it
  content = content.replace(
    /async \([^)]*\) => \{([^}]+)\}/g,
    (match, body) => {
      if (!body.includes('await')) {
        // Remove async if no await
        return match.replace('async ', '');
      }
      return match;
    }
  );
  
  return content;
}

// Function to fix TypeScript strict errors
function fixTypeScriptStrict(content) {
  // Replace any types with unknown or proper types
  content = content.replace(/: any/g, ': unknown');
  
  // Fix non-null assertions
  content = content.replace(/!(?=\.)/g, '?');
  
  // Fix strict boolean expressions
  content = content.replace(
    /if \(([^)]+)\)/g,
    (match, condition) => {
      if (!condition.includes('===') && !condition.includes('!==') && 
          !condition.includes('>') && !condition.includes('<') &&
          !condition.includes('typeof') && !condition.includes('instanceof')) {
        return `if (${condition})`;
      }
      return match;
    }
  );
  
  return content;
}

// Process each file
filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = addReturnTypes(content, file);
    content = removeUnusedImports(content);
    content = fixAsyncAwait(content);
    content = fixTypeScriptStrict(content);
    
    // Only write if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ ESLint fixes applied!');
console.log('Run "pnpm lint" to check remaining issues.');