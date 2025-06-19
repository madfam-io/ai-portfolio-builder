#\!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing remaining test errors...\n');

// Fix 1: Enhanced Stripe Service Mock issues
function fixEnhancedStripeServiceMocks() {
  const filesToFix = [
    '__tests__/app/api/v1/payments/create-checkout/route.test.ts',
    '__tests__/app/api/v1/payments/webhook/route.test.ts',
    '__tests__/components/billing/upgrade-modal.test.tsx',
  ];

  filesToFix.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove old mock setup
      content = content.replace(/const mockEnhancedStripeService[^;]+;/g, '');
      
      // Add proper mock setup before imports
      const mockSetup = `// Mock Enhanced Stripe Service
const mockEnhancedStripeService = {
  isAvailable: jest.fn(),
  createCheckoutSession: jest.fn(),
  getCheckoutSession: jest.fn(),
  handleWebhook: jest.fn(),
  createBillingPortalSession: jest.fn(),
};

jest.mock('@/lib/services/stripe/enhanced-stripe-service', () => ({
  EnhancedStripeService: jest.fn().mockImplementation(() => mockEnhancedStripeService),
}));

`;
      
      // Insert at the beginning of the file
      if (\!content.includes('const mockEnhancedStripeService = {')) {
        content = mockSetup + content;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed Enhanced Stripe Service mock in ${file}`);
    }
  });
}

// Main execution
function main() {
  try {
    fixEnhancedStripeServiceMocks();
    
    console.log('\n✨ All fixes applied\!');
    
  } catch (error) {
    console.error('Error during fixes:', error.message);
  }
}

main();
EOF < /dev/null