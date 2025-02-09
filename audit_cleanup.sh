#!/bin/bash

# Audit and cleanup script for repository

# Step 1: Generate full file map, excluding the archive directory
echo "Generating repository file map..."
find . -type f -not -path './archive/*' | sort > repo_map.txt
echo "File map saved as repo_map.txt"

# Step 2: Create archive directory if it doesn't exist
if [ ! -d archive ]; then
  echo "Creating archive directory..."
  mkdir archive
fi

# Step 3: Identify duplicate files using a temporary file for hash mapping
tempfile=$(mktemp)
duplicate_found=0

while IFS= read -r file; do
  # Check if file exists
  if [ -f "$file" ]; then
    # Compute MD5 hash using md5 -q for macOS
    hash=$(md5 -q "$file")
    # Check if this hash already exists in the tempfile
    existing=$(grep "^$hash " "$tempfile")
    if [ -n "$existing" ]; then
      existing_file=$(echo "$existing" | cut -d' ' -f2-)
      echo "Duplicate found: $file and $existing_file"
      # Archive the duplicate file
      mv "$file" archive/
      echo "Moved $file to archive/"
      duplicate_found=1
    else
      echo "$hash $file" >> "$tempfile"
    fi
  fi
done < repo_map.txt

if [ $duplicate_found -eq 0 ]; then
  echo "No duplicate files found."
fi

rm "$tempfile"

# Step 4: Clean up any empty directories (excluding the archive directory)
echo "Cleaning up empty directories..."
find . -type d -empty -not -path './archive' -exec rmdir {} \;

echo "Audit and cleanup completed." 