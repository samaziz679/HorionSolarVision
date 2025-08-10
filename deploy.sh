#!/bin/bash

# This script is used to deploy the application to Vercel.
# It is executed by the Vercel build process.

echo "Deploying to Vercel..."

# Install pnpm dependencies
echo "Installing pnpm dependencies..."
pnpm install --frozen-lockfile

# Build the Next.js application
echo "Building Next.js application..."
pnpm run build

echo "Deployment complete!"
