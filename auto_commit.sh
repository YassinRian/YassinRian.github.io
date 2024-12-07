#!/bin/bash

# Create a dynamic commit message
COMMIT_MSG="Commit made on $(date +'%Y-%m-%d %H:%M:%S')"

# Add all changes
git add .

# Commit with the dynamic message
git commit -m "$COMMIT_MSG"

# Push changes to the main branch
git push -u origin main
