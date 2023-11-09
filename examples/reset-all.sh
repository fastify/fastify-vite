#!/bin/bash

# Loop through all folders in the current directory
for folder in */; do
    # Check if it's a directory
    if [ -d "$folder" ]; then
        # Run your command inside the folder
        (cd "$folder" && rm -rf node_modules package-lock.json && pnpm i)
    fi
done