#!/bin/bash

# Function to refactor a single file
refactor_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Use sed to replace react-icons imports
    # This handles imports from react-icons/fi
    sed -E 's/import \{ ([^}]+) \} from '\''react-icons\/fi'\'';/# ICON_IMPORTS_FI \1/g' "$file" > "$temp_file"
    
    # Now process the marked lines to create individual imports
    awk '
    /^# ICON_IMPORTS_FI/ {
        # Extract the icons list
        icons = substr($0, index($0, "ICON_IMPORTS_FI") + 16)
        # Remove any trailing semicolon or spaces
        gsub(/[; ]+$/, "", icons)
        # Split by comma
        n = split(icons, icon_array, ",")
        for (i = 1; i <= n; i++) {
            # Trim whitespace
            gsub(/^[ \t]+|[ \t]+$/, "", icon_array[i])
            if (icon_array[i] != "") {
                print "import " icon_array[i] " from '\''react-icons/fi/" icon_array[i] "'\'';"
            }
        }
        next
    }
    { print }
    ' "$temp_file" > "${temp_file}.2"
    
    # Process other icon libraries (fa, hi, etc.)
    cp "${temp_file}.2" "$temp_file"
    
    # react-icons/fa
    sed -E 's/import \{ ([^}]+) \} from '\''react-icons\/fa'\'';/# ICON_IMPORTS_FA \1/g' "$temp_file" > "${temp_file}.2"
    awk '
    /^# ICON_IMPORTS_FA/ {
        icons = substr($0, index($0, "ICON_IMPORTS_FA") + 16)
        gsub(/[; ]+$/, "", icons)
        n = split(icons, icon_array, ",")
        for (i = 1; i <= n; i++) {
            gsub(/^[ \t]+|[ \t]+$/, "", icon_array[i])
            if (icon_array[i] != "") {
                print "import " icon_array[i] " from '\''react-icons/fa/" icon_array[i] "'\'';"
            }
        }
        next
    }
    { print }
    ' "${temp_file}.2" > "$temp_file"
    
    # react-icons/hi
    sed -E 's/import \{ ([^}]+) \} from '\''react-icons\/hi'\'';/# ICON_IMPORTS_HI \1/g' "$temp_file" > "${temp_file}.2"
    awk '
    /^# ICON_IMPORTS_HI/ {
        icons = substr($0, index($0, "ICON_IMPORTS_HI") + 16)
        gsub(/[; ]+$/, "", icons)
        n = split(icons, icon_array, ",")
        for (i = 1; i <= n; i++) {
            gsub(/^[ \t]+|[ \t]+$/, "", icon_array[i])
            if (icon_array[i] != "") {
                print "import " icon_array[i] " from '\''react-icons/hi/" icon_array[i] "'\'';"
            }
        }
        next
    }
    { print }
    ' "${temp_file}.2" > "${temp_file}.3"
    
    # Check if file was actually modified
    if ! cmp -s "$file" "${temp_file}.3"; then
        cp "${temp_file}.3" "$file"
        echo "✅ Refactored: $file"
    else
        echo "⏭️  No changes needed: $file"
    fi
    
    # Clean up temp files
    rm -f "$temp_file" "${temp_file}.2" "${temp_file}.3"
}

# Find all TypeScript/JavaScript files with react-icons imports
echo "🔍 Finding files with react-icons imports..."
files=$(grep -r "from 'react-icons/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v .next | cut -d: -f1 | sort | uniq)

if [ -z "$files" ]; then
    echo "No files found with react-icons imports."
    exit 0
fi

# Count files
file_count=$(echo "$files" | wc -l)
echo "Found $file_count files to process"
echo ""

# Process each file
processed=0
for file in $files; do
    refactor_file "$file"
    processed=$((processed + 1))
    echo "Progress: $processed/$file_count"
    echo ""
done

echo "✅ Refactoring complete!"
echo "📊 Processed $processed files"
echo ""
echo "💡 Next steps:"
echo "1. Run 'pnpm build' to verify the build"
echo "2. Run 'pnpm test' to ensure tests pass"
echo "3. Check bundle size reduction"