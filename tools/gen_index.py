#!/usr/bin/env python3
"""
Generate index.json for exam questions
This script scans the exam-questions directory and creates an index.json file
listing all the JSON question files.
"""

import os
import json
from pathlib import Path

def main():
    # Get the exam-questions directory path
    exam_dir = Path("exam-questions")
    
    if not exam_dir.exists():
        print(f"Error: Directory {exam_dir} not found")
        return 1
    
    # Find all JSON files (excluding index.json itself)
    json_files = []
    for file_path in exam_dir.glob("*.json"):
        if file_path.name != "index.json":
            json_files.append(file_path.name)
    
    # Sort files alphabetically
    json_files.sort()
    
    # Write the index.json file
    index_path = exam_dir / "index.json"
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(json_files, f, indent=2)
        f.write('\n')
    
    print(f"Generated {index_path} with {len(json_files)} files:")
    for file_name in json_files:
        print(f"  - {file_name}")
    
    return 0

if __name__ == "__main__":
    exit(main())
