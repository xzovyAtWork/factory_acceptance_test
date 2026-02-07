#!/usr/bin/env bash
set -o errexit

echo "📦 Installing dependencies..."
npm install

echo "🏗 Building frontend..."
npm run build

echo "✨ Build complete!"