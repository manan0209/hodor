#!/bin/bash

# Hodor Setup Script
echo "🤖 Setting up Hodor - AI-Powered Job Search Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Copy environment variables
if [ ! -f .env.local ]; then
    echo "📋 Creating environment file..."
    cp .env.example .env.local
    echo "✅ Created .env.local - Please update with your API keys"
else
    echo "⚠️  .env.local already exists"
fi

# Create necessary directories
mkdir -p public/images
mkdir -p lib/types
mkdir -p components/forms
mkdir -p components/dashboard

echo "📁 Created necessary directories"

# Setup instructions
echo ""
echo "🎉 Setup complete! Next steps:"
echo "=============================="
echo "1. Update .env.local with your API keys:"
echo "   - Supabase URL and keys"
echo "   - OpenAI API key"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Need help? Check out:"
echo "   - README.md for full documentation"
echo "   - development-steps.md for implementation guide"
echo ""
echo "Happy coding! 🚀"
