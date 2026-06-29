#!/bin/bash
# Build script for WSL workaround
# Copies 404/500 pages after static generation to avoid EPERM

set -e

echo "Building with webpack..."
node node_modules/next/dist/bin/next build --webpack

# Copy 404 and 500 pages after build
if [ -f ".next/server/app/_not-found.html" ]; then
  echo "Copying 404 page..."
  cp .next/server/app/_not-found.html .next/server/pages/404.html
fi

if [ -f ".next/server/app/_global-error.html" ]; then
  echo "Copying 500 page..."
  cp .next/server/app/_global-error.html .next/server/pages/500.html
fi

echo "Build complete!"