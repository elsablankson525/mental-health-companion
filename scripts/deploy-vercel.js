#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment process...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if .env.production exists
if (!fs.existsSync('.env.production')) {
  console.error('❌ Error: .env.production not found. Please create it first.');
  process.exit(1);
}

console.log('📋 Deployment checklist:');
console.log('✅ Project structure verified');
console.log('✅ Environment file exists');

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}

// Build the project
console.log('\n🏗️  Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Project built successfully');
} catch (error) {
  console.error('❌ Error building project:', error.message);
  process.exit(1);
}

console.log('\n📝 Next steps:');
console.log('1. Set up environment variables in Vercel dashboard:');
console.log('   - DATABASE_URL');
console.log('   - NEXTAUTH_SECRET (generate a new one)');
console.log('   - NEXTAUTH_URL (your production domain)');
console.log('   - ENCRYPTION_KEY (generate a new one)');
console.log('   - JWT_SECRET (generate a new one)');
console.log('   - NEXT_PUBLIC_ML_API_URL (your ML backend URL)');
console.log('\n2. Deploy to Vercel:');
console.log('   vercel --prod');
console.log('\n3. Deploy ML backend separately:');
console.log('   cd ml_backend && vercel --prod');

console.log('\n🎉 Deployment preparation complete!');
