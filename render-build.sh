#!/bin/bash

# Render deployment script for SafeVault Admin Panel
echo "🚀 Building SafeVault Admin Panel for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output is in the 'build' directory"
