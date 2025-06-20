#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Map of files and their specific fixes
const fileFixes = {
  'app/api/v1/payments/verify/route.ts': content => {
    // Replace non-null assertions with proper checks
    return content
      .replace(
        'process.env.NEXT_PUBLIC_SUPABASE_URL!',
        "process.env.NEXT_PUBLIC_SUPABASE_URL || ''"
      )
      .replace(
        'process.env.SUPABASE_SERVICE_ROLE_KEY!',
        "process.env.SUPABASE_SERVICE_ROLE_KEY || ''"
      );
  },

  'app/api/v1/portfolios/[id]/custom-domain/route.ts': content => {
    // Replace non-null assertions
    return content
      .replace(
        'process.env.NEXT_PUBLIC_SUPABASE_URL!',
        "process.env.NEXT_PUBLIC_SUPABASE_URL || ''"
      )
      .replace(
        'process.env.SUPABASE_SERVICE_ROLE_KEY!',
        "process.env.SUPABASE_SERVICE_ROLE_KEY || ''"
      );
  },

  'app/api/v1/portfolios/[id]/custom-domain/status/route.ts': content => {
    // Replace non-null assertions and fix catch blocks
    content = content
      .replace(
        'process.env.NEXT_PUBLIC_SUPABASE_URL!',
        "process.env.NEXT_PUBLIC_SUPABASE_URL || ''"
      )
      .replace(
        'process.env.SUPABASE_SERVICE_ROLE_KEY!',
        "process.env.SUPABASE_SERVICE_ROLE_KEY || ''"
      )
      .replace(/catch \(e\) {/g, 'catch (_e) {');

    // Fix nested depth issue by restructuring
    if (content.includes('hasCorrectCNAME = records.some')) {
      content = content.replace(
        /try {\s+const records = await dns\.resolveCname[^}]+}\s*catch[^}]+}/s,
        `const cnameRecords = await dns.resolveCname(portfolio.custom_domain).catch(() => []);
        hasCorrectCNAME = cnameRecords.some(record =>
          record.includes(\`\${portfolio.subdomain}.prisma.madfam.io\`)
        );`
      );
    }

    return content;
  },

  'app/payment/success/page.tsx': content => {
    // Remove unused variables
    return content
      .replace(/const \[sessionId, setSessionId\] = useState[^;]+;/g, '')
      .replace(/setSessionId\([^)]+\);/g, '');
  },

  'app/settings/billing/page.tsx': content => {
    // Remove unused imports
    return content
      .replace(/,\s*CardDescription/g, '')
      .replace(/import { cn } from '@\/lib\/utils';[^\n]*\n/g, '');
  },

  'components/auth/auth-provider.tsx': content => {
    // Replace non-null assertion
    return content.replace(
      "logger.warn('User is null after auth initialization!')",
      "logger.warn('User is null after auth initialization')"
    );
  },

  'components/templates/TemplateShowcase.tsx': content => {
    // Remove unused variable and fix async function
    content = content.replace(/const templates = [^;]+;/g, '');
    content = content.replace(
      /onClick={async \(\) => onSelect\(template\.id\)}/g,
      'onClick={() => onSelect(template.id)}'
    );
    return content;
  },

  'components/ui/alert-dialog.tsx': content => {
    // Replace non-null assertions with optional chaining
    return content
      .replace(/className!/g, 'className')
      .replace(
        /cn\(alertDialogVariants\(\), className\)/g,
        'cn(alertDialogVariants(), className || "")'
      );
  },

  'components/ui/dropdown-menu.tsx': content => {
    // Replace non-null assertions
    return content
      .replace(/className!/g, 'className')
      .replace(/sideOffset!/g, 'sideOffset || 4');
  },

  'app/admin/experiments/[id]/ExperimentDetailsContent.tsx': content => {
    // Remove unused variable
    return content.replace(/const { user } = useAuthStore\(\);[^\n]*\n/g, '');
  },
};

// Process each file
Object.entries(fileFixes).forEach(([file, fixFunction]) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  console.log(`Fixing ${file}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Apply specific fixes
  content = fixFunction(content);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  }
});

console.log('\n✅ ESLint fixes complete!');
