#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Files with any type warnings from the lint output
const filesToFix = [
  'app/api/v1/payments/verify/route.ts',
  'app/api/v1/stripe/webhook/route.ts',
  'app/dashboard/page.tsx',
  'app/editor/components/PropertyPanel.tsx',
  'app/editor/new/components/TemplateStep.tsx',
  'app/settings/domains/components/AddDomainModal.tsx',
  'components/dashboard/SuccessMetrics.tsx',
  'components/editor/sections/ExperienceSection.tsx',
  'components/editor/sections/HeroSection.tsx',
  'components/editor/sections/ProjectsSection.tsx',
  'components/editor/sections/SkillsSection.tsx',
  'components/landing/DynamicLandingPage.tsx',
  'components/landing/Templates.tsx',
  'components/onboarding/ContextualHint.tsx',
  'components/onboarding/OnboardingModal.tsx',
  'components/onboarding/OnboardingProvider.tsx',
  'components/portfolio/CustomDomainSettings.tsx',
  'components/shared/LazyWrapper.tsx',
  'components/shared/error-boundaries/GlobalErrorBoundary.tsx',
  'components/templates/TemplateSelectionWizard.tsx',
  'components/ui/OptimizedImage.tsx',
  'lib/ai/client.ts',
  'lib/ai/deepseek-service.ts',
  'lib/ai/geo/content-optimizer.ts',
  'lib/ai/geo/geo-service.ts',
  'lib/ai/geo/metadata-generator.ts',
  'lib/ai/geo/suggestion-generator.ts',
  'lib/ai/geo/types.ts',
  'lib/ai/huggingface/ModelManager.ts',
  'lib/ai/huggingface/api-client.ts',
  'lib/ai/huggingface/models.ts',
  'lib/ai/huggingface-service.ts',
  'lib/ai/lazy-loader.ts',
  'lib/analytics/data-transforms.ts',
  'lib/analytics/github/client.lazy.ts',
  'lib/analytics/github/resources/repositories.ts',
  'lib/analytics/github/tokenManager.ts',
  'lib/analytics/posthog/client.ts',
  'lib/analytics/posthog/enhanced-client.ts',
  'lib/analytics/posthog/events.ts',
  'lib/analytics/posthog/middleware.ts',
  'lib/analytics/posthog/server.ts',
  'lib/api/client.ts',
  'lib/api/error-handler.ts',
  'lib/api/middleware/auth.ts',
  'lib/api/middleware/common.ts',
  'lib/api/middleware/encryption.ts',
  'lib/api/middleware/observability.ts',
  'lib/api/middleware/security.ts',
  'lib/api/middleware/validation.ts',
  'lib/api/versioning.ts',
  'lib/auth/auth.ts',
  'lib/auth/middleware.ts',
  'lib/auth/roles.ts',
  'lib/cache/__mocks__/redis-cache.ts',
  'lib/config/env.ts',
  'lib/contexts/AuthContext.tsx',
  'lib/data/seeds/analytics/code-metrics.ts',
  'lib/data/seeds/analytics/commit-analytics.ts',
  'lib/data/seeds/analytics/portfolio-analytics.ts',
  'lib/data/seeds/analytics/pull-requests.ts',
  'lib/data/seeds/analytics.ts',
  'lib/data/seeds/github-data.ts',
  'lib/data/seeds/index.ts',
  'lib/data/seeds/portfolios.ts',
  'lib/data/seeds/users.ts',
  'lib/feedback/feedback-system.ts',
  'lib/hooks/useOnboarding.ts',
  'lib/i18n/refactored-context.tsx',
  'lib/i18n/utils.ts',
  'lib/monitoring/adapters/otel-adapter.ts',
  'lib/monitoring/apm.ts',
  'lib/monitoring/error-tracking.ts',
  'lib/monitoring/health-check.ts',
  'lib/monitoring/performance.ts',
  'lib/monitoring/signoz/correlation.ts',
  'lib/monitoring/signoz/index.ts',
  'lib/monitoring/signoz/metrics.ts',
  'lib/monitoring/signoz/tracing.ts',
  'lib/monitoring/unified/events.ts'
];

// Common type replacements
const typeReplacements = {
  // Event types
  'any.*MouseEvent': 'React.MouseEvent<HTMLElement>',
  'any.*ChangeEvent': &apos;React.ChangeEvent&lt;HTMLInputElement&gt;',
  'any.*FormEvent': &apos;React.FormEvent<HTMLFormElement>',
  'any.*KeyboardEvent': &apos;React.KeyboardEvent&lt;HTMLElement&gt;',
  
  // Common patterns
  &apos;Record<string, any>': &apos;Record&lt;string, unknown&gt;',
  'any\\[\\]': 'unknown[]',
  ': any\\)': ': unknown)',
  &apos;<any>': &apos;&lt;unknown&gt;',
  'as any': 'as unknown',
  
  // Function parameters
  '\\(([^:]+): any\\)': '($1: unknown)',
  '\\(([^:]+): any,': '($1: unknown,',
  ', ([^:]+): any\\)': ', $1: unknown)',
  ', ([^:]+): any,': ', $1: unknown,',
};

function fixAnyTypes(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Apply replacements
  for (const [pattern, replacement] of Object.entries(typeReplacements)) {
    const regex = new RegExp(pattern, 'g');
    const newContent = content.replace(regex, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  // Handle specific cases
  if (filePath.includes('route.ts')) {
    // API routes often have specific request/response types
    content = content.replace(/request: any/g, 'request: NextRequest');
    content = content.replace(/params: any/g, 'params: { [key: string]: string }');
    modified = true;
  }
  
  if (filePath.includes('.tsx')) {
    // React component props
    content = content.replace(/props: any/g, &apos;props: Record<string, unknown>');
    content = content.replace(/children: any/g, 'children: React.ReactNode');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed any types in ${filePath}`);
  } else {
    console.log(`⏭️  No any types to fix in ${filePath}`);
  }
}

console.log('🔧 Fixing TypeScript any type warnings...\n');

for (const file of filesToFix) {
  fixAnyTypes(file);
}

console.log('\n✨ Done!');