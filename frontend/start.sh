#!/bin/bash
# Pre-start verification script

echo "========================================="
echo "Pre-Start Verification"
echo "========================================="

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "ERROR: dist directory not found!"
    echo "Running build..."
    npm run build
fi

# Check if index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html not found!"
    echo "Content of current directory:"
    ls -la
    echo "Attempting to build..."
    npm run build
    if [ ! -f "dist/index.html" ]; then
        echo "FATAL: Build failed - index.html still missing"
        exit 1
    fi
fi

echo "✓ dist/index.html found"
echo "✓ Files in dist:"
ls -la dist/
echo "========================================="
echo "Starting server..."
node server.js
