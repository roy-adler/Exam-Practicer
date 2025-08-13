#!/bin/bash

# Script to generate index.json and focus-areas.json for the exam questions
# This script should be run from the exam-questions directory

set -e  # Exit on any error

echo "🔍 Starting file generation..."

# Generate index.json
echo "📋 Generating index.json..."
echo "[" > index.json
first=true

for file in *.json; do
    if [ "$file" != "index.json" ] && [ "$file" != "focus-areas.json" ]; then
        if [ "$first" = "true" ]; then
            echo "  \"$file\"" >> index.json
            first=false
        else
            echo "  ,\"$file\"" >> index.json
        fi
    fi
done

echo "]" >> index.json
echo "✅ index.json generated successfully"

# Generate focus-areas.json with hardcoded focus areas
echo "🎯 Generating focus-areas.json..."
echo "[" > focus-areas.json
echo "  \"1a\"," >> focus-areas.json
echo "  \"1b\"," >> focus-areas.json
echo "  \"1c\"," >> focus-areas.json
echo "  \"1d\"," >> focus-areas.json
echo "  \"1e\"," >> focus-areas.json
echo "  \"2a\"," >> focus-areas.json
echo "  \"2b\"," >> focus-areas.json
echo "  \"2c\"," >> focus-areas.json
echo "  \"2d\"," >> focus-areas.json
echo "  \"2e\"," >> focus-areas.json
echo "  \"3a\"," >> focus-areas.json
echo "  \"3b\"," >> focus-areas.json
echo "  \"3c\"," >> focus-areas.json
echo "  \"3d\"," >> focus-areas.json
echo "  \"3e\"," >> focus-areas.json
echo "  \"4a\"," >> focus-areas.json
echo "  \"4b\"," >> focus-areas.json
echo "  \"4c\"," >> focus-areas.json
echo "  \"4d\"," >> focus-areas.json
echo "  \"4e\"," >> focus-areas.json
echo "  \"5a\"," >> focus-areas.json
echo "  \"5b\"," >> focus-areas.json
echo "  \"5c\"," >> focus-areas.json
echo "  \"5d\"," >> focus-areas.json
echo "  \"5e\"," >> focus-areas.json
echo "  \"6a\"," >> focus-areas.json
echo "  \"6b\"," >> focus-areas.json
echo "  \"6c\"," >> focus-areas.json
echo "  \"6d\"," >> focus-areas.json
echo "  \"6e\"," >> focus-areas.json
echo "  \"6f\"," >> focus-areas.json
echo "  \"6g\"," >> focus-areas.json
echo "  \"7a\"," >> focus-areas.json
echo "  \"7b\"," >> focus-areas.json
echo "  \"7c\"," >> focus-areas.json
echo "  \"7d\"," >> focus-areas.json
echo "  \"7e\"," >> focus-areas.json
echo "  \"7f\"," >> focus-areas.json
echo "  \"7g\"," >> focus-areas.json
echo "  \"8a\"," >> focus-areas.json
echo "  \"8b\"," >> focus-areas.json
echo "  \"8c\"," >> focus-areas.json
echo "  \"8d\"," >> focus-areas.json
echo "  \"8e\"," >> focus-areas.json
echo "  \"8f\"," >> focus-areas.json
echo "  \"8g\"," >> focus-areas.json
echo "  \"9a\"," >> focus-areas.json
echo "  \"9b\"" >> focus-areas.json
echo "]" >> focus-areas.json

echo "✅ focus-areas.json generated successfully"
echo "🎉 All files generated successfully!"
echo ""
echo "📊 Summary:"
echo "  - index.json: Lists all question files"
echo "  - focus-areas.json: Contains all focus areas for balanced quiz mode"
