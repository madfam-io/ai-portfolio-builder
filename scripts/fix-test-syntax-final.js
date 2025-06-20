#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Final test syntax fix script
 * Addresses remaining syntax errors from previous fixes
 */

// Specific file fixes
const specificFixes = {
  '__tests__/components/dashboard/ai-credit-packs.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<AICreditPacks[^>]+\/>\s*\);/m, "      render(<AICreditPacks {...defaultProps} />);");
    return content;
  },
  
  '__tests__/components/dashboard/billing-dashboard.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<BillingDashboard[^>]+\/>\s*\);/m, "      render(<BillingDashboard {...nearLimitProps} />);");
    return content;
  },
  
  '__tests__/e2e/template-switching.test.ts': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<TemplateSwitchingTest[^>]+\/>\s*\);/m, "      render(<TemplateSwitchingTest />);");
    return content;
  },
  
  '__tests__/integration/ai-enhancement-flow.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<MockAIEnhancementFlow[^>]+\/>\s*\);/m, "      render(<MockAIEnhancementFlow />);");
    return content;
  },
  
  '__tests__/integration/auth-flow.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\s*<Dashboard[^>]*\/>/m, "        <Dashboard />");
    return content;
  },
  
  '__tests__/integration/portfolio-publishing.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<MockPublishingFlow[^>]+\/>\s*\);/m, "      render(<MockPublishingFlow />);");
    return content;
  },
  
  '__tests__/integration/template-system.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\s*<TemplateRenderer[^>]+\/>/m, "      render(<TemplateRenderer portfolio={portfolioWithTemplate} />);");
    return content;
  },
  
  '__tests__/components/editor/EditorContent.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix duplicate import path
    content = content.replace(/import { mockUseLanguage } from '@\/__tests__\/utils\/mock-i18n'; '@\/__tests__\/utils\/mock-i18n';/g, "import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<EditorContent[^>]*\/>\s*\);/m, "      render(<EditorContent />);");
    // Fix the broken expectation
    content = content.replace(/\n\s*expect\(enhanceButton\)\.toHaveFocus\(\);[\s\S]*?\}\);[\s\S]*?\}\);/m, (match) => {
      return `
      expect(enhanceButton).toHaveFocus();
    });
  });
});`;
    });
    return content;
  },
  
  '__tests__/lib/services/portfolio/portfolio-service.test.ts': (content) => {
    // Fix the broken mock declaration
    content = content.replace(/^d<PortfolioRepository>;/m, "    const mockRepository = {} as jest.Mocked<PortfolioRepository>;");
    // Remove the orphaned closing braces
    content = content.replace(/^\s*\)\);\s*}\);\s*}\);[\s\S]*?describe\('getUserPortfolios'/m, "  describe('getUserPortfolios'");
    // Fix missing closing parentheses
    content = content.replace(/expect\(mockRepository\.update\)\.toHaveBeenCalledWith\(\s*'portfolio-123',\s*updateDto\s*\n/g, 
      "expect(mockRepository.update).toHaveBeenCalledWith(\n        'portfolio-123',\n        updateDto\n      );");
    // Fix other missing parentheses
    content = content.replace(/expect\(service\.deletePortfolio\('portfolio-123'\)\)\.rejects\.toThrow\(\s*'Cannot delete published portfolio'\s*\n/g,
      "expect(service.deletePortfolio('portfolio-123')).rejects.toThrow(\n        'Cannot delete published portfolio'\n      );");
    content = content.replace(/mockRepository\.findById\.mockRejectedValue\(\s*new Error\('Database error'\)\s*\n/g,
      "mockRepository.findById.mockRejectedValue(\n        new Error('Database error')\n      );");
    content = content.replace(/await expect\(service\.getUserPortfolios\('user-123'\)\)\.rejects\.toThrow\(\s*'Database error'\s*\n/g,
      "await expect(service.getUserPortfolios('user-123')).rejects.toThrow(\n        'Database error'\n      );");
    return content;
  },
  
  '__tests__/components/billing/upgrade-modal.test.tsx': (content) => {
    // Remove duplicate React imports
    content = content.replace(/import React from 'react';\s*import React from 'react';/g, "import React from 'react';");
    // Fix the broken render line
    content = content.replace(/^\(\s*<UpgradeModal[^>]+\/>\s*\);/m, "    render(<UpgradeModal {...defaultProps} />);");
    // Remove the orphaned line
    content = content.replace(/^\s*expect\(mockCreateCheckoutSession\)\.toHaveBeenCalledWith\({[\s\S]*?}\);[\s\S]*?}\);[\s\S]*?}\);/m, (match) => {
      return `    expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
      planId: 'enterprise'
    });
  });
});`;
    });
    return content;
  }
};

// Process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    // Apply specific fixes if available
    if (specificFixes[filePath]) {
      content = specificFixes[filePath](content);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Starting final syntax fixes...\n');

let fixedCount = 0;

// Process specific files that need fixes
Object.keys(specificFixes).forEach(filePath => {
  if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);
console.log('\nNext: Run pnpm test to verify fixes');