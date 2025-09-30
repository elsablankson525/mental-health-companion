#!/usr/bin/env node

/**
 * Railway ML Backend Deployment Test
 * Tests the deployed ML backend endpoints
 */

const https = require('https');
const http = require('http');

console.log('🚀 Testing Railway ML Backend Deployment');
console.log('=======================================\n');

// Replace with your actual Railway URL
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://tranquil-energy-production.up.railway.app';

async function testEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing ${description}...`);
    
    const url = new URL(`${RAILWAY_URL}${endpoint}`);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description} - Status: ${res.statusCode}`);
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
          } catch (e) {
            console.log(`   Response: ${data}`);
          }
          resolve(true);
        } else {
          console.log(`❌ ${description} - Status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`❌ ${description} - Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function testSentimentAnalysis() {
  return new Promise((resolve) => {
    console.log('🧪 Testing Sentiment Analysis...');
    
    const url = new URL(`${RAILWAY_URL}/api/sentiment`);
    const client = url.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify({
      text: "I am feeling great today! This is amazing."
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Sentiment Analysis - Status: 200');
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Sentiment: ${JSON.stringify(jsonData, null, 2)}`);
          } catch (e) {
            console.log(`   Response: ${data}`);
          }
          resolve(true);
        } else {
          console.log(`❌ Sentiment Analysis - Status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Sentiment Analysis - Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`❌ Sentiment Analysis - Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log(`🔗 Testing Railway URL: ${RAILWAY_URL}\n`);
  
  const tests = [
    { endpoint: '/api/health', description: 'Health Check' },
    { endpoint: '/api/status', description: 'Status Check' },
    { endpoint: '/api/models', description: 'Models Status' }
  ];
  
  let passed = 0;
  let total = tests.length + 1; // +1 for sentiment analysis
  
  // Test basic endpoints
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    if (result) passed++;
    console.log('');
  }
  
  // Test sentiment analysis
  const sentimentResult = await testSentimentAnalysis();
  if (sentimentResult) passed++;
  
  console.log('\n📊 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`📈 Total: ${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your ML backend is ready for production.');
    console.log(`\n🔗 Your ML Backend URL: ${RAILWAY_URL}`);
    console.log('\n📝 Next Steps:');
    console.log('1. Update your .env file with the Railway URL');
    console.log('2. Deploy your frontend to Vercel');
    console.log('3. Test the full application');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your Railway deployment.');
    console.log('   Make sure your ML backend is running and accessible.');
  }
}

// Run the tests
runTests().catch(console.error);
