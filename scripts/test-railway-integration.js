#!/usr/bin/env node
/**
 * Test script to verify Railway ML Backend connection
 * Run this after updating your environment variables
 */

const https = require('https');
const http = require('http');

// Get ML API URL from environment or use default
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'https://your-ml-backend.railway.app/api';

console.log('🧪 Testing ML Backend Connection...');
console.log(`📍 ML API URL: ${ML_API_URL}`);
console.log('');

// Test health endpoint
async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const url = `${ML_API_URL}/health`;
    const client = url.startsWith('https') ? https : http;
    
    console.log('🔍 Testing health endpoint...');
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'healthy') {
            console.log('✅ Health check passed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Models loaded: ${JSON.stringify(response.models_loaded)}`);
            resolve(true);
          } else {
            console.log('❌ Health check failed');
            console.log(`   Response: ${data}`);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Failed to parse health response');
          console.log(`   Error: ${error.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Health check request failed');
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Health check timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test sentiment analysis endpoint
async function testSentimentEndpoint() {
  return new Promise((resolve, reject) => {
    const url = `${ML_API_URL}/sentiment`;
    const client = url.startsWith('https') ? https : http;
    
    console.log('🔍 Testing sentiment analysis endpoint...');
    
    const postData = JSON.stringify({
      text: "I am feeling great today!"
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.sentiment && response.confidence) {
            console.log('✅ Sentiment analysis working');
            console.log(`   Sentiment: ${response.sentiment}`);
            console.log(`   Confidence: ${response.confidence}`);
            resolve(true);
          } else {
            console.log('❌ Sentiment analysis failed');
            console.log(`   Response: ${data}`);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Failed to parse sentiment response');
          console.log(`   Error: ${error.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Sentiment analysis request failed');
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
    
    req.setTimeout(10000, () => {
      console.log('❌ Sentiment analysis timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test mood prediction endpoint
async function testMoodPredictionEndpoint() {
  return new Promise((resolve, reject) => {
    const url = `${ML_API_URL}/predict-mood`;
    const client = url.startsWith('https') ? https : http;
    
    console.log('🔍 Testing mood prediction endpoint...');
    
    const postData = JSON.stringify({
      emotions: ["happy", "excited"],
      note: "Feeling great today!"
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.predicted_mood && response.confidence) {
            console.log('✅ Mood prediction working');
            console.log(`   Predicted mood: ${response.predicted_mood}`);
            console.log(`   Confidence: ${response.confidence}`);
            resolve(true);
          } else {
            console.log('❌ Mood prediction failed');
            console.log(`   Response: ${data}`);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Failed to parse mood prediction response');
          console.log(`   Error: ${error.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Mood prediction request failed');
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
    
    req.setTimeout(10000, () => {
      console.log('❌ Mood prediction timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting ML Backend Integration Tests');
  console.log('=====================================');
  console.log('');
  
  const results = {
    health: await testHealthEndpoint(),
    sentiment: await testSentimentEndpoint(),
    moodPrediction: await testMoodPredictionEndpoint()
  };
  
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Sentiment Analysis: ${results.sentiment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Mood Prediction: ${results.moodPrediction ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('');
  if (allPassed) {
    console.log('🎉 All tests passed! Your ML backend is ready for production.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your Vercel environment variables');
    console.log('2. Redeploy your frontend');
    console.log('3. Test the full integration');
  } else {
    console.log('⚠️  Some tests failed. Please check your Railway deployment.');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Verify your Railway URL is correct');
    console.log('2. Check Railway deployment logs');
    console.log('3. Ensure all models are loaded');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
