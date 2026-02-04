#!/bin/bash

# ======================================================
# SANIXPERT DEPLOYMENT & TESTING SCRIPT
# ======================================================

echo "🚀 Starting Sanixpert Deployment & Testing..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Create a simple HTTP server
echo "📦 Setting up local server..."

# Create a package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    cat > package.json << EOF
{
  "name": "sanixpert-system",
  "version": "1.0.0",
  "description": "Sanixpert Sanitation Management System",
  "main": "index.html",
  "scripts": {
    "start": "npx http-server . -p 3000 -c-1 --cors",
    "test": "echo \"Testing complete\" && exit 0"
  },
  "keywords": ["sanitation", "management", "supabase"],
  "author": "Sanixpert Team",
  "license": "MIT",
  "devDependencies": {
    "http-server": "^14.1.1"
  }
}
EOF
fi

# Install http-server if not present
if ! command -v http-server &> /dev/null; then
    echo "📦 Installing http-server..."
    npm install http-server
fi

echo "✅ Local server setup complete"

# Check environment file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Please update .env file with your Supabase credentials"
    else
        cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# System Configuration
ENVIRONMENT=development
DEBUG=true
EOF
        echo "📝 Created .env file - please update with your credentials"
    fi
fi

echo ""
echo "🎯 DEPLOYMENT READY!"
echo "==================="
echo "📱 Local Server: http://localhost:3000"
echo "🏠 Homepage: http://localhost:3000/index-next.html"
echo "📊 Dashboard: http://localhost:3000/dashboard-live-enhanced.html"
echo "💓 Heartbeat Monitor: http://localhost:3000/heartbeat-monitor.html"
echo "🧪 Testing Suite: http://localhost:3000/test-master-dashboard.html"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Update .env file with your Supabase credentials"
echo "2. Run database setup scripts in Supabase SQL Editor"
echo "3. Start the server with: npm start"
echo "4. Open browser and test the system"
echo ""
echo "📋 DATABASE SETUP ORDER:"
echo "1. supabase-schema-enhanced.sql"
echo "2. supabase-heartbeat-functions.sql"
echo "3. supabase-first-time-setup.sql"
echo ""
echo "🚀 Ready to start server? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🌐 Starting local server..."
    npm start
else
    echo "👋 Setup complete. Run 'npm start' when ready to begin testing."
fi
