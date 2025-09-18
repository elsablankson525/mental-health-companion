#!/usr/bin/env node
/**
 * Deployment Setup Script
 * Helps set up the application for production deployment
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🚀 Mental Health Companion - Deployment Setup')
console.log('==============================================\n')

// Generate secure secrets
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

// Create production environment file
function createProductionEnv() {
  const envContent = `# Production Environment Variables
# Copy these to your Vercel environment variables

# Database (Replace with your Supabase/Neon URL)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# NextAuth (Replace with your Vercel URL)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="${generateSecret(32)}"

# ML Backend (Replace with your Railway/Render URL)
NEXT_PUBLIC_ML_API_URL="https://your-ml-backend.railway.app/api"

# Security
ENCRYPTION_KEY="${generateSecret(32)}"
JWT_SECRET="${generateSecret(32)}"

# Environment
NODE_ENV="production"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
`

  fs.writeFileSync('.env.production', envContent)
  console.log('✅ Created .env.production file')
  console.log('   Copy these values to your Vercel environment variables\n')
}

// Create deployment checklist
function createDeploymentChecklist() {
  const checklist = `# Deployment Checklist

## Pre-Deployment
- [ ] Set up Supabase/Neon database
- [ ] Deploy ML backend to Railway/Render
- [ ] Update environment variables
- [ ] Test database connection
- [ ] Test ML backend endpoints

## Database Setup
- [ ] Create new Supabase/Neon project
- [ ] Copy connection string
- [ ] Run: npx prisma db push
- [ ] Run: npx prisma db seed (optional)

## ML Backend Deployment
- [ ] Push code to GitHub
- [ ] Connect Railway/Render to GitHub repo
- [ ] Set root directory to 'ml_backend'
- [ ] Deploy and get URL
- [ ] Test health endpoint

## Frontend Deployment
- [ ] Connect Vercel to GitHub repo
- [ ] Set environment variables in Vercel
- [ ] Deploy
- [ ] Test all features

## Post-Deployment Testing
- [ ] Test user registration/login
- [ ] Test mood tracking
- [ ] Test journal entries
- [ ] Test ML recommendations
- [ ] Test password reset
- [ ] Check database data

## Security
- [ ] Use strong secrets
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure rate limiting

## Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor database usage
- [ ] Check ML backend logs
- [ ] Set up error tracking
`

  fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist)
  console.log('✅ Created DEPLOYMENT_CHECKLIST.md')
}

// Create ML backend deployment script
function createMLDeploymentScript() {
  const script = `#!/bin/bash
# ML Backend Deployment Script

echo "🚀 Deploying ML Backend..."

# Check if we're in the right directory
if [ ! -f "ml_backend/app.py" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd ml_backend
pip install -r requirements.txt

# Test the application
echo "🧪 Testing ML backend..."
python -c "import app; print('✅ ML backend imports successfully')"

# Start the application
echo "🚀 Starting ML backend..."
echo "Available at: http://localhost:5000"
echo "Health check: http://localhost:5000/api/health"
echo "Press Ctrl+C to stop"

python app.py
`

  fs.writeFileSync('deploy-ml.sh', script)
  fs.chmodSync('deploy-ml.sh', '755')
  console.log('✅ Created deploy-ml.sh script')
}

// Create Vercel deployment script
function createVercelDeploymentScript() {
  const script = `#!/bin/bash
# Vercel Deployment Script

echo "🚀 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to set your environment variables in the Vercel dashboard"
`

  fs.writeFileSync('deploy-vercel.sh', script)
  fs.chmodSync('deploy-vercel.sh', '755')
  console.log('✅ Created deploy-vercel.sh script')
}

// Main execution
try {
  createProductionEnv()
  createDeploymentChecklist()
  createMLDeploymentScript()
  createVercelDeploymentScript()
  
  console.log('\n🎉 Setup complete!')
  console.log('\nNext steps:')
  console.log('1. Set up your database (Supabase/Neon)')
  console.log('2. Deploy ML backend (Railway/Render)')
  console.log('3. Deploy frontend (Vercel)')
  console.log('4. Follow the DEPLOYMENT_CHECKLIST.md')
  console.log('\nFor detailed instructions, see DEPLOYMENT_GUIDE.md')
  
} catch (error) {
  console.error('❌ Setup failed:', error.message)
  process.exit(1)
}
