#!/bin/bash

# Script to generate index.json and focus-areas.json for the exam questions
# This script should be run from the root directory

set -e  # Exit on any error

echo "ðŸ” Starting file generation..."

# Generate index.json
echo "ðŸ“‹ Generating index.json..."
echo "[" > exam-questions/index.json
first=true

for file in exam-questions/*.json; do
    if [ "$file" != "exam-questions/index.json" ] && [ "$file" != "exam-questions/focus-areas.json" ]; then
        # Extract just the filename without the path
        filename=$(basename "$file")
        if [ "$first" = "true" ]; then
            echo "  \"$filename\"" >> exam-questions/index.json
            first=false
        else
            echo "  ,\"$filename\"" >> exam-questions/index.json
        fi
    fi
done

echo "]" >> exam-questions/index.json
echo "âœ… index.json generated successfully"

# Generate focus-areas.json by dynamically extracting focus values
echo "ðŸŽ¯ Generating focus-areas.json..."
echo "[" > exam-questions/focus-areas.json

# Extract all unique focus values from question files
focus_values=$(grep -h '"focus":' exam-questions/*.json | sed 's/.*"focus": "\([^"]*\)".*/\1/' | sort -u)

first_focus=true
echo "$focus_values" | while IFS= read -r focus; do
    if [ -n "$focus" ]; then
        if [ "$first_focus" = "true" ]; then
            echo "  \"$focus\"" >> exam-questions/focus-areas.json
            first_focus=false
        else
            echo "  ,\"$focus\"" >> exam-questions/focus-areas.json
        fi
    fi
done

echo "]" >> exam-questions/focus-areas.json

echo "âœ… focus-areas.json generated successfully"
echo "ðŸŽ‰ All files generated successfully!"
echo ""
echo "ðŸ“Š Summary:"
echo "  - index.json: Lists all question files"
echo "  - focus-areas.json: Contains all focus areas for balanced quiz mode"
echo "  - Found $(echo "$focus_values" | wc -l) unique focus areas"
