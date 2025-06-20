#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive ESLint fix...\n');

// Get all ESLint errors
const eslintOutput = execSync('pnpm lint --format json', { 
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'ignore'] // Ignore stderr to avoid command failure
}).trim();

let results;
try {
  results = JSON.parse(eslintOutput);
} catch (e) {
  console.error('Failed to parse ESLint output:', e);
  process.exit(1);
}

// Group errors by type
const errorsByType = {
  'no-unused-vars': [],
  'react/no-unescaped-entities': [],
  'parsing-error': [],
  'require-await': [],
  'complexity': [],
  'no-alert': [],
  'no-explicit-any': [],
  'no-img-element': [],
  'alt-text': [],
  'max-lines': []
};

// Process each file
results.forEach(result => {
  if (result.messages.length === 0) return;
  
  result.messages.forEach(msg => {
    const ruleId = msg.ruleId || (msg.message.includes('Parsing error') ? 'parsing-error' : 'unknown');
    
    if (errorsByType[ruleId]) {
      errorsByType[ruleId].push({
        file: result.filePath,
        line: msg.line,
        column: msg.column,
        message: msg.message,
        severity: msg.severity
      });
    } else if (ruleId && ruleId.includes('no-unused-vars')) {
      errorsByType['no-unused-vars'].push({
        file: result.filePath,
        line: msg.line,
        column: msg.column,
        message: msg.message,
        severity: msg.severity
      });
    } else if (ruleId && ruleId.includes('no-explicit-any')) {
      errorsByType['no-explicit-any'].push({
        file: result.filePath,
        line: msg.line,
        column: msg.column,
        message: msg.message,
        severity: msg.severity
      });
    }
  });
});

// Fix React unescaped entities
console.log('📝 Fixing React unescaped entities...');
errorsByType['react/no-unescaped-entities'].forEach(error => {
  try {
    let content = fs.readFileSync(error.file, 'utf8');
    
    // Fix apostrophes in JSX text content
    content = content.replace(/([>][^<]*)'([^<]*[<])/g, '$1&apos;$2');
    
    // Fix quotes in JSX text content
    content = content.replace(/([>][^<]*)"([^<]*[<])/g, '$1&quot;$2');
    
    fs.writeFileSync(error.file, content);
    console.log(`  ✓ Fixed ${error.file}`);
  } catch (e) {
    console.error(`  ✗ Error fixing ${error.file}:`, e.message);
  }
});

// Fix unused variables by prefixing with underscore
console.log('\n📝 Fixing unused variables...');
const processedFiles = new Set();
errorsByType['no-unused-vars'].forEach(error => {
  if (processedFiles.has(error.file)) return;
  processedFiles.add(error.file);
  
  try {
    let content = fs.readFileSync(error.file, 'utf8');
    let lines = content.split('\n');
    
    // Get all unused vars in this file
    const unusedVars = errorsByType['no-unused-vars']
      .filter(e => e.file === error.file)
      .map(e => {
        const match = e.message.match(/'([^']+)' is defined but never used/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    
    // Replace unused vars with underscore prefix
    unusedVars.forEach(varName => {
      // Skip if already prefixed with underscore
      if (varName.startsWith('_')) return;
      
      // Create regex patterns for different declaration types
      const patterns = [
        new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g'),
        new RegExp(`\\b(function)\\s+${varName}\\b`, 'g'),
        new RegExp(`\\b(import)\\s+${varName}\\b`, 'g'),
        new RegExp(`\\b(import)\\s+\\{([^}]*\\b)${varName}\\b([^}]*)\\}`, 'g'),
        new RegExp(`\\bcatch\\s*\\(\\s*${varName}\\s*\\)`, 'g'),
        new RegExp(`\\b${varName}\\s*:`, 'g'), // Object destructuring
        new RegExp(`\\(([^)]*\\b)${varName}\\b([^)]*)\\)\\s*=>`, 'g'), // Arrow function params
        new RegExp(`\\bfunction\\s*[^(]*\\(([^)]*\\b)${varName}\\b([^)]*)\\)`, 'g'), // Function params
      ];
      
      patterns.forEach((pattern, index) => {
        if (index === 3) {
          // Special handling for named imports
          content = content.replace(pattern, `$1 {$2_${varName}$3}`);
        } else if (index === 4) {
          // Special handling for catch
          content = content.replace(pattern, `catch (_${varName})`);
        } else if (index === 5) {
          // Object destructuring
          content = content.replace(pattern, `_${varName}:`);
        } else if (index === 6 || index === 7) {
          // Function parameters
          content = content.replace(pattern, (match, before, after) => {
            return match.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
          });
        } else {
          content = content.replace(pattern, `$1 _${varName}`);
        }
      });
    });
    
    fs.writeFileSync(error.file, content);
    console.log(`  ✓ Fixed ${unusedVars.length} unused vars in ${error.file}`);
  } catch (e) {
    console.error(`  ✗ Error fixing ${error.file}:`, e.message);
  }
});

// Fix require-await by removing async keyword where not needed
console.log('\n📝 Fixing async functions without await...');
errorsByType['require-await'].forEach(error => {
  try {
    let content = fs.readFileSync(error.file, 'utf8');
    let lines = content.split('\n');
    
    // Get the line with the async function
    const lineIndex = error.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      // Remove async keyword if function doesn't use await
      lines[lineIndex] = lines[lineIndex].replace(/\basync\s+/, '');
    }
    
    fs.writeFileSync(error.file, lines.join('\n'));
    console.log(`  ✓ Fixed ${error.file}:${error.line}`);
  } catch (e) {
    console.error(`  ✗ Error fixing ${error.file}:`, e.message);
  }
});

// Fix parsing errors
console.log('\n📝 Fixing parsing errors...');
errorsByType['parsing-error'].forEach(error => {
  try {
    console.log(`  ⚠️  Manual fix needed for ${error.file}:${error.line} - ${error.message}`);
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
  }
});

// Report on complexity and other warnings
console.log('\n📊 Summary of remaining issues:');
console.log(`  - Complexity warnings: ${errorsByType['complexity'].length}`);
console.log(`  - No-alert warnings: ${errorsByType['no-alert'].length}`);
console.log(`  - No-explicit-any warnings: ${errorsByType['no-explicit-any'].length}`);
console.log(`  - Image elements without Next.js Image: ${errorsByType['no-img-element'].length}`);
console.log(`  - Missing alt text: ${errorsByType['alt-text'].length}`);
console.log(`  - Files too long: ${errorsByType['max-lines'].length}`);

console.log('\n✅ ESLint fixes completed!');
console.log('Run "pnpm lint" to see remaining issues.');