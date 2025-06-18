#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**']
});

console.log(`Found ${testFiles.length} test files to check for missing parentheses`);

// Process each file
testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fileName = path.basename(filePath);

  // Pattern to find missing closing parentheses for createMockRequest or new NextRequest
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length - 2; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];
    const afterNextLine = lines[i + 2];
    
    // Check for patterns like:
    // const request = createMockRequest(
    //   'url'
    // <-- missing )
    // const response = await ...
    if ((currentLine.includes('createMockRequest(') || currentLine.includes('new NextRequest(')) &&
        !currentLine.includes(');') &&
        nextLine && nextLine.trim().startsWith("'") &&
        !nextLine.includes(');') &&
        afterNextLine && 
        (afterNextLine.trim().startsWith('const ') || 
         afterNextLine.trim().startsWith('let ') ||
         afterNextLine.trim().startsWith('const response') ||
         afterNextLine.trim() === '')) {
      
      // Insert closing parenthesis at the end of the URL line
      lines[i + 1] = lines[i + 1].trimEnd() + '\n    );';
      if (afterNextLine.trim() === '') {
        // Skip the empty line
        i++;
      }
      modified = true;
      console.log(`Fixed missing parenthesis in ${fileName} at line ${i + 2}`);
    }
  }
  
  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileName}`);
  }
});

console.log('\nDone! All test files have been checked for missing parentheses.');