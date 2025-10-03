#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🧪 Testing Vercel deployment...\n');

// Configuration
const config = {
  mainAppUrl: process.env.MAIN_APP_URL || 'https://your-app.vercel.app',
  mlBackendUrl: process.env.ML_BACKEND_URL || 'https://your-ml-backend.vercel.app',
  timeout: 10000
};

// Test function
function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${description}: ${res.statusCode} (${responseTime}ms)`);
          resolve({ success: true, status: res.statusCode, responseTime, data });
        } else {
          console.log(`❌ ${description}: ${res.statusCode} (${responseTime}ms)`);
          resolve({ success: false, status: res.statusCode, responseTime, data });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`❌ ${description}: ${error.message} (${responseTime}ms)`);
      resolve({ success: false, error: error.message, responseTime });
    });
    
    req.setTimeout(config.timeout, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      console.log(`⏰ ${description}: Timeout (${responseTime}ms)`);
      resolve({ success: false, error: 'Timeout', responseTime });
    });
  });
}

// Run tests
async function runTests() {
  console.log('Testing main application...');
  const mainAppHealth = await testEndpoint(`${config.mainAppUrl}/api/health`, 'Main App Health Check');
  
  console.log('\nTesting ML backend...');
  const mlHealth = await testEndpoint(`${config.mlBackendUrl}/api/health`, 'ML Backend Health Check');
  
  console.log('\nTesting ML backend endpoints...');
  const mlSentiment = await testEndpoint(`${config.mlBackendUrl}/api/sentiment`, 'ML Sentiment Endpoint');
  
  // Test ML backend with POST request
  console.log('\nTesting ML backend POST endpoints...');
  const testMoodPrediction = await testMoodPredictionEndpoint();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Main App: ${mainAppHealth.success ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`ML Backend: ${mlHealth.success ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`ML Sentiment: ${mlSentiment.success ? '✅ Working' : '❌ Issues'}`);
  console.log(`ML Mood Prediction: ${testMoodPrediction.success ? '✅ Working' : '❌ Issues'}`);
  
  const allTestsPassed = mainAppHealth.success && mlHealth.success && mlSentiment.success && testMoodPrediction.success;
  
  if (allTestsPassed) {
    console.log('\n🎉 All tests passed! Your deployment is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Test mood prediction endpoint with POST request
async function testMoodPredictionEndpoint() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      emotions: ['happy', 'excited'],
      note: 'Feeling great today!',
      user_id: 'test-user'
    });
    
    const options = {
      hostname: config.mlBackendUrl.replace('https://', '').replace('http://', ''),
      port: config.mlBackendUrl.startsWith('https') ? 443 : 80,
      path: '/api/predict-mood',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const client = config.mlBackendUrl.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ML Mood Prediction: ${res.statusCode} (${responseTime}ms)`);
          resolve({ success: true, status: res.statusCode, responseTime, data: responseData });
        } else {
          console.log(`❌ ML Mood Prediction: ${res.statusCode} (${responseTime}ms)`);
          resolve({ success: false, status: res.statusCode, responseTime, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`❌ ML Mood Prediction: ${error.message} (${responseTime}ms)`);
      resolve({ success: false, error: error.message, responseTime });
    });
    
    req.setTimeout(config.timeout, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      console.log(`⏰ ML Mood Prediction: Timeout (${responseTime}ms)`);
      resolve({ success: false, error: 'Timeout', responseTime });
    });
    
    req.write(data);
    req.end();
  });
}

// Check if URLs are configured
if (config.mainAppUrl.includes('your-app') || config.mlBackendUrl.includes('your-ml')) {
  console.log('⚠️  Please configure your deployment URLs:');
  console.log('Set MAIN_APP_URL and ML_BACKEND_URL environment variables or update the script.');
  console.log('\nExample:');
  console.log('MAIN_APP_URL=https://your-app.vercel.app ML_BACKEND_URL=https://your-ml-backend.vercel.app node scripts/test-vercel-deployment.js');
  process.exit(1);
}

runTests().catch(console.error);
