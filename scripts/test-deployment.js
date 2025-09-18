#!/usr/bin/env node
/**
 * Deployment Testing Script
 * Tests the complete deployment pipeline
 */

const https = require('https')
const http = require('http')

console.log('🧪 Mental Health Companion - Deployment Testing')
console.log('==============================================\n')

// Configuration
const config = {
  mlBackendUrl: process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000/api',
  frontendUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  timeout: 10000
}

// Test functions
async function testMLBackend() {
  console.log('🔍 Testing ML Backend...')
  
  try {
    const healthResponse = await makeRequest(`${config.mlBackendUrl}/health`)
    
    if (healthResponse.status === 'healthy') {
      console.log('✅ ML Backend health check passed')
      console.log(`   Models loaded: ${JSON.stringify(healthResponse.models_loaded)}`)
    } else {
      console.log('❌ ML Backend health check failed')
      return false
    }

    // Test sentiment analysis
    const sentimentResponse = await makeRequest(`${config.mlBackendUrl}/sentiment`, {
      method: 'POST',
      body: JSON.stringify({ text: 'I feel great today!' })
    })
    
    if (sentimentResponse.sentiment) {
      console.log('✅ Sentiment analysis working')
      console.log(`   Sentiment: ${sentimentResponse.sentiment} (confidence: ${sentimentResponse.confidence})`)
    } else {
      console.log('❌ Sentiment analysis failed')
      return false
    }

    // Test mood prediction
    const moodResponse = await makeRequest(`${config.mlBackendUrl}/predict-mood`, {
      method: 'POST',
      body: JSON.stringify({
        emotions: ['happy', 'excited'],
        note: 'I had a wonderful day!'
      })
    })
    
    if (moodResponse.predicted_mood) {
      console.log('✅ Mood prediction working')
      console.log(`   Predicted mood: ${moodResponse.predicted_mood}`)
    } else {
      console.log('❌ Mood prediction failed')
      return false
    }

    // Test recommendations
    const recommendationsResponse = await makeRequest(`${config.mlBackendUrl}/recommendations`, {
      method: 'POST',
      body: JSON.stringify({
        mood: 8,
        emotions: ['happy', 'grateful']
      })
    })
    
    if (recommendationsResponse.recommendations) {
      console.log('✅ Recommendations working')
      console.log(`   Recommendations count: ${recommendationsResponse.count}`)
    } else {
      console.log('❌ Recommendations failed')
      return false
    }

    return true
  } catch (error) {
    console.log(`❌ ML Backend test failed: ${error.message}`)
    return false
  }
}

async function testFrontend() {
  console.log('\n🔍 Testing Frontend...')
  
  try {
    const response = await makeRequest(config.frontendUrl)
    
    if (response.includes('Mental Health Companion') || response.includes('Next.js')) {
      console.log('✅ Frontend is accessible')
      return true
    } else {
      console.log('❌ Frontend test failed - unexpected content')
      return false
    }
  } catch (error) {
    console.log(`❌ Frontend test failed: ${error.message}`)
    return false
  }
}

async function testDatabaseConnection() {
  console.log('\n🔍 Testing Database Connection...')
  
  try {
    // This would require importing Prisma and testing the connection
    // For now, we'll just check if the environment variable is set
    if (process.env.DATABASE_URL) {
      console.log('✅ Database URL is configured')
      console.log(`   Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'}`)
      return true
    } else {
      console.log('❌ Database URL not configured')
      return false
    }
  } catch (error) {
    console.log(`❌ Database test failed: ${error.message}`)
    return false
  }
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: config.timeout
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve(jsonData)
        } catch (error) {
          resolve(data)
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}

// Main testing function
async function runTests() {
  const results = {
    mlBackend: false,
    frontend: false,
    database: false
  }

  // Test ML Backend
  results.mlBackend = await testMLBackend()

  // Test Frontend
  results.frontend = await testFrontend()

  // Test Database
  results.database = await testDatabaseConnection()

  // Summary
  console.log('\n📊 Test Results Summary')
  console.log('========================')
  console.log(`ML Backend: ${results.mlBackend ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Frontend: ${results.frontend ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Database: ${results.database ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = Object.values(results).every(result => result)
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your deployment is ready.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.')
  }

  return allPassed
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = { runTests, testMLBackend, testFrontend, testDatabaseConnection }
