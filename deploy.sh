#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process for Homely Backend..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run build if needed
echo "Building application..."
npm run build

# Set environment to production
export NODE_ENV=production

# Start the application
echo "Starting application..."
node server.js 