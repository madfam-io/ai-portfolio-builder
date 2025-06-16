#!/bin/bash

# Fix unused imports
echo "Fixing unused imports..."
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # Remove act from imports if not used
  sed -i '' '/^[[:space:]]*act,/d' "$file"
  sed -i '' 's/, act//g' "$file"
  sed -i '' 's/act, //g' "$file"
done

# Fix NextResponse import
find __tests__ -name "*.test.ts" | xargs sed -i '' 's/import { NextRequest, NextResponse }/import { NextRequest }/g'

# Fix unused imports
find __tests__ -name "*.test.ts" | xargs sed -i '' 's/import { cache }/import { cache as _cache }/g'
find __tests__ -name "*.test.ts" | xargs sed -i '' 's/import { STORAGE_BUCKETS }/import { STORAGE_BUCKETS as _STORAGE_BUCKETS }/g'
find __tests__ -name "*.test.ts" | xargs sed -i '' 's/import { RetryOptions }/import type { RetryOptions }/g'
find __tests__ -name "*.test.ts" | xargs sed -i '' 's/import { Portfolio }/import type { Portfolio }/g'

# Fix parameter names with underscore for unused params  
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  sed -i '' 's/(portfolio)/(\_portfolio)/g' "$file"
  sed -i '' 's/(data, onSave)/(\_data, \_onSave)/g' "$file"
  sed -i '' 's/(props)/(\_props)/g' "$file"
done

echo "Batch lint fixes complete"