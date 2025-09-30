#!/usr/bin/env node

/**
 * Production Connection Test Script
 * Tests all production services and connections
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

console.log('🧪 Mental Health Companion - Production Connection Tests');
console.log('=======================================================\n');

// Test configuration
const tests = {
  database: {
    name: 'Database Connection (Neon PostgreSQL)',
    test: () => testDatabaseConnection(),
    required: true
  },
  mlBackend: {
    name: 'ML Backend Connection (Railway)',
    test: () => testMLBackendConnection(),
    required: true
  },
  environment: {
    name: 'Environment Variables',
    test: () => testEnvironmentVariables(),
    required: true
  },
  prisma: {
    name: 'Prisma Client Generation',
    test: () => testPrismaGeneration(),
    required: true
  }
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test Prisma connection
    const output = execSync('npx prisma db pull --schema=prisma/schema.prisma', { 
      encoding: 'utf8',
      timeout: 30000 
    });
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testMLBackendConnection() {
  return new Promise((resolve) => {
    const mlUrl = process.env.NEXT_PUBLIC_ML_API_URL || 'https://your-ml-backend.railway.app/api';
    
    console.log(`🤖 Testing ML backend connection: ${mlUrl}`);
    
    const url = new URL(`${mlUrl}/health`);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { timeout: 10000 }, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ ML backend connection successful');
        resolve(true);
      } else {
        console.log(`❌ ML backend returned status: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ ML backend connection failed:', error.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ ML backend connection timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

function testEnvironmentVariables() {
  console.log('🌍 Testing environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_ML_API_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY',
    'JWT_SECRET'
  ];
  
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set');
    return true;
  } else {
    console.log('❌ Missing environment variables:', missing.join(', '));
    return false;
  }
}

function testPrismaGeneration() {
  try {
    console.log('🔧 Testing Prisma client generation...');
    
    execSync('npx prisma generate', { 
      encoding: 'utf8',
      timeout: 30000 
    });
    
    console.log('✅ Prisma client generation successful');
    return true;
  } catch (error) {
    console.log('❌ Prisma client generation failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting production connection tests...\n');
  
  for (const [key, test] of Object.entries(tests)) {
    results.total++;
    
    try {
      const passed = await test.test();
      
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
        
        if (test.required) {
          console.log(`⚠️  ${test.name} is required for production deployment\n`);
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name} test failed with error:`, error.message);
      results.failed++;
    }
    
    console.log(''); // Add spacing between tests
  }
  
  // Print summary
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.total}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Your production setup is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('   Refer to PRODUCTION_ENVIRONMENT_SETUP.md for help.');
  }
  
  console.log('\n📚 Next Steps:');
  console.log('==============');
  console.log('1. Fix any failed tests');
  console.log('2. Deploy to production');
  console.log('3. Monitor application health');
  console.log('4. Set up alerts and monitoring\n');
}

// Run the tests
runTests().catch(console.error);
