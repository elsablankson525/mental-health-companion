#!/usr/bin/env node

/**
 * Production Migration Script
 * Helps migrate from local development to production services
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Mental Health Companion - Production Migration Script');
console.log('=======================================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  Found existing .env file');
  console.log('   Please backup your current .env file before proceeding\n');
} else {
  console.log('✅ No existing .env file found\n');
}

console.log('📋 Required Environment Variables for Production:');
console.log('================================================\n');

console.log('🔗 Database (Neon PostgreSQL):');
console.log('   DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require\n');

console.log('🤖 ML Backend (Railway):');
console.log('   NEXT_PUBLIC_ML_API_URL=https://your-ml-backend.railway.app/api\n');

console.log('🔐 Authentication:');
console.log('   NEXTAUTH_URL=https://your-app.vercel.app');
console.log('   NEXTAUTH_SECRET=your-production-secret-key-32-chars-minimum\n');

console.log('🛡️  Security:');
console.log('   ENCRYPTION_KEY=your-32-character-encryption-key-here');
console.log('   JWT_SECRET=your-jwt-secret-key-here\n');

console.log('🌍 Environment:');
console.log('   NODE_ENV=production\n');

console.log('📝 Next Steps:');
console.log('==============\n');

console.log('1. Set up Neon PostgreSQL:');
console.log('   - Create account at https://neon.tech');
console.log('   - Create new project');
console.log('   - Copy connection string\n');

console.log('2. Deploy ML Backend to Railway:');
console.log('   - Create account at https://railway.app');
console.log('   - Connect GitHub repository');
console.log('   - Deploy ml_backend folder');
console.log('   - Set environment variables\n');

console.log('3. Deploy Frontend to Vercel:');
console.log('   - Connect GitHub repository');
console.log('   - Set all environment variables');
console.log('   - Deploy application\n');

console.log('4. Run Database Migration:');
console.log('   npx prisma migrate deploy');
console.log('   npx prisma generate\n');

console.log('5. Test Connections:');
console.log('   - Test database: npx prisma db pull');
console.log('   - Test ML backend: curl https://your-ml-backend.railway.app/api/health\n');

console.log('📚 For detailed instructions, see: PRODUCTION_ENVIRONMENT_SETUP.md\n');

console.log('✅ Migration script completed!');
console.log('   Follow the steps above to complete your production setup.');
