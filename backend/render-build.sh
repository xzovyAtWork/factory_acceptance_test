#!/usr/bin/env bash
set -o errexit

echo "📦 Installing dependencies..."
npm install

echo "🗄 Running migrations..."
node ./src/db/migrations/runMigrations.js

echo "🌱 Seeding database..."
node ./src/db/seed.js