#!/bin/bash

echo "🔍 Starting bundle analysis..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Run the build with bundle analyzer enabled
echo "📦 Building with bundle analyzer..."
ANALYZE=true pnpm build

echo ""
echo "✅ Bundle analysis complete!"
echo ""
echo "📊 Check the following files for bundle analysis:"
echo "   - .next/analyze/client.html (Client-side bundles)"
echo "   - .next/analyze/nodejs.html (Server-side bundles)"
echo ""
echo "💡 To view the reports:"
echo "   open .next/analyze/client.html"
echo "   open .next/analyze/nodejs.html"