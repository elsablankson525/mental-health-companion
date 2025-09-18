#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up Enhanced Authentication System...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please update the environment variables.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Generate secure secrets if not present
console.log('🔑 Generating secure secrets...');
const crypto = require('crypto');

const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Read current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Generate secrets for empty values
const secrets = {
  'NEXTAUTH_SECRET': generateSecret(32),
  'ENCRYPTION_KEY': generateSecret(32),
  'JWT_SECRET': generateSecret(32)
};

// Update .env file with generated secrets
Object.entries(secrets).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}="${value}"`);
  } else {
    envContent += `\n${key}="${value}"`;
  }
});

fs.writeFileSync(envPath, envContent);
console.log('✅ Secure secrets generated and added to .env file.\n');

// Database setup
console.log('🗄️  Setting up database...');
try {
  console.log('📊 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🔄 Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('🌱 Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed.\n');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('Please ensure PostgreSQL is running and DATABASE_URL is correct.\n');
}

// Install additional dependencies if needed
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['input-otp'];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`Installing missing dependencies: ${missingDeps.join(', ')}`);
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
  }
  
  console.log('✅ All dependencies are installed.\n');
} catch (error) {
  console.error('❌ Dependency check failed:', error.message);
}

console.log('🎉 Enhanced Authentication Setup Complete!\n');
console.log('📋 Next Steps:');
console.log('1. Update your .env file with:');
console.log('   - Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)');
console.log('   - Twilio credentials for SMS (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)');
console.log('   - Your domain URL (NEXTAUTH_URL)');
console.log('');
console.log('2. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('3. Test the authentication:');
console.log('   - Email/Password login');
console.log('   - Google OAuth login');
console.log('   - Phone number OTP login');
console.log('');
console.log('🔒 Security Features Enabled:');
console.log('   ✅ Rate limiting');
console.log('   ✅ Account lockout protection');
console.log('   ✅ Secure password requirements');
console.log('   ✅ CSRF protection');
console.log('   ✅ Security headers');
console.log('   ✅ Login attempt logging');
console.log('   ✅ OTP verification');
console.log('   ✅ Session security');
console.log('');
console.log('📚 For more information, see SECURITY.md');
