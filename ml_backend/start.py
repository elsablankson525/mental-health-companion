#!/usr/bin/env python3
"""
Startup script for the Mental Health ML Backend
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        sys.exit(1)

def download_nltk_data():
    """Download required NLTK data"""
    print("📚 Downloading NLTK data...")
    try:
        import nltk
        nltk.download('vader_lexicon', quiet=True)
        print("✅ NLTK data downloaded")
    except Exception as e:
        print(f"⚠️  Warning: Could not download NLTK data: {e}")

def create_directories():
    """Create necessary directories"""
    directories = ['models', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✅ Directories created")

def start_server():
    """Start the Flask server"""
    print("🚀 Starting ML backend server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔗 API endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/sentiment")
    print("   - POST /api/train")
    print("   - POST /api/predict")
    print("   - POST /api/recommendations")
    print("   - POST /api/patterns")
    print("\n💡 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("🧠 Mental Health ML Backend")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    check_python_version()
    install_requirements()
    download_nltk_data()
    create_directories()
    start_server()

if __name__ == "__main__":
    main()
