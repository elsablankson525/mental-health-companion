#!/usr/bin/env python3
"""
Test script to verify ML backend works locally before Railway deployment
"""

import requests
import json
import time
import sys

def test_health_endpoint(base_url="http://localhost:5000"):
    """Test the health endpoint"""
    try:
        print(f"🧪 Testing health endpoint: {base_url}/api/health")
        response = requests.get(f"{base_url}/api/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   Status: {data.get('status')}")
            print(f"   Models loaded: {data.get('models_loaded', {})}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Is the ML backend running?")
        print("   Start it with: cd ml_backend && python app.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_sentiment_endpoint(base_url="http://localhost:5000"):
    """Test the sentiment analysis endpoint"""
    try:
        print(f"🧪 Testing sentiment endpoint: {base_url}/api/sentiment")
        
        test_data = {
            "text": "I am feeling great today! This is amazing."
        }
        
        response = requests.post(
            f"{base_url}/api/sentiment",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Sentiment analysis passed!")
            print(f"   Polarity: {data.get('polarity')}")
            print(f"   Subjectivity: {data.get('subjectivity')}")
            return True
        else:
            print(f"❌ Sentiment analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🚀 Testing ML Backend Locally")
    print("=============================\n")
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    print()
    
    if health_ok:
        # Test sentiment endpoint
        sentiment_ok = test_sentiment_endpoint()
        print()
        
        if sentiment_ok:
            print("🎉 All tests passed! ML backend is ready for Railway deployment.")
            return True
        else:
            print("⚠️  Health check passed but sentiment analysis failed.")
            return False
    else:
        print("❌ Health check failed. Please fix the issues before deploying to Railway.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
