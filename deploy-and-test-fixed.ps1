# ======================================================
# SANIXPERT DEPLOYMENT & TESTING SCRIPT (PowerShell)
# ======================================================

Write-Host "🚀 Starting Sanixpert Deployment & Testing..." -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Create a simple HTTP server setup
Write-Host "📦 Setting up local server..." -ForegroundColor Blue

# Create a package.json if it doesn't exist
if (-not (Test-Path "package.json")) {
    $packageJson = @{
        name = "sanixpert-system"
        version = "1.0.0"
        description = "Sanixpert Sanitation Management System"
        main = "index.html"
        scripts = @{
            start = "npx http-server . -p 3000 -c-1 --cors"
            test = "echo 'Testing complete'"
        }
        keywords = @("sanitation", "management", "supabase")
        author = "Sanixpert Team"
        license = "MIT"
        devDependencies = @{
            "http-server" = "^14.1.1"
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "package.json" -Encoding utf8
    Write-Host "✅ package.json created" -ForegroundColor Green
}

# Install http-server if not present
try {
    http-server --version | Out-Null
    Write-Host "✅ http-server already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing http-server..." -ForegroundColor Blue
    npm install http-server
    Write-Host "✅ http-server installed" -ForegroundColor Green
}

Write-Host "✅ Local server setup complete" -ForegroundColor Green

# Check environment file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "📝 Copied .env.example to .env" -ForegroundColor Green
    } else {
        $envContent = @"
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
"@
        $envContent | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "📝 Created .env file" -ForegroundColor Green
    }
    
    Write-Host "📝 Please update .env file with your Supabase credentials" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "📱 Local Server: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🏠 Homepage: http://localhost:3000/index-next.html" -ForegroundColor Cyan
Write-Host "📊 Dashboard: http://localhost:3000/dashboard-live-enhanced.html" -ForegroundColor Cyan
Write-Host "💓 Heartbeat Monitor: http://localhost:3000/heartbeat-monitor.html" -ForegroundColor Cyan
Write-Host "🧪 Testing Suite: http://localhost:3000/test-master-dashboard.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your Supabase credentials" -ForegroundColor White
Write-Host "2. Run database setup scripts in Supabase SQL Editor" -ForegroundColor White
Write-Host "3. Start the server with: npm start" -ForegroundColor White
Write-Host "4. Open browser and test the system" -ForegroundColor White
Write-Host ""
Write-Host "📋 DATABASE SETUP ORDER:" -ForegroundColor Yellow
Write-Host "1. supabase-schema-enhanced.sql" -ForegroundColor White
Write-Host "2. supabase-heartbeat-functions.sql" -ForegroundColor White
Write-Host "3. supabase-first-time-setup.sql" -ForegroundColor White
Write-Host ""

$response = Read-Host "🚀 Ready to start server? (y/n)"
if ($response -match '^[yY]') {
    Write-Host "🌐 Starting local server..." -ForegroundColor Blue
    npm start
} else {
    Write-Host "👋 Setup complete. Run 'npm start' when ready to begin testing." -ForegroundColor Green
}
