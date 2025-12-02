#!/bin/bash
# GearsNP - Quick Start Script

echo "🏁 GearsNP - F1 Merchandise Platform"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "📝 IMPORTANT: Edit .env.local and add your Supabase credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "Get these from: https://supabase.com/dashboard"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Dependencies installed"
echo ""

echo "🚀 Starting development server..."
echo ""
echo "📍 Routes available:"
echo "   Storefront: http://localhost:3000"
echo "   Admin:      http://localhost:3000/admin/login"
echo ""

npm run dev
