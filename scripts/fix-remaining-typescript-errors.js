#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix logger.error calls with proper Error type
  if (
    filePath.includes('custom-domain/route.ts') &&
    !filePath.includes('status')
  ) {
    content = content.replace(
      /logger\.error\('([^']+)', error\)/g,
      "logger.error('$1', error instanceof Error ? error : new Error(String(error)))"
    );
  }

  // Fix logger.error calls in status route
  if (filePath.includes('custom-domain/status/route.ts')) {
    content = content.replace(
      /logger\.error\('([^']+)', error\)/g,
      "logger.error('$1', error instanceof Error ? error : new Error(String(error)))"
    );

    // Fix getServerUser import
    content = content.replace(
      "import { getServerUser } from '@/lib/api/middleware/auth';",
      "import { requireAuth } from '@/lib/api/middleware/auth';\n\nconst getServerUser = async () => {\n  const supabase = createClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.SUPABASE_SERVICE_ROLE_KEY!\n  );\n  const { data: { user } } = await supabase.auth.getUser();\n  return user;\n};"
    );
  }

  // Fix payment success page
  if (filePath.includes('payment/success/page.tsx')) {
    content = content.replace(/refreshLimits/g, 'refetch');
  }

  // Fix billing page imports and subscription usage
  if (filePath.includes('settings/billing/page.tsx')) {
    // Add table import
    if (!content.includes("'@/components/ui/table'")) {
      content = content.replace(
        "import { Badge } from '@/components/ui/badge';",
        "import { Badge } from '@/components/ui/badge';\nimport {\n  Table,\n  TableBody,\n  TableCell,\n  TableHead,\n  TableHeader,\n  TableRow,\n} from '@/components/ui/table';"
      );
    }

    // Fix subscription property access
    content = content.replace(/subscription\.subscription/g, 'subscription');
    content = content.replace(/subscription\.isLoading/g, 'isLoading');
  }

  // Fix auth provider error handling
  if (filePath.includes('auth-provider.tsx')) {
    content = content.replace(
      /logger\.error\('([^']+)', error\)/g,
      "logger.error('$1', error instanceof Error ? error : new Error(String(error)))"
    );
  }

  // Fix TemplateSelectionWizard type issue
  if (filePath.includes('TemplateSelectionWizard.tsx')) {
    content = content.replace(
      /value="([^"]+)"\s+checked={state\.selectedTemplate === '([^']+)'}/g,
      'value="$1" checked={state.selectedTemplate === "$2" as TemplateType}'
    );

    // Fix the specific line with type assertion
    content = content.replace(
      /onChange=\{e => setState\({ \.\.\.state, selectedTemplate: e\.target\.value \}\)\}/g,
      'onChange={e => setState({ ...state, selectedTemplate: e.target.value as TemplateType })}'
    );
  }

  // Fix HuggingFaceService method signatures
  if (filePath.includes('huggingface-service.ts')) {
    // Fix async method signatures
    content = content.replace(
      /recommendTemplate\(context: TemplateRecommendationContext\): TemplateRecommendation \{/g,
      'async recommendTemplate(context: TemplateRecommendationContext): Promise<TemplateRecommendation> {'
    );

    content = content.replace(
      /scoreContent\(content: ContentToScore\): ContentScore \{/g,
      'async scoreContent(content: ContentToScore): Promise<ContentScore> {'
    );

    content = content.replace(
      /getUsageStats\(\): AIUsageStats \{/g,
      'async getUsageStats(): Promise<AIUsageStats> {'
    );

    // Add HuggingFace inference types if not present
    if (!content.includes('type HfInference')) {
      content = content.replace(
        "import { logger } from '../utils/logger';",
        `import { logger } from '../utils/logger';

// Temporary type definitions for @huggingface/inference
type HfInference = any;
type TextGenerationOutput = {
  generated_text: string;
};`
      );
    }
  }

  // Fix auth middleware error handling
  if (filePath.includes('auth/middleware.ts')) {
    content = content.replace(
      /logger\.error\('([^']+)', error\)/g,
      "logger.error('$1', error instanceof Error ? error : new Error(String(error)))"
    );
  }

  // Fix portfolio validation generics
  if (filePath.includes('validations/portfolio.ts')) {
    // Replace the problematic generic constraint usage
    content = content.replace(
      /export function generateTechStack<T extends PortfolioFormData>/g,
      'export function generateTechStack<T extends Record<string, any>>'
    );

    // Fix the type assignments
    content = content.replace(
      /data\[section\] = \{/g,
      '(data as any)[section] = {'
    );

    content = content.replace(
      /data\[section\] = processedItems as T\[Extract<keyof T, string>\];/g,
      '(data as any)[section] = processedItems;'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  }
}

// Files to fix
const filesToFix = [
  'app/api/v1/portfolios/[id]/custom-domain/route.ts',
  'app/api/v1/portfolios/[id]/custom-domain/status/route.ts',
  'app/payment/success/page.tsx',
  'app/settings/billing/page.tsx',
  'components/auth/auth-provider.tsx',
  'components/templates/TemplateSelectionWizard.tsx',
  'lib/ai/huggingface-service.ts',
  'lib/auth/middleware.ts',
  'lib/validations/portfolio.ts',
];

console.log('Fixing remaining TypeScript errors...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Finished fixing TypeScript errors');
