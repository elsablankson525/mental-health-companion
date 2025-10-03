#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating production secrets...\n');

// Generate NEXTAUTH_SECRET (32 bytes, base64 encoded)
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// Generate ENCRYPTION_KEY (32 bytes, hex encoded)
const encryptionKey = crypto.randomBytes(32).toString('hex');

// Generate JWT_SECRET (64 bytes, base64 encoded)
const jwtSecret = crypto.randomBytes(64).toString('base64');

console.log('📋 Production Environment Variables:');
console.log('Copy these to your Vercel dashboard:\n');

console.log('NEXTAUTH_SECRET=' + nextAuthSecret);
console.log('ENCRYPTION_KEY=' + encryptionKey);
console.log('JWT_SECRET=' + jwtSecret);

console.log('\n📝 Additional variables to set:');
console.log('DATABASE_URL=your-database-connection-string');
console.log('NEXTAUTH_URL=https://your-app-name.vercel.app');
console.log('NEXT_PUBLIC_ML_API_URL=https://your-ml-backend.vercel.app/api');
console.log('NODE_ENV=production');

console.log('\n⚠️  Important:');
console.log('- Keep these secrets secure and never commit them to version control');
console.log('- Use different secrets for each environment (staging, production)');
console.log('- Update your .env.production file with these values for reference');

// Write to .env.production for reference
const envContent = `# Mental Health Companion - Production Environment Variables
# Generated on ${new Date().toISOString()}

# Database Configuration
DATABASE_URL="your-database-connection-string"

# NextAuth Configuration
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="${nextAuthSecret}"

# ML Backend Configuration
NEXT_PUBLIC_ML_API_URL="https://your-ml-backend.vercel.app/api"

# Security Configuration
ENCRYPTION_KEY="${encryptionKey}"
JWT_SECRET="${jwtSecret}"

# Rate Limiting Configuration
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Environment
NODE_ENV="production"
`;

require('fs').writeFileSync('.env.production', envContent);
console.log('\n✅ Updated .env.production with generated secrets');
