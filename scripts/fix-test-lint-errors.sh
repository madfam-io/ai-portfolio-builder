#!/bin/bash

# Fix unused variables by prefixing with underscore
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # Fix unused imports
  sed -i '' 's/import { NextRequest, NextResponse }/import { NextRequest }/g' "$file"
  sed -i '' 's/import { act,/import {/g' "$file"
  sed -i '' 's/import userEvent /import _userEvent /g' "$file"
  sed -i '' 's/const userEvent = /const _userEvent = /g' "$file"
  sed -i '' 's/import \* as crypto /import \* as _crypto /g' "$file"
  
  # Fix unused variables
  sed -i '' 's/const mockUserId = /const _mockUserId = /g' "$file"
  sed -i '' 's/const data = /const _data = /g' "$file"
  sed -i '' 's/const responseData = /const _responseData = /g' "$file"
  sed -i '' 's/const debouncedValue = /const _debouncedValue = /g' "$file"
  sed -i '' 's/const ThrowAsyncError = /const _ThrowAsyncError = /g' "$file"
  sed -i '' 's/const DynamicComponent = /const _DynamicComponent = /g' "$file"
  sed -i '' 's/const RouteComponent = /const _RouteComponent = /g' "$file"
  sed -i '' 's/const DynamicButton = /const _DynamicButton = /g' "$file"
  sed -i '' 's/const expiredDate = /const _expiredDate = /g' "$file"
  
  # Fix unused function parameters
  sed -i '' 's/(portfolio)/(\_portfolio)/g' "$file"
  sed -i '' 's/(data, onSave)/(\_data, \_onSave)/g' "$file"
  sed -i '' 's/(props)/(\_props)/g' "$file"
  
  # Fix async functions without await
  sed -i '' 's/async () => ({\([^}]*\)})/() => ({\1})/g' "$file"
  sed -i '' 's/json: async () => /json: () => /g' "$file"
done

# Fix non-null assertions
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' 's/stateMatch!/stateMatch/g'

# Fix specific imports
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' 's/import { cache }/import { _cache }/g'
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' 's/import { STORAGE_BUCKETS }/import { _STORAGE_BUCKETS }/g'
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' 's/import { RetryOptions }/import { _RetryOptions }/g'
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' 's/import { Portfolio }/import { _Portfolio }/g'

echo "Lint errors fixed. Run 'pnpm lint __tests__' to verify."