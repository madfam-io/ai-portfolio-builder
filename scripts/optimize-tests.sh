#!/bin/bash

echo "🔧 Optimizing test files..."

# Replace original test files with refactored versions
cp __tests__/components/landing/Hero.refactored.test.tsx __tests__/components/landing/Hero.test.tsx
cp __tests__/components/landing/Features.refactored.test.tsx __tests__/components/landing/Features.test.tsx
cp __tests__/components/landing/Pricing.refactored.test.tsx __tests__/components/landing/Pricing.test.tsx
cp __tests__/components/landing/Header.refactored.test.tsx __tests__/components/landing/Header.test.tsx
cp __tests__/app/page.refactored.test.tsx __tests__/app/page.test.tsx
cp __tests__/api/portfolios.refactored.test.ts __tests__/api/portfolios.test.ts
cp __tests__/api/ai/enhance-bio.refactored.test.ts __tests__/api/ai/enhance-bio.test.ts
cp __tests__/components/editor/PortfolioEditor.refactored.test.tsx __tests__/components/editor/PortfolioEditor.test.tsx

# Remove the refactored versions
rm __tests__/components/landing/*.refactored.test.tsx
rm __tests__/app/*.refactored.test.tsx
rm __tests__/api/*.refactored.test.ts
rm __tests__/api/ai/*.refactored.test.ts
rm __tests__/components/editor/*.refactored.test.tsx
rm __tests__/lib/services/*.refactored.test.ts

echo "✅ Test files optimized!"
echo "🧪 Running tests to verify..."

npm test -- --no-coverage --maxWorkers=4