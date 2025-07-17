#!/bin/bash

# Build the frontend and backend
echo "Building frontend and backend..."
npm run build

# Copy drizzle migration files to dist directory
echo "Copying migration files..."
cp -r drizzle dist/ 2>/dev/null || echo "No drizzle directory found, skipping migration files copy"

echo "Build completed successfully!"