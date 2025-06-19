#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix supabase mock factory parameter types
  if (filePath.includes('supabase-mock-factory.ts')) {
    // Fix all occurrences of the createClient function parameters
    content = content.replace(
      /\(_url, _key, _options\)/g,
      '(_url: string, _key: string, _options?: any)'
    );
  }

  // Fix logger.error call in custom-domain route
  if (
    filePath.includes('custom-domain/route.ts') &&
    !filePath.includes('status')
  ) {
    content = content.replace(
      /logger\.error\('Custom domain management error:', error\)/g,
      "logger.error('Custom domain management error:', { error: error instanceof Error ? error.message : String(error) })"
    );
  }

  // Fix billing page - replace all occurrences
  if (filePath.includes('settings/billing/page.tsx')) {
    // Replace remaining instances
    content = content.replace(
      /subscription\?\.plan/g,
      'subscription?.subscription_tier'
    );
    content = content.replace(
      /subscription\?\.status/g,
      'subscription?.subscription_status'
    );
  }

  // Fix HfInference usage in huggingface-service.ts
  if (filePath.includes('huggingface-service.ts')) {
    // Replace HfInference class usage with a mock implementation
    content = content.replace(
      /const hf = new HfInference\(apiKey\);/g,
      `const hf = {
      textGeneration: async (params: any) => {
        const response = await fetch(\`https://api-inference.huggingface.co/models/\${params.model}\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${apiKey}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: params.inputs,
            parameters: params.parameters || {},
          }),
        });
        
        if (!response.ok) {
          throw new Error(\`HuggingFace API error: \${response.statusText}\`);
        }
        
        return await response.json();
      }
    };`
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  }
}

// Files to fix
const filesToFix = [
  '__tests__/utils/supabase-mock-factory.ts',
  'app/api/v1/portfolios/[id]/custom-domain/route.ts',
  'app/settings/billing/page.tsx',
  'lib/ai/huggingface-service.ts',
];

console.log('Fixing final remaining errors...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Finished fixing final remaining errors');
