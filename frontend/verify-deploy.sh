#!/bin/bash
# Deployment verification script for Render

echo "========================================="
echo "Deployment Verification Script"
echo "========================================="
echo ""
echo "Checking frontend files..."
echo ""

if [ -d "dist" ]; then
    echo "✓ dist folder exists"
    echo "Files in dist:"
    ls -la dist/
    echo ""
else
    echo "✗ ERROR: dist folder not found!"
    exit 1
fi

if [ -f "dist/index.html" ]; then
    echo "✓ index.html exists"
else
    echo "✗ ERROR: index.html not found!"
    exit 1
fi

if [ -f "server.js" ]; then
    echo "✓ server.js exists"
else
    echo "✗ ERROR: server.js not found!"
    exit 1
fi

echo ""
echo "========================================="
echo "All files present - Server should work!"
echo "========================================="
