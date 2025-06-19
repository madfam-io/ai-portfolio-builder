#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to check for class mocking issues...`);

let totalFixed = 0;

testFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix HuggingFaceService mocking
  if (content.includes("jest.mock('@/lib/ai/huggingface-service')") && content.includes('HuggingFaceService.mockImplementation')) {
    // Replace the mock with proper module factory
    content = content.replace(
      /jest\.mock\('@\/lib\/ai\/huggingface-service'\);/g,
      `jest.mock('@/lib/ai/huggingface-service', () => {
  return {
    HuggingFaceService: jest.fn().mockImplementation(() => ({
      getAvailableModels: jest.fn(),
      enhanceBio: jest.fn(),
      optimizeProjectDescription: jest.fn(),
      recommendTemplate: jest.fn(),
      healthCheck: jest.fn(),
      getUsageStats: jest.fn(),
    })),
  };
});`
    );
    
    // Remove the @ts-ignore and mockImplementation in beforeEach
    content = content.replace(
      /\/\/ @ts-ignore\s*\n\s*HuggingFaceService\.mockImplementation\(\(\) => mockHuggingFaceInstance\);/g,
      `const MockedHuggingFaceService = HuggingFaceService as jest.MockedClass<typeof HuggingFaceService>;
    MockedHuggingFaceService.mockImplementation(() => mockHuggingFaceInstance);`
    );
    
    modified = true;
  }

  // Fix other service mocks that follow similar pattern
  const servicePattern = /jest\.mock\('(@\/lib\/[^']+)'\);\s*.*?(\w+Service)\.mockImplementation/gs;
  if (servicePattern.test(content)) {
    content = content.replace(servicePattern, (match, importPath, serviceName) => {
      return `jest.mock('${importPath}', () => ({
  ${serviceName}: jest.fn(),
}));`;
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed class mocking in: ${file}`);
  }
});

console.log(`\n✨ Fixed class mocking in ${totalFixed} test files`);