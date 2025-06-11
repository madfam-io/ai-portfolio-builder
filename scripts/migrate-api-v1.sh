#!/bin/bash

# Script to migrate API routes to v1 structure

API_DIR="/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api"
V1_DIR="$API_DIR/v1"

echo "🚀 Starting API v1 migration..."

# Function to copy route files
copy_route() {
    local src="$1"
    local dest="$2"
    
    if [ -f "$src" ]; then
        echo "  📄 Copying: $src -> $dest"
        cp "$src" "$dest"
    fi
}

# AI routes
echo "📁 Migrating AI routes..."
copy_route "$API_DIR/ai/enhance-bio/route.ts" "$V1_DIR/ai/enhance-bio/route.ts"
copy_route "$API_DIR/ai/models/route.ts" "$V1_DIR/ai/models/route.ts"
copy_route "$API_DIR/ai/models/selection/route.ts" "$V1_DIR/ai/models/selection/route.ts"
copy_route "$API_DIR/ai/optimize-project/route.ts" "$V1_DIR/ai/optimize-project/route.ts"
copy_route "$API_DIR/ai/recommend-template/route.ts" "$V1_DIR/ai/recommend-template/route.ts"

# Analytics routes
echo "📁 Migrating Analytics routes..."
copy_route "$API_DIR/analytics/dashboard/route.ts" "$V1_DIR/analytics/dashboard/route.ts"
copy_route "$API_DIR/analytics/repositories/route.ts" "$V1_DIR/analytics/repositories/route.ts"
copy_route "$API_DIR/analytics/repositories/[id]/route.ts" "$V1_DIR/analytics/repositories/[id]/route.ts"

# Integration routes
echo "📁 Migrating Integration routes..."
copy_route "$API_DIR/integrations/github/auth/route.ts" "$V1_DIR/integrations/github/auth/route.ts"
copy_route "$API_DIR/integrations/github/callback/route.ts" "$V1_DIR/integrations/github/callback/route.ts"

# Portfolio routes
echo "📁 Migrating Portfolio routes..."
copy_route "$API_DIR/portfolios/route.ts" "$V1_DIR/portfolios/route.ts"
copy_route "$API_DIR/portfolios/[id]/route.ts" "$V1_DIR/portfolios/[id]/route.ts"

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Update all imports in the migrated files to use versioned API utilities"
echo "2. Test each endpoint with the new /api/v1/ prefix"
echo "3. Update frontend API calls to use the new versioned endpoints"
echo "4. Add deprecation notices to old endpoints before removing them"