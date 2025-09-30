#!/usr/bin/env python3
"""
Railway-specific startup script for ML Backend
Handles Railway environment variables and proper initialization
"""

import os
import sys
import logging
from pathlib import Path

# Configure logging for Railway
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def setup_railway_environment():
    """Setup Railway-specific environment variables"""
    # Set default values for Railway
    os.environ.setdefault('FLASK_ENV', 'production')
    os.environ.setdefault('FLASK_DEBUG', 'False')
    os.environ.setdefault('HOST', '0.0.0.0')
    
    # Get port from Railway
    port = os.environ.get('PORT', '5000')
    os.environ['PORT'] = port
    
    logger.info(f"Railway environment configured - Port: {port}")
    logger.info(f"FLASK_ENV: {os.environ.get('FLASK_ENV')}")
    logger.info(f"FLASK_DEBUG: {os.environ.get('FLASK_DEBUG')}")

def check_models():
    """Check if models directory exists and create if needed"""
    models_dir = Path("models")
    if not models_dir.exists():
        logger.info("Creating models directory")
        models_dir.mkdir(exist_ok=True)
    
    # Check for model files
    model_files = ['mood_predictor.joblib', 'scaler.joblib', 'vectorizer.joblib']
    for model_file in model_files:
        model_path = models_dir / model_file
        if model_path.exists():
            logger.info(f"Found model: {model_file}")
        else:
            logger.warning(f"Missing model: {model_file}")

def main():
    """Main startup function"""
    logger.info("🚀 Starting Mental Health Companion ML Backend on Railway")
    
    # Setup environment
    setup_railway_environment()
    
    # Check models
    check_models()
    
    # Import and start the Flask app
    try:
        from app import app
        
        port = int(os.environ.get('PORT', 5000))
        host = os.environ.get('HOST', '0.0.0.0')
        debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
        
        logger.info(f"Starting Flask app on {host}:{port}")
        logger.info(f"Debug mode: {debug}")
        
        # Start the app
        app.run(host=host, port=port, debug=debug)
        
    except Exception as e:
        logger.error(f"Failed to start Flask app: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
